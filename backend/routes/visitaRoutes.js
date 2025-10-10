const express = require('express');
const router = express.Router();
const visitaController = require('../controllers/visitaController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const modulo = 'visitas';

router.post('/', protect, checkPermission(modulo, 'pode_escrever'), visitaController.createAgendamento);
router.get('/', protect, checkPermission(modulo, 'pode_ler'), visitaController.getAgendamentos);
router.get('/:id', protect, checkPermission(modulo, 'pode_ler'), visitaController.getAgendamentoById);
router.put('/:id', protect, checkPermission(modulo, 'pode_escrever'), visitaController.updateAgendamento);
router.delete('/:id', protect, checkPermission(modulo, 'pode_deletar'), visitaController.deleteAgendamento);

module.exports = router;
