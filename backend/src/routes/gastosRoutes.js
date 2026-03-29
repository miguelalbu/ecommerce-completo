// src/routes/gastosRoutes.js
const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastosController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('ADMIN'));

router.get('/resumo', gastosController.getResumoGastos);
router.get('/', gastosController.getAllGastos);
router.post('/', gastosController.createGasto);
router.put('/:id', gastosController.updateGasto);
router.delete('/:id', gastosController.deleteGasto);

module.exports = router;
