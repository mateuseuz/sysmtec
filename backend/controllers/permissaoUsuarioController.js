const PermissaoUsuario = require('../models/permissaoUsuarioModel');

// @desc   Obter todas as permissões de um usuário específico
// @route  GET /api/permissoes-usuario/:id_usuario
// @access Privado/Admin
exports.getPermissoesPorUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    
    // Lista de módulos com permissões configuráveis (exclui módulos de admin)
    const todosOsModulos = [
      'clientes', 'orcamentos', 'ordensServico', 'visitas', 'chat'
    ];

    // Busca as permissões que o usuário já tem no banco de dados
    const permissoesSalvas = await PermissaoUsuario.findByUserId(id_usuario);
    
    // Mapeia as permissões salvas para fácil acesso
    const permissoesMap = new Map(
      permissoesSalvas.map(p => [p.modulo_nome, p])
    );

    // Mescla a lista completa de módulos com as permissões salvas
    const permissoesCompletas = todosOsModulos.map(modulo => {
      if (permissoesMap.has(modulo)) {
        // Se a permissão existe, retorna ela
        return permissoesMap.get(modulo);
      } else {
        // Se não existe, cria uma permissão padrão (tudo false)
        return {
          id_usuario: parseInt(id_usuario, 10),
          modulo_nome: modulo,
          pode_ler: false,
          pode_escrever: false,
          pode_deletar: false,
        };
      }
    });

    res.status(200).json(permissoesCompletas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar permissões do usuário.' });
  }
};

// @desc   Atualizar a permissão de um usuário para um módulo
// @route  PUT /api/permissoes-usuario/:id_usuario/:modulo_nome
// @access Privado/Admin
exports.updatePermissaoUsuario = async (req, res) => {
  try {
    const { id_usuario, modulo_nome } = req.params;
    const { pode_ler, pode_escrever, pode_deletar } = req.body;

    // Validação básica
    if (typeof pode_ler !== 'boolean' || typeof pode_escrever !== 'boolean' || typeof pode_deletar !== 'boolean') {
      return res.status(400).json({ error: 'Valores de permissão inválidos.' });
    }

    // Primeiro, tenta atualizar a permissão
    const permissaoAtualizada = await PermissaoUsuario.update(id_usuario, modulo_nome, { pode_ler, pode_escrever, pode_deletar });

    // Se nenhuma linha foi afetada (porque não existia), cria a permissão
    if (!permissaoAtualizada) {
      const novaPermissao = await PermissaoUsuario.create(id_usuario, modulo_nome, { pode_ler, pode_escrever, pode_deletar });
      return res.status(201).json(novaPermissao);
    }

    res.status(200).json(permissaoAtualizada);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar permissão do usuário.' });
  }
};
