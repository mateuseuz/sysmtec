const express = require('express');
const router = express.Router();
const ordemServicoController = require('../controllers/ordemServicoController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const modulo = 'ordensServico';

router.post('/', protect, checkPermission(modulo), ordemServicoController.createOrdemServico);
router.get('/', protect, checkPermission(modulo), ordemServicoController.getOrdensServico);
router.get('/:id', protect, checkPermission(modulo), ordemServicoController.getOrdemServicoById);
router.put('/:id', protect, checkPermission(modulo), ordemServicoController.updateOrdemServico);
router.delete('/:id', protect, checkPermission(modulo), ordemServicoController.deleteOrdemServico);

module.exports = router;
