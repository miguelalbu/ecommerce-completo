const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { registrarLog } = require('../services/logService');

// Fluxo de status válidos e transições permitidas
const VALID_STATUSES = ['PENDENTE', 'CONFIRMADO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO'];

// Statuses que já tiveram estoque baixado (ao cancelar, deve devolver)
const STATUSES_COM_ESTOQUE_BAIXADO = ['CONFIRMADO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE'];

// Listar todos os pedidos (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const where = status ? { status } : {};

    const orders = await prisma.pedido.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: {
        cliente: { select: { id: true, nome: true, sobrenome: true, email: true, telefone: true } },
        loja: true,
        itens: { include: { produto: { select: { id: true, nome: true } } } },
      },
    });
    res.json(orders);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ message: 'Erro ao buscar pedidos.' });
  }
};

// Detalhe de um pedido
exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: true,
        loja: true,
        itens: { include: { produto: true } },
        cupom: true,
      },
    });
    if (!order) return res.status(404).json({ message: 'Pedido não encontrado.' });
    res.json(order);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ message: 'Erro ao buscar detalhes do pedido.' });
  }
};

// Meus pedidos (cliente logado)
exports.getMyOrders = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Usuário não identificado.' });

  try {
    const orders = await prisma.pedido.findMany({
      where: { clienteId: userId },
      orderBy: { criadoEm: 'desc' },
      include: {
        itens: { include: { produto: true } },
      },
    });
    res.json(orders);
  } catch (error) {
    console.error('Erro ao buscar meus pedidos:', error);
    res.status(500).json({ message: 'Erro ao buscar seus pedidos.' });
  }
};

// Criar pedido manualmente no balcão (vendedor)
exports.createOrder = async (req, res) => {
  const { valor_total, status, clienteId, cliente_nome, items, observacao, lojaId, forma_pagamento } = req.body;

  if (!valor_total || !items || items.length === 0) {
    return res.status(400).json({ message: 'O pedido precisa ter valor total e itens.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Verificar estoque
      for (const item of items) {
        const produto = await tx.produto.findUnique({ where: { id: item.productId } });
        if (!produto) throw new Error(`Produto ID ${item.productId} não encontrado.`);
        if (produto.estoque < item.quantity) {
          throw new Error(`Estoque insuficiente para: ${produto.nome}. Disponível: ${produto.estoque}`);
        }
      }

      // Pedido de balcão entra direto como CONFIRMADO (venda presencial já confirmada)
      const statusFinal = status || 'CONFIRMADO';

      const newOrder = await tx.pedido.create({
        data: {
          valor_total: parseFloat(valor_total),
          status: statusFinal,
          clienteId: clienteId || null,
          cliente_nome: cliente_nome || 'Cliente Balcão',
          observacao: observacao || null,
          lojaId: lojaId || null,
          forma_pagamento: forma_pagamento || null,
        },
      });

      for (const item of items) {
        await tx.itemPedido.create({
          data: {
            pedidoId: newOrder.id,
            produtoId: item.productId,
            quantidade: item.quantity,
            precoNoMomentoDaCompra: item.unitPrice,
          },
        });

        // Balcão = baixa estoque imediatamente (venda confirmada)
        if (STATUSES_COM_ESTOQUE_BAIXADO.includes(statusFinal)) {
          await tx.produto.update({
            where: { id: item.productId },
            data: { estoque: { decrement: item.quantity } },
          });
        }
      }

      return newOrder;
    });

    await registrarLog({
      usuarioId: req.user.id,
      usuarioNome: req.user.nome,
      acao: 'CREATE_ORDER',
      descricao: `Registrou venda no balcão — Total: R$ ${parseFloat(valor_total).toFixed(2)}`,
      entidade: 'PEDIDO',
      entidadeId: result.id,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Erro ao processar pedido:', error);
    res.status(400).json({ message: error.message || 'Erro ao criar pedido.' });
  }
};

// Atualizar status do pedido
exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  const { status, codigoRastreio, forma_pagamento, observacao } = req.body;

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status inválido. Use: ${VALID_STATUSES.join(', ')}` });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.pedido.findUnique({
        where: { id },
        include: { itens: true },
      });

      if (!order) throw Object.assign(new Error('Pedido não encontrado.'), { statusCode: 404 });

      const statusAtual = order.status;

      if (status && status !== statusAtual) {
        // PENDENTE → CONFIRMADO: baixar estoque
        if (status === 'CONFIRMADO' && statusAtual === 'PENDENTE') {
          for (const item of order.itens) {
            const produto = await tx.produto.findUnique({ where: { id: item.produtoId } });
            if (!produto) throw new Error(`Produto não encontrado.`);
            if (produto.estoque < item.quantidade) {
              throw new Error(`Estoque insuficiente: ${produto.nome}. Disponível: ${produto.estoque}`);
            }
            await tx.produto.update({
              where: { id: item.produtoId },
              data: { estoque: { decrement: item.quantidade } },
            });
          }
        }

        // Qualquer status com estoque → CANCELADO: devolver estoque
        if (status === 'CANCELADO' && STATUSES_COM_ESTOQUE_BAIXADO.includes(statusAtual)) {
          for (const item of order.itens) {
            await tx.produto.update({
              where: { id: item.produtoId },
              data: { estoque: { increment: item.quantidade } },
            });
          }
        }
      }

      const updatedOrder = await tx.pedido.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(codigoRastreio !== undefined && { codigoRastreio }),
          ...(forma_pagamento !== undefined && { forma_pagamento }),
          ...(observacao !== undefined && { observacao }),
        },
      });

      return updatedOrder;
    });

    await registrarLog({
      usuarioId: req.user.id,
      usuarioNome: req.user.nome,
      acao: 'UPDATE_ORDER',
      descricao: `Atualizou pedido #${id.substring(0, 8).toUpperCase()}${status ? ` → ${status}` : ''}`,
      entidade: 'PEDIDO',
      entidadeId: id,
    });

    res.json(result);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || 'Erro ao atualizar pedido.' });
  }
};

