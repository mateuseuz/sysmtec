const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const modulo = 'clientes';

router.post('/', protect, checkPermission(modulo, 'pode_escrever'), clienteController.createCliente);
router.get('/', protect, checkPermission(modulo, 'pode_ler'), clienteController.getClientes);
router.get('/search', protect, checkPermission(modulo, 'pode_ler'), clienteController.searchClientes);
router.get('/:id', protect, checkPermission(modulo, 'pode_ler'), clienteController.getClienteById);
router.put('/:id', protect, checkPermission(modulo, 'pode_escrever'), clienteController.updateCliente);
router.delete('/:id', protect, checkPermission(modulo, 'pode_deletar'), clienteController.deleteCliente);

module.exports = router;