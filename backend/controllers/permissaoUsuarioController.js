const PermissaoUsuario = require('../models/permissaoUsuarioModel');

// @desc   Obter todas as permissões de um usuário específico
// @route  GET /api/permissoes-usuario/:id_usuario
// @access Privado/Admin
exports.getPermissoesPorUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    
    // Módulos e seus nomes de exibição corretos
    const modulosConfiguraveis = {
      'clientes': 'Clientes',
      'orcamentos': 'Orçamentos',
      'ordensServico': 'Ordens de Serviço',
      'visitas': 'Visitas'
    };

    const permissoesSalvas = await PermissaoUsuario.findByUserId(id_usuario);
    const permissoesMap = new Map(permissoesSalvas.map(p => [p.modulo_nome, p]));

    const permissoesCompletas = Object.keys(modulosConfiguraveis).map(moduloKey => {
      const permissaoExistente = permissoesMap.get(moduloKey);
      if (permissaoExistente) {
        return { ...permissaoExistente, modulo_nome: modulosConfiguraveis[moduloKey] };
      } else {
        return {
          id_usuario: parseInt(id_usuario, 10),
          modulo_nome: modulosConfiguraveis[moduloKey],
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
    const id_usuario = req.usuario.id_usuario;

    // A lista de módulos aqui deve corresponder à lógica de acesso geral
    const todosOsModulos = ['clientes', 'orcamentos', 'ordensServico', 'visitas']; 
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

    // O chat não tem permissões configuráveis, então damos acesso total de leitura por padrão.
    permissoesCompletas.push({
        id_usuario: id_usuario,
        modulo_nome: 'chat',
        pode_ler: true,
        pode_escrever: true,
        pode_deletar: req.usuario.perfil === 'admin', 
    });


    res.status(200).json(permissoesCompletas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar as permissões do usuário.' });
  }
};
