const express = require('express');
const router = express.Router();
const orcamentoController = require('../controllers/orcamentoController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, orcamentoController.createOrcamento);
router.get('/', protect, orcamentoController.getOrcamentos);
router.get('/:id', protect, orcamentoController.getOrcamentoById);
router.put('/:id', protect, orcamentoController.updateOrcamento);
router.delete('/:id', protect, orcamentoController.deleteOrcamento);

module.exports = router;
