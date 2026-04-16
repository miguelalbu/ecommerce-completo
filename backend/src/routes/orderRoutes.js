const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const ADMIN_ROLES = ['ADMIN', 'ADMIN_GLOBAL', 'GERENTE', 'VENDEDOR'];

// Meus pedidos (cliente logado)
router.get('/my-orders', protect, orderController.getMyOrders);

// Listar todos os pedidos (admin/gerente/vendedor)
router.get('/', protect, authorize(...ADMIN_ROLES), orderController.getAllOrders);

// Detalhe de um pedido
router.get('/:id', protect, orderController.getOrderById);

// Criar pedido manualmente no balcão
router.post('/', protect, authorize(...ADMIN_ROLES), orderController.createOrder);

// Atualizar status / dados do pedido
router.put('/:id', protect, authorize(...ADMIN_ROLES), orderController.updateOrder);

// Editar itens do pedido
router.put('/:id/items', protect, authorize(...ADMIN_ROLES), orderController.editOrderItems);

module.exports = router;
