const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const modulo = 'clientes';

router.post('/', protect, checkPermission(modulo), clienteController.createCliente);
router.get('/', protect, checkPermission(modulo), clienteController.getClientes);
router.get('/search', protect, checkPermission(modulo), clienteController.searchClientes);
router.get('/:id', protect, checkPermission(modulo), clienteController.getClienteById);
router.put('/:id', protect, checkPermission(modulo), clienteController.updateCliente);
router.delete('/:id', protect, checkPermission(modulo), clienteController.deleteCliente);

module.exports = router;