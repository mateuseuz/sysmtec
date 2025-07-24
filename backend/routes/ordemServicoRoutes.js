const express = require('express');
const router = express.Router();
const ordemServicoController = require('../controllers/ordemServicoController');

router.post('/', ordemServicoController.createOrdemServico);
router.get('/', ordemServicoController.getOrdensServico);
router.get('/:id', ordemServicoController.getOrdemServicoById);
router.put('/:id', ordemServicoController.updateOrdemServico);
router.delete('/:id', ordemServicoController.deleteOrdemServico);

module.exports = router;
