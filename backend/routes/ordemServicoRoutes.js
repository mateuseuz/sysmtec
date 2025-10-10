const express = require('express');
const router = express.Router();
const ordemServicoController = require('../controllers/ordemServicoController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const modulo = 'ordensServico';

router.post('/', protect, checkPermission(modulo, 'pode_escrever'), ordemServicoController.createOrdemServico);
router.get('/', protect, checkPermission(modulo, 'pode_ler'), ordemServicoController.getOrdensServico);
router.get('/:id', protect, checkPermission(modulo, 'pode_ler'), ordemServicoController.getOrdemServicoById);
router.put('/:id', protect, checkPermission(modulo, 'pode_escrever'), ordemServicoController.updateOrdemServico);
router.delete('/:id', protect, checkPermission(modulo, 'pode_deletar'), ordemServicoController.deleteOrdemServico);

module.exports = router;
