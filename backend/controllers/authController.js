const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    // 1. Encontrar o usuário pelo e-mail
    const usuario = await Usuario.findByEmail(email);
    if (!usuario) {
      return res.status(400).json({ error: 'Credenciais inválidas.' }); // Usuário não encontrado
    }

    // 2. Comparar a senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(400).json({ error: 'Credenciais inválidas.' }); // Senha incorreta
    }

    // 3. Gerar o Token JWT
    const token = jwt.sign(
      { 
        id_usuario: usuario.id_usuario, 
        nome_completo: usuario.nome_completo,
        perfil: usuario.perfil // Adicionando o perfil do usuário ao token
      },
      process.env.JWT_SECRET || 'seu_segredo_jwt_padrao', // Use uma variável de ambiente!
      { expiresIn: '1h' } // Token expira em 1 hora
    );

    // Remover a senha hash do objeto de usuário antes de enviar a resposta
    delete usuario.senha_hash;

    res.status(200).json({
      message: 'Login bem-sucedido!',
      token,
      usuario
    });

  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
