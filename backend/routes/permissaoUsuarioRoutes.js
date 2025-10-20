const express = require('express');
const router = express.Router();
const {
  getPermissoesPorUsuario,
  updatePermissaoUsuario,
  getMinhasPermissoes,
} = require('../controllers/permissaoUsuarioController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const modulo = 'permissoes'; // Somente quem pode gerenciar permissões pode acessar estas rotas

// Protege todas as rotas abaixo
router.use(protect);

// Rota especial para o usuário logado buscar suas próprias permissões
// Esta rota não precisa da verificação de permissão do módulo 'permissoes'
router.get('/me', getMinhasPermissoes);

// As rotas abaixo exigem permissão para gerenciar o módulo 'permissoes'
router.use(checkPermission(modulo)); 

// Rota para obter todas as permissões de um usuário específico
router.get('/:id_usuario', getPermissoesPorUsuario);

// Rota para atualizar a permissão de um usuário para um módulo específico
router.put('/:id_usuario/:modulo_nome', checkPermission(modulo), updatePermissaoUsuario);

module.exports = router;
    