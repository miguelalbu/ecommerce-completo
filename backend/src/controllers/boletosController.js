// src/controllers/boletosController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const calcularStatus = (boleto) => {
  if (boleto.status === 'PAGO') return 'PAGO';
  return new Date() > new Date(boleto.dataVencimento) ? 'VENCIDO' : 'PENDENTE';
};

exports.getAllBoletos = async (req, res) => {
  const { status } = req.query;
  try {
    const boletos = await prisma.boleto.findMany({
      orderBy: { dataVencimento: 'asc' },
    });

    const boletosComStatus = boletos.map((b) => ({
      ...b,
      statusEfetivo: calcularStatus(b),
    }));

    const filtrados = status
      ? boletosComStatus.filter((b) => b.statusEfetivo === status.toUpperCase())
      : boletosComStatus;

    res.json(filtrados);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar boletos.' });
  }
};

exports.createBoleto = async (req, res) => {
  const { descricao, valor, dataVencimento, codigoBarras, linhaDigitavel, banco, observacao } = req.body;

  if (!descricao || valor === undefined || !dataVencimento) {
    return res.status(400).json({ message: 'Descrição, valor e data de vencimento são obrigatórios.' });
  }

  try {
    const boleto = await prisma.boleto.create({
      data: {
        descricao: descricao.trim(),
        valor: parseFloat(valor),
        dataVencimento: new Date(dataVencimento),
        codigoBarras: codigoBarras?.replace(/\D/g, '') || null,
        linhaDigitavel: linhaDigitavel?.replace(/\s/g, '') || null,
        banco: banco?.trim() || null,
        observacao: observacao?.trim() || null,
        status: 'PENDENTE',
        criadoPor: req.user.nome || req.user.email,
      },
    });
    res.status(201).json({ ...boleto, statusEfetivo: calcularStatus(boleto) });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar boleto.' });
  }
};

exports.updateBoleto = async (req, res) => {
  const { id } = req.params;
  const { descricao, valor, dataVencimento, codigoBarras, linhaDigitavel, banco, observacao, status } = req.body;

  try {
    const data = {};
    if (descricao !== undefined) data.descricao = descricao.trim();
    if (valor !== undefined) data.valor = parseFloat(valor);
    if (dataVencimento !== undefined) data.dataVencimento = new Date(dataVencimento);
    if (codigoBarras !== undefined) data.codigoBarras = codigoBarras?.replace(/\D/g, '') || null;
    if (linhaDigitavel !== undefined) data.linhaDigitavel = linhaDigitavel?.replace(/\s/g, '') || null;
    if (banco !== undefined) data.banco = banco?.trim() || null;
    if (observacao !== undefined) data.observacao = observacao?.trim() || null;
    if (status !== undefined) {
      if (!['PENDENTE', 'PAGO'].includes(status)) {
        return res.status(400).json({ message: 'Status inválido. Use PENDENTE ou PAGO.' });
      }
      data.status = status;
      data.dataPagamento = status === 'PAGO' ? new Date() : null;
    }

    const boleto = await prisma.boleto.update({ where: { id }, data });
    res.json({ ...boleto, statusEfetivo: calcularStatus(boleto) });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Boleto não encontrado.' });
    res.status(500).json({ message: 'Erro ao atualizar boleto.' });
  }
};

exports.deleteBoleto = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.boleto.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Boleto não encontrado.' });
    res.status(500).json({ message: 'Erro ao deletar boleto.' });
  }
};
