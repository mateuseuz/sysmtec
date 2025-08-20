const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcrypt');

const saltRounds = 10; // Fator de custo para o hash

exports.createUsuario = async (req, res) => {
  try {
    const { nome_usuario, email, senha } = req.body;

    // Validação básica de entrada
    if (!nome_usuario || !email || !senha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios: nome_usuario, email, senha.' });
    }

    // Hash da senha
    const senha_hash = await bcrypt.hash(senha, saltRounds);

    // Criação do usuário no banco
    const novoUsuario = await Usuario.create(nome_usuario, email, senha_hash);

    res.status(201).json(novoUsuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
