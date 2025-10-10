const express = require('express');
const router = express.Router();
const { getMensagens } = require('../controllers/mensagemController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const modulo = 'chat';

// GET /api/mensagens - Rota para buscar o histórico de mensagens
// Protegida, requer permissão de leitura no módulo de chat.
router.route('/').get(protect, checkPermission(modulo, 'pode_ler'), getMensagens);

module.exports = router;