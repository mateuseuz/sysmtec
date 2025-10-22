const express = require('express');
const router = express.Router();
const {
  adminCreateUsuario,
  getAllUsuarios,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
  forgotPassword,
  redefinirSenha,
  ativarConta,
} = require('../controllers/usuarioController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const modulo = 'usuarios';

// Rotas Públicas
router.post('/esqueci-senha', forgotPassword);
router.post('/redefinir-senha/:token', redefinirSenha);
router.post('/ativar-conta/:token', ativarConta);

// Protege todas as rotas abaixo
router.use(protect);

// Rotas Admin
router.route('/')
  .get(checkPermission(modulo, 'pode_ler'), getAllUsuarios)
  .post(checkPermission(modulo, 'pode_escrever'), adminCreateUsuario);

router.route('/:id')
  .get(checkPermission(modulo, 'pode_ler'), getUsuarioById)
  .put(checkPermission(modulo, 'pode_escrever'), updateUsuario)
  .delete(checkPermission(modulo, 'pode_deletar'), deleteUsuario);

module.exports = router;
