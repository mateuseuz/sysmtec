const express = require('express');
const router = express.Router();
const { getMensagens } = require('../controllers/mensagemController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/mensagens - Rota para buscar o histórico de mensagens
// Protegida, apenas usuários logados podem acessar.
router.route('/').get(protect, getMensagens);

module.exports = router;