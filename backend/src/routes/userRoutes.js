const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const validate = require('../middleware/validate');
const { createUserSchema, loginUserSchema } = require('../validators/userValidators');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login de usuário admin
 *     description: Autentica um usuário admin e retorna um token JWT
 *     tags:
 *       - Users
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@ecommerce.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       '200':
 *         description: Login bem-sucedido
 *       '401':
 *         description: Email ou senha inválidos
 */
router.post('/login', validate(loginUserSchema), userController.loginUser);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Criar novo usuário admin
 *     description: Cria um novo usuário com role de admin (apenas ADMIN ou ADMIN_GLOBAL)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Usuário criado com sucesso
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão
 */
router.post('/', protect, authorize('ADMIN', 'ADMIN_GLOBAL'), validate(createUserSchema), userController.createUser);

module.exports = router;