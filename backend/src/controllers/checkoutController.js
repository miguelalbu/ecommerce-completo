// src/controllers/checkoutController.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

exports.placeOrder = async (req, res) => {
  const { cartItems, address, isPickup, cupomCodigo, paymentMethod } = req.body;
  const userId = req.user?.id;

  if (!cartItems || cartItems.length === 0 || !address) {
    return res.status(400).json({ message: 'Carrinho e endereço são obrigatórios.' });
  }

  try {
    let newCustomerToken = null;
    let resolvedUserId = userId;

    // ── Criar conta se convidado enviou email + senha ──────────────────────────
    if (!userId && address.email && address.senha) {
      const emailExistente = await prisma.cliente.findUnique({
        where: { email: address.email.toLowerCase().trim() },
      });
      if (emailExistente) {
        return res.status(400).json({
          message: 'Este e-mail já está cadastrado. Faça login para continuar.',
        });
      }

      const senhaHash = await bcrypt.hash(address.senha, 10);
      const novoCliente = await prisma.cliente.create({
        data: {
          nome: address.nome?.trim() || '',
          email: address.email.toLowerCase().trim(),
          telefone: address.telefone || null,
          senhaHash,
        },
      });

      resolvedUserId = novoCliente.id;

      newCustomerToken = jwt.sign(
        { id: novoCliente.id, role: 'CUSTOMER' },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Buscar produtos
      const productIds = cartItems.map(item => item.id);
      const productsFromDb = await tx.produto.findMany({
        where: { id: { in: productIds } },
      });

      let total = 0;
      const orderItemsData = [];

      // 2. Validar estoque e calcular total
      for (const cartItem of cartItems) {
        const product = productsFromDb.find(p => p.id === cartItem.id);
        if (!product) throw new Error(`Produto ID ${cartItem.id} não encontrado.`);
        if (product.estoque < cartItem.quantity) {
          throw new Error(`Estoque insuficiente: ${product.nome}. Restam: ${product.estoque}`);
        }
        total += Number(product.preco) * cartItem.quantity;
        orderItemsData.push({
          produtoId: product.id,
          quantidade: cartItem.quantity,
          precoNoMomentoDaCompra: product.preco,
        });
      }

      // 3. Cupom
      let desconto = 0;
      let cupomId = null;

      if (cupomCodigo) {
        const cupom = await tx.cupom.findUnique({ where: { codigo: cupomCodigo.toUpperCase().trim() } });
        if (!cupom) throw new Error('Cupom não encontrado.');
        if (!cupom.ativo) throw new Error('Este cupom não está ativo.');
        if (cupom.dataExpiracao && new Date() > cupom.dataExpiracao) throw new Error('Este cupom está expirado.');
        if (cupom.usosMaximos !== null && cupom.usosAtuais >= cupom.usosMaximos) {
          throw new Error('Este cupom atingiu o limite de usos.');
        }
        if (cupom.minimo !== null && total < Number(cupom.minimo)) {
          throw new Error(`Pedido mínimo de R$ ${Number(cupom.minimo).toFixed(2)} para este cupom.`);
        }

        desconto = cupom.tipo === 'PERCENTUAL'
          ? (total * Number(cupom.valor)) / 100
          : Math.min(Number(cupom.valor), total);
        desconto = parseFloat(desconto.toFixed(2));
        cupomId = cupom.id;
        await tx.cupom.update({ where: { id: cupom.id }, data: { usosAtuais: { increment: 1 } } });
      }

      total = parseFloat((total - desconto).toFixed(2));

      // 4. Texto de entrega
      let deliveryInfoString = '';
      if (isPickup) {
        deliveryInfoString = `[RETIRADA NA LOJA]\nLocal: ${address.complemento || 'Loja Física'}\nEndereço da Loja: ${address.rua}, ${address.numero}, ${address.bairro} - ${address.cidade}/${address.estado}.`;
      } else {
        deliveryInfoString = `[ENTREGA EM DOMICÍLIO]\nEndereço: ${address.rua}, ${address.numero}\nBairro: ${address.bairro}\nCidade: ${address.cidade}/${address.estado}\nCEP: ${address.cep}\nComplemento: ${address.complemento || 'N/A'}`;
      }

      // 5. Salvar endereço como principal (logado ou recém criado, sempre em entregas)
      if (resolvedUserId && !address.id && !isPickup) {
        // Remove outros endereços principais antes
        await tx.endereco.updateMany({
          where: { clienteId: resolvedUserId, principal: true },
          data: { principal: false },
        });

        const { id: _id, nome: _nome, email: _email, telefone: _tel,
                senha: _s, confirmarSenha: _cs, sobrenome: _sob,
                cpf: _cpf, ...enderecoLimpo } = address;

        await tx.endereco.create({
          data: {
            ...enderecoLimpo,
            principal: true,
            cliente: { connect: { id: resolvedUserId } },
          },
        });
      }

      // 6. Montar pedido
      const clienteNome = resolvedUserId
        ? undefined
        : `${address.nome || ''}`.trim();

      const clienteTelefone = resolvedUserId && !userId
        ? address.telefone || null   // recém criado
        : !resolvedUserId
          ? address.telefone || null // ainda convidado sem conta
          : undefined;

      const pedidoData = {
        valor_total: total,
        desconto: desconto > 0 ? desconto : null,
        status: 'PENDENTE',
        observacao: deliveryInfoString,
        forma_pagamento: paymentMethod || null,
        ...(clienteNome !== undefined && { cliente_nome: clienteNome }),
        ...(clienteTelefone !== undefined && { cliente_telefone: clienteTelefone }),
      };

      if (cupomId) pedidoData.cupom = { connect: { id: cupomId } };
      if (resolvedUserId) pedidoData.cliente = { connect: { id: resolvedUserId } };

      // 7. Criar pedido e itens
      const createdOrder = await tx.pedido.create({ data: pedidoData });

      if (orderItemsData.length > 0) {
        await tx.itemPedido.createMany({
          data: orderItemsData.map(item => ({ ...item, pedidoId: createdOrder.id })),
        });
      }

      const fullOrder = await tx.pedido.findUnique({
        where: { id: createdOrder.id },
        include: { itens: { include: { produto: true } } },
      });

      return fullOrder;
    });

    return res.status(201).json({
      ...result,
      ...(newCustomerToken && { token: newCustomerToken }),
    });

  } catch (error) {
    console.error('Erro checkout:', error);
    return res.status(400).json({ message: error.message || 'Erro ao processar pedido.' });
  }
};
