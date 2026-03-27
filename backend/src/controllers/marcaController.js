const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateSlug(nome) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

exports.getAllMarcas = async (req, res) => {
  try {
    const marcas = await prisma.marca.findMany({ orderBy: { nome: 'asc' } });
    res.json(marcas);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar marcas.' });
  }
};

exports.createMarca = async (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ message: 'Nome é obrigatório.' });
  const slug = generateSlug(nome);
  try {
    const marca = await prisma.marca.create({ data: { nome, slug } });
    res.status(201).json(marca);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'Marca já existe.' });
    res.status(500).json({ message: 'Erro ao criar marca.' });
  }
};

exports.updateMarca = async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  const slug = generateSlug(nome);
  try {
    const marca = await prisma.marca.update({ where: { id }, data: { nome, slug } });
    res.json(marca);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Marca não encontrada.' });
    res.status(500).json({ message: 'Erro ao atualizar marca.' });
  }
};

exports.deleteMarca = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.marca.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Marca não encontrada.' });
    if (error.code === 'P2003') return res.status(400).json({ message: 'Não é possível deletar uma marca com produtos associados.' });
    res.status(500).json({ message: 'Erro ao deletar marca.' });
  }
};
