const express = require('express');
const router = express.Router();
const visitaController = require('../controllers/visitaController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const modulo = 'visitas';

router.post('/', protect, checkPermission(modulo), visitaController.createAgendamento);
router.get('/', protect, checkPermission(modulo), visitaController.getAgendamentos);
router.get('/:id', protect, checkPermission(modulo), visitaController.getAgendamentoById);
router.put('/:id', protect, checkPermission(modulo), visitaController.updateAgendamento);
router.delete('/:id', protect, checkPermission(modulo), visitaController.deleteAgendamento);

module.exports = router;
