// src/routes/boletosRoutes.js
const express = require('express');
const router = express.Router();
const boletosController = require('../controllers/boletosController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('ADMIN'));

/**
 * @swagger
 * /api/boletos:
 *   get:
 *     summary: Listar todos os boletos
 *     tags:
 *       - Boletos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, expired, cancelled]
 */
router.get('/', boletosController.getAllBoletos);

/**
 * @swagger
 * /api/boletos:
 *   post:
 *     summary: Criar novo boleto
 *     tags:
 *       - Boletos
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: string
 *               valor:
 *                 type: number
 *               data_vencimento:
 *                 type: string
 *                 format: date
 *     responses:
 *       '201':
 *         description: Boleto criado com sucesso
 *       '400':
 *         description: Dados inválidos
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.post('/', boletosController.createBoleto);

/**
 * @swagger
 * /api/boletos/{id}:
 *   put:
 *     summary: Atualizar boleto
 *     tags:
 *       - Boletos
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
 *         description: Boleto atualizado com sucesso
 *       '404':
 *         description: Boleto não encontrado
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.put('/:id', boletosController.updateBoleto);

/**
 * @swagger
 * /api/boletos/{id}:
 *   delete:
 *     summary: Deletar boleto
 *     tags:
 *       - Boletos
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
 *         description: Boleto deletado com sucesso
 *       '404':
 *         description: Boleto não encontrado
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.delete('/:id', boletosController.deleteBoleto);

module.exports = router;
