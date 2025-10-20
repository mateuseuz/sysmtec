const PermissaoUsuario = require('../models/permissaoUsuarioModel');

// @desc   Obter todas as permissões de um usuário específico
// @route  GET /api/permissoes-usuario/:id_usuario
// @access Privado/Admin
exports.getPermissoesPorUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    
    // Lista de módulos com permissões configuráveis (exclui módulos de admin)
    const todosOsModulos = [
      'clientes', 'orcamentos', 'ordensServico', 'visitas'
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
    const { ativo } = req.body; // Recebe um único valor booleano

    // Validação
    if (typeof ativo !== 'boolean') {
      return res.status(400).json({ error: "O valor de 'ativo' deve ser um booleano." });
    }

    // Define todas as permissões com base no valor de 'ativo'
    const permissoes = {
      pode_ler: ativo,
      pode_escrever: ativo,
      pode_deletar: ativo,
    };

    // Tenta atualizar a permissão existente
    const permissaoAtualizada = await PermissaoUsuario.update(id_usuario, modulo_nome, permissoes);

    // Se a permissão não existir, cria uma nova
    if (!permissaoAtualizada) {
      const novaPermissao = await PermissaoUsuario.create(id_usuario, modulo_nome, permissoes);
      return res.status(201).json(novaPermissao);
    }

    res.status(200).json(permissaoAtualizada);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar a permissão do usuário.' });
  }
};

// @desc   Obter as próprias permissões
// @route  GET /api/permissoes/me
// @access Privado
exports.getMinhasPermissoes = async (req, res) => {
  try {
    // O id do usuário logado é extraído do token JWT pelo middleware `protect`
    const id_usuario = req.usuario.id_usuario;

    const todosOsModulos = ['clientes', 'orcamentos', 'ordensServico', 'visitas', 'chat'];
    const permissoesSalvas = await PermissaoUsuario.findByUserId(id_usuario);
    
    const permissoesMap = new Map(permissoesSalvas.map(p => [p.modulo_nome, p]));

    const permissoesCompletas = todosOsModulos.map(modulo => {
      if (permissoesMap.has(modulo)) {
        return permissoesMap.get(modulo);
      } else {
        return {
          id_usuario: id_usuario,
          modulo_nome: modulo,
          pode_ler: false,
          pode_escrever: false,
          pode_deletar: false,
        };
      }
    });

    res.status(200).json(permissoesCompletas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar as permissões do usuário.' });
  }
};
