const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rota para criar um novo usuário
// POST /api/usuarios
router.post('/', usuarioController.createUsuario);

module.exports = router;
