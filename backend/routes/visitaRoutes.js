const express = require('express');
const router = express.Router();
const visitaController = require('../controllers/visitaController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, visitaController.createAgendamento);
router.get('/', protect, visitaController.getAgendamentos);
router.get('/:id', protect, visitaController.getAgendamentoById);
router.put('/:id', protect, visitaController.updateAgendamento);
router.delete('/:id', protect, visitaController.deleteAgendamento);

module.exports = router;
