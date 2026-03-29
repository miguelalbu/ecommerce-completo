// src/routes/boletosRoutes.js
const express = require('express');
const router = express.Router();
const boletosController = require('../controllers/boletosController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('ADMIN'));

router.get('/', boletosController.getAllBoletos);
router.post('/', boletosController.createBoleto);
router.put('/:id', boletosController.updateBoleto);
router.delete('/:id', boletosController.deleteBoleto);

module.exports = router;
