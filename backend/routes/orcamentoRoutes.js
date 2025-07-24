const express = require('express');
const router = express.Router();
const orcamentoController = require('../controllers/orcamentoController');

router.post('/', orcamentoController.createOrcamento);
router.get('/', orcamentoController.getOrcamentos);
router.get('/:id', orcamentoController.getOrcamentoById);
router.delete('/:id', orcamentoController.deleteOrcamento);

module.exports = router;
