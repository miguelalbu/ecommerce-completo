// /backend/src/routes/checkoutRoutes.js
const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { checkoutSchema } = require('../validators/userValidators');

// Middleware opcional: autentica se houver token, mas não bloqueia se não houver
const getOptionalUser = (req, res, next) => {
  protect(req, res, (err) => next());
};

/**
 * @swagger
 * /api/checkout:
 *   post:
 *     summary: Processar pedido (checkout)
 *     description: Processa o checkout e cria um novo pedido. Pode ser anônimo (sem token) ou autenticado (com token JWT de cliente)
 *     tags:
 *       - Checkout
 *     security:
 *       - BearerAuth: []
 *       - {}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cartItems
 *               - isPickup
 *             properties:
 *               cartItems:
 *                 type: array
 *                 description: Lista de itens do carrinho
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               isPickup:
 *                 type: boolean
 *                 description: true = retirada na loja, false = entrega
 *                 example: false
 *               address:
 *                 type: object
 *                 description: Endereço de entrega (obrigatório quando isPickup=false)
 *                 properties:
 *                   rua:
 *                     type: string
 *                   numero:
 *                     type: string
 *                   bairro:
 *                     type: string
 *                   cidade:
 *                     type: string
 *                   estado:
 *                     type: string
 *                     example: PE
 *                   cep:
 *                     type: string
 *                     example: "50000000"
 *     responses:
 *       '201':
 *         description: Pedido criado com sucesso
 *       '400':
 *         description: Dados inválidos
 *       '401':
 *         description: Token inválido (quando fornecido)
 */
router.post('/', getOptionalUser, validate(checkoutSchema), checkoutController.placeOrder);

module.exports = router;
