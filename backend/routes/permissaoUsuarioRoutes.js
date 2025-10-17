const express = require('express');
const router = express.Router();
const {
  getPermissoesPorUsuario,
  updatePermissaoUsuario,
} = require('../controllers/permissaoUsuarioController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const modulo = 'permissoes'; // Somente quem pode gerenciar permissões pode acessar estas rotas

// Protege todas as rotas abaixo e verifica a permissão
router.use(protect);
router.use(checkPermission(modulo, 'pode_ler')); // No mínimo, precisa de permissão de leitura

// Rota para obter todas as permissões de um usuário específico
router.get('/:id_usuario', getPermissoesPorUsuario);

// Rota para atualizar a permissão de um usuário para um módulo específico
router.put('/:id_usuario/:modulo_nome', checkPermission(modulo, 'pode_escrever'), updatePermissaoUsuario);

module.exports = router;
    