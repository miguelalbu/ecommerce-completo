// src/routes/gastosRoutes.js
const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastosController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('ADMIN'));

/**
 * @swagger
 * /api/gastos/resumo:
 *   get:
 *     summary: Obter resumo de gastos
 *     tags:
 *       - Gastos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 */
router.get('/resumo', gastosController.getResumoGastos);

/**
 * @swagger
 * /api/gastos:
 *   get:
 *     summary: Listar todos os gastos
 *     tags:
 *       - Gastos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 */
router.get('/', gastosController.getAllGastos);

/**
 * @swagger
 * /api/gastos:
 *   post:
 *     summary: Registrar novo gasto
 *     tags:
 *       - Gastos
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descricao:
 *                 type: string
 *               valor:
 *                 type: number
 *               categoria:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Gasto registrado com sucesso
 *       '400':
 *         description: Dados inválidos
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.post('/', gastosController.createGasto);

/**
 * @swagger
 * /api/gastos/{id}:
 *   put:
 *     summary: Atualizar gasto
 *     tags:
 *       - Gastos
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
 *         description: Gasto atualizado com sucesso
 *       '404':
 *         description: Gasto não encontrado
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.put('/:id', gastosController.updateGasto);

/**
 * @swagger
 * /api/gastos/{id}:
 *   delete:
 *     summary: Deletar gasto
 *     tags:
 *       - Gastos
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
 *         description: Gasto deletado com sucesso
 *       '404':
 *         description: Gasto não encontrado
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.delete('/:id', gastosController.deleteGasto);

module.exports = router;
