// src/controllers/gastosController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllGastos = async (req, res) => {
  const { categoria, dataInicio, dataFim } = req.query;
  try {
    const where = {};
    if (categoria) where.categoria = categoria;
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = new Date(dataInicio);
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        where.data.lte = fim;
      }
    }

    const gastos = await prisma.gasto.findMany({
      where,
      orderBy: { data: 'desc' },
    });
    res.json(gastos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar gastos.' });
  }
};

exports.createGasto = async (req, res) => {
  const { descricao, valor, categoria, data, observacao } = req.body;

  if (!descricao || valor === undefined || !categoria || !data) {
    return res.status(400).json({ message: 'Descrição, valor, categoria e data são obrigatórios.' });
  }

  try {
    const gasto = await prisma.gasto.create({
      data: {
        descricao: descricao.trim(),
        valor: parseFloat(valor),
        categoria,
        data: new Date(data),
        observacao: observacao?.trim() || null,
        criadoPor: req.user.nome || req.user.email,
      },
    });
    res.status(201).json(gasto);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar gasto.' });
  }
};

exports.updateGasto = async (req, res) => {
  const { id } = req.params;
  const { descricao, valor, categoria, data, observacao } = req.body;

  try {
    const data_update = {};
    if (descricao !== undefined) data_update.descricao = descricao.trim();
    if (valor !== undefined) data_update.valor = parseFloat(valor);
    if (categoria !== undefined) data_update.categoria = categoria;
    if (data !== undefined) data_update.data = new Date(data);
    if (observacao !== undefined) data_update.observacao = observacao?.trim() || null;

    const gasto = await prisma.gasto.update({ where: { id }, data: data_update });
    res.json(gasto);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Gasto não encontrado.' });
    res.status(500).json({ message: 'Erro ao atualizar gasto.' });
  }
};

exports.deleteGasto = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.gasto.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Gasto não encontrado.' });
    res.status(500).json({ message: 'Erro ao deletar gasto.' });
  }
};

exports.getResumoGastos = async (req, res) => {
  const { dataInicio, dataFim } = req.query;
  try {
    const where = {};
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = new Date(dataInicio);
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        where.data.lte = fim;
      }
    }

    const gastos = await prisma.gasto.findMany({ where, select: { categoria: true, valor: true } });

    const totalGeral = gastos.reduce((sum, g) => sum + Number(g.valor), 0);
    const porCategoria = gastos.reduce((acc, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + Number(g.valor);
      return acc;
    }, {});

    res.json({ totalGeral, porCategoria });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar resumo.' });
  }
};
