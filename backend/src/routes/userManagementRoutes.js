const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas as rotas aqui exigem LOGIN (protect) e CARGO DE ADMIN (authorize)
router.use(protect);
router.use(authorize('ADMIN', 'ADMIN_GLOBAL'));

/**
 * @swagger
 * /api/user-management:
 *   get:
 *     summary: Listar todos os usuários
 *     tags:
 *       - User Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Lista de usuários
 */
router.get('/', userManagementController.getAllUsers);

/**
 * @swagger
 * /api/user-management/users/{id}:
 *   delete:
 *     summary: Deletar usuário admin
 *     tags:
 *       - User Management
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
 *         description: Usuário deletado com sucesso
 */
router.delete('/users/:id', userManagementController.deleteUser);

/**
 * @swagger
 * /api/user-management/customers/{id}:
 *   delete:
 *     summary: Deletar cliente
 *     tags:
 *       - User Management
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
 *         description: Cliente deletado com sucesso
 */
router.delete('/customers/:id', userManagementController.deleteCustomer);

module.exports = router;