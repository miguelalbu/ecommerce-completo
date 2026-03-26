const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas as rotas aqui exigem LOGIN (protect) e CARGO DE ADMIN (authorize)
router.use(protect);
router.use(authorize('ADMIN', 'ADMIN_GLOBAL'));

router.get('/', userManagementController.getAllUsers);
router.delete('/users/:id', userManagementController.deleteUser);
router.delete('/customers/:id', userManagementController.deleteCustomer);

module.exports = router;