const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const marcaController = require('../controllers/marcaController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ===== CATEGORIAS =====

/**
 * @swagger
 * /api/shop/categories:
 *   get:
 *     summary: Listar todas as categorias
 *     tags:
 *       - Shop - Categorias
 *     security: []
 *     responses:
 *       '200':
 *         description: Lista de categorias
 */
router.get('/categories', categoryController.getAllCategories);

/**
 * @swagger
 * /api/shop/categories:
 *   post:
 *     summary: Criar categoria
 *     tags:
 *       - Shop - Categorias
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Categoria criada com sucesso
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.post('/categories', protect, authorize('ADMIN'), categoryController.createCategory);

/**
 * @swagger
 * /api/shop/categories/{id}:
 *   put:
 *     summary: Atualizar categoria
 *     tags:
 *       - Shop - Categorias
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Categoria atualizada com sucesso
 *       '404':
 *         description: Categoria não encontrada
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.put('/categories/:id', protect, authorize('ADMIN'), categoryController.updateCategory);

/**
 * @swagger
 * /api/shop/categories/{id}:
 *   delete:
 *     summary: Deletar categoria
 *     tags:
 *       - Shop - Categorias
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Categoria deletada com sucesso
 *       '404':
 *         description: Categoria não encontrada
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.delete('/categories/:id', protect, authorize('ADMIN'), categoryController.deleteCategory);

/**
 * @swagger
 * /api/shop/categories/{categoriaId}/subcategorias:
 *   post:
 *     summary: Criar subcategoria
 *     tags:
 *       - Shop - Categorias
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoriaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '201':
 *         description: Subcategoria criada com sucesso
 *       '404':
 *         description: Categoria pai não encontrada
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.post('/categories/:categoriaId/subcategorias', protect, authorize('ADMIN'), categoryController.createSubcategoria);

/**
 * @swagger
 * /api/shop/subcategorias/{id}:
 *   delete:
 *     summary: Deletar subcategoria
 *     tags:
 *       - Shop - Categorias
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Subcategoria deletada com sucesso
 *       '404':
 *         description: Subcategoria não encontrada
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.delete('/subcategorias/:id', protect, authorize('ADMIN'), categoryController.deleteSubcategoria);

// ===== MARCAS =====

/**
 * @swagger
 * /api/shop/marcas:
 *   get:
 *     summary: Listar todas as marcas
 *     tags:
 *       - Shop - Marcas
 *     security: []
 *     responses:
 *       '200':
 *         description: Lista de marcas
 */
router.get('/marcas', marcaController.getAllMarcas);

/**
 * @swagger
 * /api/shop/marcas:
 *   post:
 *     summary: Criar marca
 *     tags:
 *       - Shop - Marcas
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Marca criada com sucesso
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.post('/marcas', protect, authorize('ADMIN'), marcaController.createMarca);

/**
 * @swagger
 * /api/shop/marcas/{id}:
 *   put:
 *     summary: Atualizar marca
 *     tags:
 *       - Shop - Marcas
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Marca atualizada com sucesso
 *       '404':
 *         description: Marca não encontrada
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.put('/marcas/:id', protect, authorize('ADMIN'), marcaController.updateMarca);

/**
 * @swagger
 * /api/shop/marcas/{id}:
 *   delete:
 *     summary: Deletar marca
 *     tags:
 *       - Shop - Marcas
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Marca deletada com sucesso
 *       '404':
 *         description: Marca não encontrada
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.delete('/marcas/:id', protect, authorize('ADMIN'), marcaController.deleteMarca);

// ===== PRODUTOS =====

/**
 * @swagger
 * /api/shop/products:
 *   get:
 *     summary: Listar todos os produtos
 *     tags:
 *       - Shop - Produtos
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Lista de produtos
 */
router.get('/products', productController.getAllProducts);

/**
 * @swagger
 * /api/shop/products/{id}:
 *   get:
 *     summary: Obter detalhes do produto
 *     tags:
 *       - Shop - Produtos
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/products/:id', productController.getProductById);

/**
 * @swagger
 * /api/shop/products:
 *   post:
 *     summary: Criar produto
 *     tags:
 *       - Shop - Produtos
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '201':
 *         description: Produto criado com sucesso
 *       '400':
 *         description: Dados inválidos
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.post('/products', protect, authorize('ADMIN'), upload.single('image'), productController.createProduct);

/**
 * @swagger
 * /api/shop/products/{id}:
 *   put:
 *     summary: Atualizar produto
 *     tags:
 *       - Shop - Produtos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Produto atualizado com sucesso
 *       '404':
 *         description: Produto não encontrado
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.put('/products/:id', protect, authorize('ADMIN'), upload.single('image'), productController.updateProduct);

/**
 * @swagger
 * /api/shop/products/{id}:
 *   delete:
 *     summary: Deletar produto
 *     tags:
 *       - Shop - Produtos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Produto deletado com sucesso
 *       '404':
 *         description: Produto não encontrado
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.delete('/products/:id', protect, authorize('ADMIN'), productController.deleteProduct);

module.exports = router;
