// src/routes/cupomRoutes.js
const express = require('express');
const router = express.Router();
const cupomController = require('../controllers/cupomController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/cupons/validate:
 *   post:
 *     summary: Validar cupom
 *     tags:
 *       - Cupons
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               total:
 *                 type: number
 */
router.post('/validate', cupomController.validateCupom);

/**
 * @swagger
 * /api/cupons:
 *   get:
 *     summary: Listar todos os cupons
 *     tags:
 *       - Cupons
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Lista de cupons
 */
router.get('/', protect, authorize('ADMIN'), cupomController.getAllCupons);

/**
 * @swagger
 * /api/cupons:
 *   post:
 *     summary: Criar novo cupom
 *     tags:
 *       - Cupons
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               discount:
 *                 type: number
 *               discount_type:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Cupom criado com sucesso
 *       '400':
 *         description: Dados inválidos
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.post('/', protect, authorize('ADMIN'), cupomController.createCupom);

/**
 * @swagger
 * /api/cupons/{id}:
 *   put:
 *     summary: Atualizar cupom
 *     tags:
 *       - Cupons
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
 *         description: Cupom atualizado com sucesso
 *       '404':
 *         description: Cupom não encontrado
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.put('/:id', protect, authorize('ADMIN'), cupomController.updateCupom);

/**
 * @swagger
 * /api/cupons/{id}:
 *   delete:
 *     summary: Deletar cupom
 *     tags:
 *       - Cupons
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
 *         description: Cupom deletado com sucesso
 *       '404':
 *         description: Cupom não encontrado
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.delete('/:id', protect, authorize('ADMIN'), cupomController.deleteCupom);

module.exports = router;
