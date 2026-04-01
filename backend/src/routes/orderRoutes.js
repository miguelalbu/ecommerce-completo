const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Listar meus pedidos
 *     tags:
 *       - Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Lista de pedidos do cliente
 */
router.get('/my-orders', protect, orderController.getMyOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obter detalhes do pedido
 *     tags:
 *       - Orders
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
 *         description: Detalhes do pedido
 *       '404':
 *         description: Pedido não encontrado
 */
router.get('/:id', protect, orderController.getOrderById);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Listar todos os pedidos
 *     description: Retorna lista de todos os pedidos (apenas ADMIN)
 *     tags:
 *       - Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Lista de pedidos
 */
router.get('/', protect, authorize('ADMIN'), orderController.getAllOrders);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Criar novo pedido manualmente
 *     tags:
 *       - Orders
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_id:
 *                 type: string
 *               items:
 *                 type: array
 */
router.post('/', protect, authorize('ADMIN'), orderController.createOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Atualizar pedido
 *     tags:
 *       - Orders
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
 *             properties:
 *               status:
 *                 type: string
 *               tracking_code:
 *                 type: string
 */
router.put('/:id', protect, authorize('ADMIN'), orderController.updateOrder);

module.exports = router;