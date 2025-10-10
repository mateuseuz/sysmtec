const Permissao = require('../models/permissaoModel');
const pool = require('../config/database'); // Importar a pool de conexão

// Listar todas as permissões
exports.listarPermissoes = async (req, res) => {
  try {
    const permissoes = await Permissao.findAll();
    res.status(200).json(permissoes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar permissões.' });
  }
};

// Atualizar uma permissão
exports.atualizarPermissao = async (req, res) => {
  try {
    const { perfil_nome, modulo_nome } = req.params;
    const { pode_ler, pode_escrever, pode_deletar } = req.body;

    if (typeof pode_ler !== 'boolean' || typeof pode_escrever !== 'boolean' || typeof pode_deletar !== 'boolean') {
      return res.status(400).json({ error: 'Valores de permissão inválidos.' });
    }

    const permissaoAtualizada = await Permissao.update(perfil_nome, modulo_nome, { pode_ler, pode_escrever, pode_deletar });

    if (!permissaoAtualizada) {
      return res.status(404).json({ error: 'Permissão não encontrada.' });
    }

    res.status(200).json(permissaoAtualizada);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar permissão.' });
  }
};

// Buscar permissões do usuário logado
exports.getMinhasPermissoes = async (req, res) => {
  try {
    if (!req.usuario || !req.usuario.perfil) {
      return res.status(401).json({ error: 'Usuário não autenticado ou perfil não encontrado.' });
    }
    const query = 'SELECT * FROM permissoes WHERE perfil_nome = $1';
    const values = [req.usuario.perfil];
    const { rows } = await pool.query(query, values);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar minhas permissões.' });
  }
};