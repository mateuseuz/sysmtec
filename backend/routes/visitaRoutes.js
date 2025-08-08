const express = require('express');
const router = express.Router();
const visitaController = require('../controllers/visitaController');

router.post('/', visitaController.createAgendamento);
router.get('/', visitaController.getAgendamentos);
router.get('/:id', visitaController.getAgendamentoById);
router.put('/:id', visitaController.updateAgendamento);
router.delete('/:id', visitaController.deleteAgendamento);

module.exports = router;
