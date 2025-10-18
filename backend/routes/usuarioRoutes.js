const express = require('express');
const router = express.Router();
const {
  adminCreateUsuario,
  getAllUsuarios,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
  forgotPassword,
  resetPassword,
} = require('../controllers/usuarioController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const modulo = 'usuarios';

// Rotas Públicas (não precisam de autenticação)
router.post('/esqueci-senha', forgotPassword);
router.post('/redefinir-senha/:token', resetPassword);

// A partir daqui, todas as rotas são protegidas e requerem login
router.use(protect);

// Rotas de Admin com verificação de permissão granular
router.route('/')
  .get(checkPermission(modulo, 'pode_ler'), getAllUsuarios)
  .post(checkPermission(modulo, 'pode_escrever'), adminCreateUsuario);

router.route('/:id')
  .get(checkPermission(modulo, 'pode_ler'), getUsuarioById);

module.exports = router;
