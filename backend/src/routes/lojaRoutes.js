const express = require('express');
const router = express.Router();
const lojaController = require('../controllers/lojaController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/lojas:
 *   get:
 *     summary: Listar todas as lojas
 *     tags:
 *       - Lojas
 *     security: []
 *     responses:
 *       '200':
 *         description: Lista de lojas
 */
router.get('/', lojaController.getAllLojas);

/**
 * @swagger
 * /api/lojas:
 *   post:
 *     summary: Criar nova loja
 *     tags:
 *       - Lojas
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               endereco:
 *                 type: string
 *               telefone:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Loja criada com sucesso
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.post('/', protect, authorize('ADMIN'), lojaController.createLoja);

/**
 * @swagger
 * /api/lojas/{id}:
 *   put:
 *     summary: Atualizar loja
 *     tags:
 *       - Lojas
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
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Loja atualizada com sucesso
 *       '404':
 *         description: Loja não encontrada
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.put('/:id', protect, authorize('ADMIN'), lojaController.updateLoja);

/**
 * @swagger
 * /api/lojas/{id}:
 *   delete:
 *     summary: Deletar loja
 *     tags:
 *       - Lojas
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
 *         description: Loja deletada com sucesso
 *       '404':
 *         description: Loja não encontrada
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.delete('/:id', protect, authorize('ADMIN'), lojaController.deleteLoja);

module.exports = router;
