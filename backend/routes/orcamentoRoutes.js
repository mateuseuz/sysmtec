const express = require('express');
const router = express.Router();
const orcamentoController = require('../controllers/orcamentoController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const modulo = 'orcamentos';

router.post('/', protect, checkPermission(modulo), orcamentoController.createOrcamento);
router.get('/', protect, checkPermission(modulo), orcamentoController.getOrcamentos);
router.get('/:id', protect, checkPermission(modulo), orcamentoController.getOrcamentoById);
router.put('/:id', protect, checkPermission(modulo), orcamentoController.updateOrcamento);
router.delete('/:id', protect, checkPermission(modulo), orcamentoController.deleteOrcamento);

module.exports = router;
