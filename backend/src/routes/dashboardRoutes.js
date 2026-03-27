const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/summary', protect, authorize('ADMIN'), dashboardController.getSummary);

const logController = require('../controllers/logController');
router.get('/logs', protect, authorize('ADMIN', 'ADMIN_GLOBAL', 'GERENTE'), logController.getLogs);
router.get('/logs/usuarios', protect, authorize('ADMIN', 'ADMIN_GLOBAL', 'GERENTE'), logController.getUsuariosComLogs);

module.exports = router;