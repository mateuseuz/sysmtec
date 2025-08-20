const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, clienteController.createCliente);
router.get('/', protect, clienteController.getClientes);
router.get('/search', protect, clienteController.searchClientes);
router.get('/:id', protect, clienteController.getClienteById);
router.put('/:id', protect, clienteController.updateCliente);
router.delete('/:id', protect, clienteController.deleteCliente);

module.exports = router;