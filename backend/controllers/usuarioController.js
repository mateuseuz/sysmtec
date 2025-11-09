const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');
const getEmailTemplate = require('../utils/emailTemplate');

const saltRounds = 10;

// ------------------------
// ADMIN
// ------------------------

// Administrador cria um novo usuário
exports.adminCreateUsuario = async (req, res) => {
  const { email, perfil } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório.' });
  }

  try {
    const novoUsuario = await Usuario.create(email, perfil);
    const activationToken = crypto.randomBytes(32).toString('hex');

    await Usuario.update(novoUsuario.id_usuario, {
      token_redefinir_senha: activationToken,
      token_expiracao: new Date(Date.now() + 3600000), // 1 hora
    });

    const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/ativar-conta/${activationToken}`;
    const emailHtml = getEmailTemplate({
      title: 'Bem-vindo(a) ao SYSMTEC!',
      content: '<p>Sua conta foi criada com sucesso. Clique no botão abaixo para definir sua senha.</p>',
      buttonLink: activationUrl,
      buttonText: 'Definir Minha Senha',
    });

    await sendEmail({
      to: novoUsuario.email,
      subject: 'Ative sua conta no SYSMTEC',
      text: `Bem-vindo! Ative sua conta aqui: ${activationUrl}`,
      html: emailHtml,
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso. E-mail de ativação enviado.',
      usuario: novoUsuario
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obter todos os usuários
exports.getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
};

// Obter usuário por ID
exports.getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (usuario) {
      res.status(200).json(usuario);
    } else {
      res.status(404).json({ error: 'Usuário não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
};

// Atualizar usuário
exports.updateUsuario = async (req, res) => {
  try {
    const { nome_completo, perfil, email } = req.body; // Adiciona o e-mail
    const usuario = await Usuario.update(req.params.id, { nome_completo, perfil, email });
    if (usuario) {
      res.status(200).json(usuario);
    } else {
      res.status(404).json({ error: 'Usuário não encontrado.' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Deletar usuário
exports.deleteUsuario = async (req, res) => {
  try {
    console.log('Tentando deletar ID:', req.params.id);
    const usuario = await Usuario.delete(req.params.id);
    console.log('Resultado delete:', usuario);

    if (usuario) {
      res.status(200).json({ message: 'Usuário deletado com sucesso.' });
    } else {
      res.status(404).json({ error: 'Usuário não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao deletar:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário.' });
  }
};
  

// ------------------------
// SENHA / ATIVAÇÃO
// ------------------------

// Esqueci a senha
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const usuario = await Usuario.findByEmail(email);
    if (!usuario) {
      return res.status(200).json({ message: 'Se um usuário com este e-mail existir, um link de redefinição de senha será enviado.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await Usuario.update(usuario.id_usuario, {
      token_redefinir_senha: resetToken,
      token_expiracao: new Date(Date.now() + 3600000),
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/redefinir-senha/${resetToken}`;
    const emailHtml = getEmailTemplate({
      title: 'Redefinição de Senha',
      content: '<p>Clique no botão abaixo para redefinir sua senha.</p>',
      buttonLink: resetUrl,
      buttonText: 'Redefinir Minha Senha',
    });

    await sendEmail({
      to: usuario.email,
      subject: 'Redefinição de Senha',
      text: `Use este link para redefinir sua senha: ${resetUrl}`,
      html: emailHtml,
    });

    res.status(200).json({ message: 'E-mail de redefinição de senha enviado.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor ao processar o pedido.' });
  }
};

// Redefinir senha
exports.redefinirSenha = async (req, res) => {
  const { token } = req.params;
  const { senha } = req.body;

  if (!senha) {
    return res.status(400).json({ error: 'A senha é obrigatória.' });
  }

  try {
    const usuario = await Usuario.findByToken(token);
    if (!usuario) {
      return res.status(400).json({ error: 'Token inválido ou expirado.' });
    }

    const senha_hash = await bcrypt.hash(senha, saltRounds);
    await Usuario.update(usuario.id_usuario, {
      senha_hash,
      token_redefinir_senha: null,
      token_expiracao: null,
    });

    res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor ao redefinir senha.' });
  }
};

// Ativar conta (apenas definir senha)
exports.ativarConta = async (req, res) => {
  const { token } = req.params;
  const { senha, nome_completo } = req.body;

  if (!senha) {
    return res.status(400).json({ error: 'A senha é obrigatória.' });
  }

  try {
    const usuario = await Usuario.findByToken(token);
    if (!usuario) {
      return res.status(400).json({ error: 'Token inválido ou expirado.' });
    }

    const senha_hash = await bcrypt.hash(senha, saltRounds);
    await Usuario.update(usuario.id_usuario, {
      senha_hash,
      nome_completo,
      token_redefinir_senha: null,
      token_expiracao: null,
    });

    res.status(200).json({ message: 'Conta ativada e senha definida com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor ao ativar conta.' });
  }
};
