// /backend/src/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  registerCustomerSchema,
  loginCustomerSchema,
  addressSchema,
  updateProfileSchema,
} = require('../validators/userValidators');

/**
 * @swagger
 * /api/customers/register:
 *   post:
 *     summary: Registrar novo cliente
 *     tags:
 *       - Customers
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 */
router.post('/register', validate(registerCustomerSchema), customerController.registerCustomer);

/**
 * @swagger
 * /api/customers/login:
 *   post:
 *     summary: Login de cliente
 *     tags:
 *       - Customers
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 */
router.post('/login', validate(loginCustomerSchema), customerController.loginCustomer);

/**
 * @swagger
 * /api/customers/profile:
 *   get:
 *     summary: Obter perfil do cliente
 *     tags:
 *       - Customers
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Dados do perfil
 */
router.get('/profile', protect, authorize('CUSTOMER'), customerController.getProfile);

/**
 * @swagger
 * /api/customers/profile:
 *   patch:
 *     summary: Atualizar perfil do cliente
 *     tags:
 *       - Customers
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 */
router.patch('/profile', protect, authorize('CUSTOMER'), validate(updateProfileSchema), customerController.updateProfile);

/**
 * @swagger
 * /api/customers/addresses:
 *   get:
 *     summary: Listar endereços do cliente
 *     tags:
 *       - Customers
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de endereços
 */
router.get('/addresses', protect, authorize('CUSTOMER'), customerController.getAddresses);

/**
 * @swagger
 * /api/customers/addresses:
 *   post:
 *     summary: Adicionar novo endereço
 *     tags:
 *       - Customers
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 */
router.post('/addresses', protect, authorize('CUSTOMER'), validate(addressSchema), customerController.addAddress);

/**
 * @swagger
 * /api/customers/addresses/{id}:
 *   delete:
 *     summary: Deletar endereço
 *     tags:
 *       - Customers
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/addresses/:id', protect, authorize('CUSTOMER'), customerController.deleteAddress);

/**
 * @swagger
 * /api/customers/addresses/{id}/principal:
 *   patch:
 *     summary: Definir endereço como principal
 *     tags:
 *       - Customers
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.patch('/addresses/:id/principal', protect, authorize('CUSTOMER'), customerController.setPrincipalAddress);

module.exports = router;
