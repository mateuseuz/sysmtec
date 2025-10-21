const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');
const getEmailTemplate = require('../utils/emailTemplate');

const saltRounds = 10;

// @desc   Administrador cria um novo usuário
// @route  POST /api/usuarios/admin-create
// @access Privado/Admin
exports.adminCreateUsuario = async (req, res) => {
  const { email, perfil } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'O e-mail é obrigatório.' });
  }

  try {
    const novoUsuario = await Usuario.create(email, perfil);
    const activationToken = crypto.randomBytes(32).toString('hex');

    await Usuario.update(novoUsuario.id_usuario, {
      token_redefinir_senha: activationToken,
      token_expiracao: new Date(Date.now() + 3600000), // 1 hora a partir de agora
    });

    const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/ativar-conta/${activationToken}`;
    const emailHtml = getEmailTemplate({
      title: 'Bem-vindo(a) ao SYSMTEC!',
      content: '<p>Sua conta foi criada com sucesso. Para começar a usar o sistema, por favor, clique no botão abaixo para definir sua senha e ativar sua conta.</p>',
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

// @desc   Obter todos os usuários
// @route  GET /api/usuarios
// @access Privado/Admin
exports.getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
};

// @desc   Obter usuário por ID
// @route  GET /api/usuarios/:id
// @access Privado/Admin
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

// @desc   Atualizar usuário
// @route  PUT /api/usuarios/:id
// @access Privado/Admin
exports.updateUsuario = async (req, res) => {
  try {
    const { nome_completo, perfil } = req.body;
    const usuario = await Usuario.update(req.params.id, { nome_completo, perfil });
    if (usuario) {
      res.status(200).json(usuario);
    } else {
      res.status(404).json({ error: 'Usuário não encontrado.' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc   Deletar usuário
// @route  DELETE /api/usuarios/:id
// @access Privado/Admin
exports.deleteUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.delete(req.params.id);
    if (usuario) {
      res.status(200).json({ message: 'Usuário deletado com sucesso.' });
    } else {
      res.status(404).json({ error: 'Usuário não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário.' });
  }
};

// @desc   Esqueci a senha
// @route  POST /api/usuarios/esqueci-senha
// @access Público
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
            token_expiracao: new Date(Date.now() + 3600000), // 1 hora
        });

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/redefinir-senha/${resetToken}`;
        const emailHtml = getEmailTemplate({
            title: 'Redefinição de Senha',
            content: `<p>Recebemos uma solicitação para redefinir a senha da sua conta. Se você fez esta solicitação, clique no botão abaixo para escolher uma nova senha.</p><p>Se você não solicitou uma redefinição de senha, pode ignorar este e-mail com segurança.</p>`,
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

// @desc   Redefinir/Ativar senha e definir nome completo
// @route  POST /api/usuarios/redefinir-senha/:token
// @access Público
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { senha, nome_completo } = req.body;

    if (!senha || !nome_completo) {
        return res.status(400).json({ error: 'Senha e nome completo são obrigatórios.' });
    }

    if (nome_completo.trim().length < 3) {
        return res.status(400).json({ error: 'O nome completo deve ter pelo menos 3 caracteres.' });
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
        res.status(500).json({ error: 'Erro no servidor ao ativar a conta.' });
    }
};
