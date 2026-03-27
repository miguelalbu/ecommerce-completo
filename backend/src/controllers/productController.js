const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { registrarLog } = require('../services/logService');

exports.getAllProducts = async (req, res) => {
  const { search, categoryId, marcaId, subcategoriaId, sortBy, featuredOnly, includeHidden } = req.query;

  const whereCondition = {
    ...(search && { nome: { contains: search, mode: 'insensitive' } }),
    ...(categoryId && { categoriaId: categoryId }),
    ...(marcaId && { marcaId: marcaId }),
    ...(subcategoriaId && { subcategoriaId: subcategoriaId }),
    ...(featuredOnly === 'true' && { isFeatured: true }),
    ...(includeHidden !== 'true' && { showInCatalog: true }),
  };

  let orderByCondition = {};
  switch (sortBy) {
    case 'price-asc': orderByCondition = { preco: 'asc' }; break;
    case 'price-desc': orderByCondition = { preco: 'desc' }; break;
    case 'name': orderByCondition = { nome: 'asc' }; break;
    default: orderByCondition = { criadoEm: 'desc' }; break;
  }

  try {
    const products = await prisma.produto.findMany({
      where: whereCondition,
      orderBy: orderByCondition,
      include: { categoria: true, marca: true, subcategoria: true },
    });
    res.json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ message: "Erro ao buscar produtos." });
  }
};

exports.createProduct = async (req, res) => {
  const { name, description, price, purchasePrice, stock, categoryId, marcaId, subcategoriaId, isFeatured, showInCatalog, volume, unidade } = req.body;

  const imageUrl = req.file ? `uploads/${req.file.filename}` : null;

  try {
    const newProduct = await prisma.produto.create({
      data: {
        nome: name,
        descricao: description,
        preco: parseFloat(price),
        precoCompra: purchasePrice ? parseFloat(purchasePrice) : null,
        estoque: parseInt(stock, 10),
        categoriaId: categoryId,
        marcaId: marcaId || null,
        subcategoriaId: subcategoriaId || null,
        imageUrl: imageUrl,
        isFeatured: isFeatured === 'true' || isFeatured === true,
        showInCatalog: showInCatalog === undefined ? true : (showInCatalog === 'true' || showInCatalog === true),
        volume: volume ? parseInt(volume, 10) : null,
        unidade: unidade || null,
      },
    });
    await registrarLog({
      usuarioId: req.user.id,
      usuarioNome: req.user.nome,
      acao: 'CREATE_PRODUCT',
      descricao: `Adicionou o produto "${name}"`,
      entidade: 'PRODUTO',
      entidadeId: newProduct.id,
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ message: "Erro ao criar produto", error });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.produto.findUnique({
      where: { id },
      include: { categoria: true, marca: true, subcategoria: true },
    });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produto.', error });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.produto.delete({ where: { id } });
    await registrarLog({
      usuarioId: req.user.id,
      usuarioNome: req.user.nome,
      acao: 'DELETE_PRODUCT',
      descricao: `Removeu o produto ID ${id}`,
      entidade: 'PRODUTO',
      entidadeId: id,
    });
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    if (error.code === 'P2025') return res.status(404).json({ message: 'Produto não encontrado para deleção.' });
    if (error.code === 'P2003') return res.status(400).json({ message: 'Não é possível deletar este produto pois ele está associado a um ou mais pedidos.' });
    res.status(500).json({ message: 'Erro interno ao deletar produto.' });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, purchasePrice, stock, categoryId, marcaId, subcategoriaId, isFeatured, showInCatalog, volume, unidade } = req.body;

  const dataToUpdate = {
    nome: name,
    descricao: description,
    preco: parseFloat(price),
    precoCompra: purchasePrice ? parseFloat(purchasePrice) : null,
    estoque: parseInt(stock, 10),
    ...(categoryId && categoryId !== 'undefined' && { categoriaId: categoryId }),
    marcaId: marcaId && marcaId !== 'undefined' ? marcaId : null,
    subcategoriaId: subcategoriaId && subcategoriaId !== 'undefined' ? subcategoriaId : null,
    isFeatured: isFeatured === 'true' || isFeatured === true,
    showInCatalog: showInCatalog === 'true' || showInCatalog === true,
    volume: volume ? parseInt(volume, 10) : null,
    unidade: unidade || null,
  };

  if (req.file) {
    dataToUpdate.imageUrl = `uploads/${req.file.filename}`;
  }

  try {
    const updatedProduct = await prisma.produto.update({
      where: { id },
      data: dataToUpdate,
    });
    await registrarLog({
      usuarioId: req.user.id,
      usuarioNome: req.user.nome,
      acao: 'UPDATE_PRODUCT',
      descricao: `Editou o produto "${name}"`,
      entidade: 'PRODUTO',
      entidadeId: id,
    });
    res.json(updatedProduct);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Produto não encontrado para atualização.' });
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({ message: 'Erro ao atualizar produto.', error });
  }
};
