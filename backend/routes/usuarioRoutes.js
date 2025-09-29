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
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Rotas Públicas (não precisam de autenticação)
router.post('/esqueci-senha', forgotPassword);
router.post('/redefinir-senha/:token', resetPassword);

// A partir daqui, todas as rotas são protegidas e requerem login
router.use(protect);

// A partir daqui, todas as rotas são apenas para administradores
router.use(isAdmin);

// Rotas de Admin
router.route('/')
  .get(getAllUsuarios)
  .post(adminCreateUsuario); // Rota para admin criar usuário

router.route('/:id')
  .get(getUsuarioById)
  .put(updateUsuario)
  .delete(deleteUsuario);

module.exports = router;