// Editar itens do pedido (vendedor ajusta após conversa no WhatsApp)
exports.editOrderItems = async (req, res) => {
  const { id } = req.params;
  const { items, desconto, forma_pagamento } = req.body;
  // items: [{ produtoId, quantidade, precoUnitario }]

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'O pedido precisa ter ao menos um item.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.pedido.findUnique({
        where: { id },
        include: { itens: true },
      });

      if (!order) throw Object.assign(new Error('Pedido não encontrado.'), { statusCode: 404 });

      const editaveisStatuses = ['PENDENTE', 'CONFIRMADO'];
      if (!editaveisStatuses.includes(order.status)) {
        throw Object.assign(
          new Error(`Não é possível editar um pedido com status ${order.status}.`),
          { statusCode: 400 }
        );
      }

      // Validar novos produtos e calcular novo total
      let novoTotal = 0;
      const novosItens = [];

      for (const item of items) {
        const produto = await tx.produto.findUnique({ where: { id: item.produtoId } });
        if (!produto) throw new Error(`Produto ID ${item.produtoId} não encontrado.`);

        const preco = item.precoUnitario ?? Number(produto.preco);
        novoTotal += preco * item.quantidade;
        novosItens.push({ produtoId: item.produtoId, quantidade: item.quantidade, preco });
      }

      // Se CONFIRMADO: devolver estoque antigo e baixar novo
      if (order.status === 'CONFIRMADO') {
        for (const itemAntigo of order.itens) {
          await tx.produto.update({
            where: { id: itemAntigo.produtoId },
            data: { estoque: { increment: itemAntigo.quantidade } },
          });
        }
        for (const novoItem of novosItens) {
          const produto = await tx.produto.findUnique({ where: { id: novoItem.produtoId } });
          if (produto.estoque < novoItem.quantidade) {
            throw new Error(`Estoque insuficiente: ${produto.nome}. Disponível: ${produto.estoque}`);
          }
          await tx.produto.update({
            where: { id: novoItem.produtoId },
            data: { estoque: { decrement: novoItem.quantidade } },
          });
        }
      }

      // Substituir todos os itens
      await tx.itemPedido.deleteMany({ where: { pedidoId: id } });
      await tx.itemPedido.createMany({
        data: novosItens.map(i => ({
          pedidoId: id,
          produtoId: i.produtoId,
          quantidade: i.quantidade,
          precoNoMomentoDaCompra: i.preco,
        })),
      });

      const descontoFinal = desconto !== undefined ? parseFloat(desconto) : Number(order.desconto ?? 0);
      const totalFinal = parseFloat((novoTotal - descontoFinal).toFixed(2));

      const updatedOrder = await tx.pedido.update({
        where: { id },
        data: {
          valor_total: totalFinal,
          desconto: descontoFinal > 0 ? descontoFinal : null,
          ...(forma_pagamento !== undefined && { forma_pagamento }),
        },
        include: { itens: { include: { produto: true } } },
      });

      return updatedOrder;
    });

    await registrarLog({
      usuarioId: req.user.id,
      usuarioNome: req.user.nome,
      acao: 'EDIT_ORDER_ITEMS',
      descricao: `Editou itens do pedido #${id.substring(0, 8).toUpperCase()}`,
      entidade: 'PEDIDO',
      entidadeId: id,
    });

    res.json(result);
  } catch (error) {
    console.error('Erro ao editar itens do pedido:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || 'Erro ao editar pedido.' });
  }
};
