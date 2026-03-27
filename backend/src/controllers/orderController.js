const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { registrarLog } = require('../services/logService');

// Listar todos os pedidos
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.pedido.findMany({
      orderBy: {
        criadoEm: 'desc',
      },
      include: {
        cliente: true,
        loja: true,
      },
    });
    res.json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ message: "Erro ao buscar pedidos." });
  }
};

exports.createOrder = async (req, res) => {
  const { valor_total, status, clienteId, cliente_nome, items, observacao, lojaId } = req.body;

  if (!valor_total || !items || items.length === 0) {
    return res.status(400).json({ message: 'O pedido precisa ter valor total e itens.' });
  }

  try {
    // Usamos $transaction para garantir que se o estoque falhar, o pedido não é criado
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Verificar Estoque de todos os itens antes de começar
      for (const item of items) {
        const produto = await tx.produto.findUnique({ where: { id: item.productId } });
        
        if (!produto) {
          throw new Error(`Produto ID ${item.productId} não encontrado.`);
        }
        if (produto.estoque < item.quantity) {
          throw new Error(`Estoque insuficiente para o produto: ${produto.nome}. Disponível: ${produto.estoque}`);
        }
      }

      // 2. Criar o Pedido Principal
      const newOrder = await tx.pedido.create({
        data: {
          valor_total: parseFloat(valor_total),
          status: status || 'PROCESSANDO',
          // Se clienteId vier, usa ele. Se não, deixa null.
          clienteId: clienteId || null,
          cliente_nome: cliente_nome || 'Cliente Balcão',
          observacao: observacao || null,
          lojaId: lojaId || null,
        },
      });

      // 3. Processar Itens: Criar registro do item e Descontar Estoque
      for (const item of items) {
        // A. Criar o relacionamento na tabela ItemPedido (se ela existir no seu schema)
        // Se você não tiver tabela de itens separada, pode pular essa parte 'A', 
        // mas é essencial para histórico.
        await tx.itemPedido.create({
          data: {
            pedidoId: newOrder.id,
            produtoId: item.productId,
            quantidade: item.quantity,
            precoNoMomentoDaCompra: item.unitPrice
          }
        });

        // B. Descontar do Estoque
        await tx.produto.update({
          where: { id: item.productId },
          data: {
            estoque: {
              decrement: item.quantity
            }
          }
        });
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
    console.error("Erro ao processar pedido:", error);
    // Retorna mensagem amigável se for erro de estoque
    res.status(400).json({ 
      message: error.message || "Erro ao criar pedido.", 
      details: error.message 
    });
  }
};

exports.getMyOrders = async (req, res) => {
  // O middleware de autenticação deve popular req.user com os dados do token
  const userId = req.user?.id || req.userId; 

  if (!userId) {
    return res.status(401).json({ message: "Usuário não identificado." });
  }

  try {
    const orders = await prisma.pedido.findMany({
      where: {
        clienteId: userId // Filtra apenas pedidos deste usuário
      },
      orderBy: {
        criadoEm: 'desc', // Mais recentes primeiro
      },
      include: {
        itens: {
          include: {
            produto: true // Traz nome do produto para exibir no resumo se quiser
          }
        }
      },
    });
    res.json(orders);
  } catch (error) {
    console.error("Erro ao buscar meus pedidos:", error);
    res.status(500).json({ message: "Erro ao buscar seus pedidos." });
  }
};

exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  const { status, codigoRastreio } = req.body;

  const VALID_STATUSES = ['PROCESSANDO', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELED'];

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

      // Se está cancelando um pedido que não estava cancelado → restaura estoque
      if (status === 'CANCELED' && order.status !== 'CANCELED') {
        for (const item of order.itens) {
          await tx.produto.update({
            where: { id: item.produtoId },
            data: { estoque: { increment: item.quantidade } },
          });
        }
      }

      const updatedOrder = await tx.pedido.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(codigoRastreio !== undefined && { codigoRastreio }),
        },
      });

      return updatedOrder;
    });

    await registrarLog({
      usuarioId: req.user.id,
      usuarioNome: req.user.nome,
      acao: 'UPDATE_ORDER',
      descricao: `Atualizou o pedido ID ${id}${status ? ` → status: ${status}` : ''}`,
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

exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: true,
        loja: true,
        itens: {
          include: {
            produto: true
          }
        }
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }
    res.json(order);
  } catch (error) {
    console.error("Erro ao buscar detalhes do pedido:", error);
    res.status(500).json({ message: "Erro ao buscar detalhes do pedido." });
  }
};