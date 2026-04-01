const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Obter resumo do dashboard
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Resumo com métricas do dashboard
 */
router.get('/summary', protect, authorize('ADMIN'), dashboardController.getSummary);

const logController = require('../controllers/logController');

/**
 * @swagger
 * /api/dashboard/logs:
 *   get:
 *     summary: Listar logs do sistema
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Lista de logs
 */
router.get('/logs', protect, authorize('ADMIN', 'ADMIN_GLOBAL', 'GERENTE'), logController.getLogs);

/**
 * @swagger
 * /api/dashboard/logs/usuarios:
 *   get:
 *     summary: Listar usuários com logs
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de usuários que têm logs
 */
router.get('/logs/usuarios', protect, authorize('ADMIN', 'ADMIN_GLOBAL', 'GERENTE'), logController.getUsuariosComLogs);

module.exports = router;