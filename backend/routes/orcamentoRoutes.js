const express = require('express');
const router = express.Router();
const orcamentoController = require('../controllers/orcamentoController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const modulo = 'orcamentos';

router.post('/', protect, checkPermission(modulo, 'pode_escrever'), orcamentoController.createOrcamento);
router.get('/', protect, checkPermission(modulo, 'pode_ler'), orcamentoController.getOrcamentos);
router.get('/:id', protect, checkPermission(modulo, 'pode_ler'), orcamentoController.getOrcamentoById);
router.put('/:id', protect, checkPermission(modulo, 'pode_escrever'), orcamentoController.updateOrcamento);
router.delete('/:id', protect, checkPermission(modulo, 'pode_deletar'), orcamentoController.deleteOrcamento);

module.exports = router;
