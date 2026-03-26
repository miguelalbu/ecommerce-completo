const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const validate = require('../middleware/validate');
const { createUserSchema, loginUserSchema } = require('../validators/userValidators');
const { protect, authorize } = require('../middleware/authMiddleware');

// Pública: qualquer um pode fazer login
router.post('/login', validate(loginUserSchema), userController.loginUser);

// Protegida: apenas ADMIN_GLOBAL pode criar outros usuários admin
router.post('/', protect, authorize('ADMIN', 'ADMIN_GLOBAL'), validate(createUserSchema), userController.createUser);

module.exports = router;