const express = require('express');
const router = express.Router();
const ordemServicoController = require('../controllers/ordemServicoController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, ordemServicoController.createOrdemServico);
router.get('/', protect, ordemServicoController.getOrdensServico);
router.get('/:id', protect, ordemServicoController.getOrdemServicoById);
router.put('/:id', protect, ordemServicoController.updateOrdemServico);
router.delete('/:id', protect, ordemServicoController.deleteOrdemServico);

module.exports = router;
