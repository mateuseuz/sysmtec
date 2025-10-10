const express = require('express');
const router = express.Router();
const { listarPermissoes, atualizarPermissao, getMinhasPermissoes } = require('../controllers/permissaoController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

const modulo = 'permissoes';

// Rota para buscar as permissões do usuário logado
router.get('/me', protect, getMinhasPermissoes);

// Rota para listar todas as permissões (requer permissão para gerenciar permissões)
router.get('/', protect, checkPermission(modulo, 'pode_ler'), listarPermissoes);

// Rota para atualizar uma permissão específica (requer permissão para gerenciar permissões)
router.put('/:perfil_nome/:modulo_nome', protect, checkPermission(modulo, 'pode_escrever'), atualizarPermissao);

module.exports = router;