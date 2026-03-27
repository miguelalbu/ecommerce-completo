const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const marcaController = require('../controllers/marcaController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- CATEGORIAS ---
router.get('/categories', categoryController.getAllCategories);
router.post('/categories', protect, authorize('ADMIN'), categoryController.createCategory);
router.put('/categories/:id', protect, authorize('ADMIN'), categoryController.updateCategory);
router.delete('/categories/:id', protect, authorize('ADMIN'), categoryController.deleteCategory);

// --- SUBCATEGORIAS ---
router.post('/categories/:categoriaId/subcategorias', protect, authorize('ADMIN'), categoryController.createSubcategoria);
router.delete('/subcategorias/:id', protect, authorize('ADMIN'), categoryController.deleteSubcategoria);

// --- MARCAS ---
router.get('/marcas', marcaController.getAllMarcas);
router.post('/marcas', protect, authorize('ADMIN'), marcaController.createMarca);
router.put('/marcas/:id', protect, authorize('ADMIN'), marcaController.updateMarca);
router.delete('/marcas/:id', protect, authorize('ADMIN'), marcaController.deleteMarca);

// --- PRODUTOS ---
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', protect, authorize('ADMIN'), upload.single('image'), productController.createProduct);
router.put('/products/:id', protect, authorize('ADMIN'), upload.single('image'), productController.updateProduct);
router.delete('/products/:id', protect, authorize('ADMIN'), productController.deleteProduct);

module.exports = router;
