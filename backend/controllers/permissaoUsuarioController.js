const PermissaoUsuario = require('../models/permissaoUsuarioModel');

// @desc   Obter todas as permissões de um usuário específico
// @route  GET /api/permissoes-usuario/:id_usuario
// @access Privado/Admin
exports.getPermissoesPorUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const modulosConfiguraveis = {
      'clientes': 'Clientes',
      'orcamentos': 'Orçamentos',
      'ordensServico': 'Ordens de Serviço',
      'visitas': 'Visitas'
    };

    const permissoesSalvas = await PermissaoUsuario.findByUserId(id_usuario);
    const permissoesMap = new Map(permissoesSalvas.map(p => [p.modulo_nome, p]));

    const permissoesCompletas = Object.keys(modulosConfiguraveis).map(moduloKey => {
      const displayName = modulosConfiguraveis[moduloKey];
      const permissaoExistente = permissoesMap.get(moduloKey) || permissoesMap.get(displayName);

      return {
        id_usuario: parseInt(id_usuario, 10),
        modulo_nome: displayName,
        ativo: permissaoExistente ? permissaoExistente.ativo : false,
      };
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
    const { ativo } = req.body;

    if (typeof ativo !== 'boolean') {
      return res.status(400).json({ error: "O valor de 'ativo' deve ser um booleano." });
    }

    const modulosMap = {
      'Clientes': 'clientes',
      'Orçamentos': 'orcamentos',
      'Ordens de Serviço': 'ordensServico',
      'Visitas': 'visitas'
    };
    const modulo_nome_interno = modulosMap[modulo_nome];

    if (!modulo_nome_interno) {
      return res.status(400).json({ error: `Módulo '${modulo_nome}' inválido.` });
    }

    const permissaoExistente = await PermissaoUsuario.findByUserIdAndModule(id_usuario, modulo_nome_interno);

    if (permissaoExistente) {
      await PermissaoUsuario.update(id_usuario, modulo_nome_interno, { ativo });
    } else {
      await PermissaoUsuario.create(id_usuario, modulo_nome_interno, { ativo });
    }
    
    const permissaoAtualizada = await PermissaoUsuario.findByUserIdAndModule(id_usuario, modulo_nome_interno);

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
    const id_usuario = req.usuario.id_usuario;
    const todosOsModulos = ['clientes', 'orcamentos', 'ordensServico', 'visitas'];
    const permissoesSalvas = await PermissaoUsuario.findByUserId(id_usuario);
    const permissoesMap = new Map(permissoesSalvas.map(p => [p.modulo_nome, p]));

    const permissoesCompletas = todosOsModulos.map(modulo => ({
      modulo_nome: modulo,
      ativo: permissoesMap.has(modulo) ? permissoesMap.get(modulo).ativo : false,
    }));
    
    permissoesCompletas.push({
      modulo_nome: 'chat',
      ativo: true,
    });

    res.status(200).json(permissoesCompletas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar as permissões do usuário.' });
  }
};
