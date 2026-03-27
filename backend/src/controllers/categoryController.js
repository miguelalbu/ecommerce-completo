const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { registrarLog } = require('../services/logService');

function generateSlug(nome) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

exports.getAllCategories = async (req, res) => {
  const categories = await prisma.categoria.findMany({
    include: { subcategorias: { orderBy: { nome: 'asc' } } },
    orderBy: { nome: 'asc' },
  });
  res.json(categories);
};

exports.createCategory = async (req, res) => {
  const { name } = req.body;
  const slug = generateSlug(name);
  try {
    const newCategory = await prisma.categoria.create({ data: { nome: name, slug } });
    await registrarLog({
      usuarioId: req.user.id,
      usuarioNome: req.user.nome,
      acao: 'CREATE_CATEGORY',
      descricao: `Criou a categoria "${name}"`,
      entidade: 'CATEGORIA',
      entidadeId: newCategory.id,
    });
    res.status(201).json(newCategory);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'Categoria já existe.' });
    res.status(500).json({ message: 'Erro ao criar categoria.' });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const slug = generateSlug(name);
  try {
    const cat = await prisma.categoria.update({ where: { id }, data: { nome: name, slug } });
    await registrarLog({
      usuarioId: req.user.id,
      usuarioNome: req.user.nome,
      acao: 'UPDATE_CATEGORY',
      descricao: `Renomeou a categoria para "${name}"`,
      entidade: 'CATEGORIA',
      entidadeId: id,
    });
    res.json(cat);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Categoria não encontrada.' });
    res.status(500).json({ message: 'Erro ao atualizar categoria.' });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const productsInCategory = await prisma.produto.count({ where: { categoriaId: id } });
    if (productsInCategory > 0) {
      return res.status(400).json({ message: 'Não é possível deletar uma categoria que contém produtos.' });
    }
    await prisma.categoria.delete({ where: { id } });
    await registrarLog({
      usuarioId: req.user.id,
      usuarioNome: req.user.nome,
      acao: 'DELETE_CATEGORY',
      descricao: `Removeu a categoria ID ${id}`,
      entidade: 'CATEGORIA',
      entidadeId: id,
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Categoria não encontrada.' });
    console.error("Erro ao deletar categoria:", error);
    res.status(500).json({ message: 'Erro ao deletar categoria.' });
  }
};

exports.createSubcategoria = async (req, res) => {
  const { categoriaId } = req.params;
  const { nome } = req.body;
  const slug = generateSlug(nome);
  try {
    const sub = await prisma.subcategoria.create({ data: { nome, slug, categoriaId } });
    await registrarLog({
      usuarioId: req.user.id,
      usuarioNome: req.user.nome,
      acao: 'CREATE_SUBCATEGORY',
      descricao: `Criou a subcategoria "${nome}" na categoria ID ${categoriaId}`,
      entidade: 'SUBCATEGORIA',
      entidadeId: sub.id,
    });
    res.status(201).json(sub);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'Subcategoria já existe nesta categoria.' });
    res.status(500).json({ message: 'Erro ao criar subcategoria.' });
  }
};

exports.deleteSubcategoria = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.subcategoria.delete({ where: { id } });
    await registrarLog({
      usuarioId: req.user.id,
      usuarioNome: req.user.nome,
      acao: 'DELETE_SUBCATEGORY',
      descricao: `Removeu a subcategoria ID ${id}`,
      entidade: 'SUBCATEGORIA',
      entidadeId: id,
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Subcategoria não encontrada.' });
    if (error.code === 'P2003') return res.status(400).json({ message: 'Não é possível deletar uma subcategoria com produtos associados.' });
    res.status(500).json({ message: 'Erro ao deletar subcategoria.' });
  }
};
