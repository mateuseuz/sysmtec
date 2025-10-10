const jwt = require('jsonwebtoken');
const Permissao = require('../models/permissaoModel');
require('dotenv').config();

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_jwt_padrao');
      req.usuario = decoded;
      next();
    } catch (error) {
      console.error('Erro de autenticação:', error.message);
      res.status(401).json({ error: 'Não autorizado, token falhou.' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Não autorizado, sem token.' });
  }
};

/**
 * Gera um middleware que verifica se o usuário logado tem uma permissão específica.
 * @param {string} modulo - O nome do módulo a ser verificado (ex: 'clientes').
 * @param {string} permissao_requerida - A permissão necessária (ex: 'pode_ler', 'pode_escrever', 'pode_deletar').
 * @returns {function} O middleware de verificação.
 */
const checkPermission = (modulo, permissao_requerida) => {
  return async (req, res, next) => {
    if (!req.usuario || !req.usuario.perfil) {
      return res.status(401).json({ error: 'Não autorizado, perfil de usuário não encontrado.' });
    }

    try {
      const permissao = await Permissao.findByProfileAndModule(req.usuario.perfil, modulo);

      if (permissao && permissao[permissao_requerida]) {
        next(); // Usuário tem a permissão
      } else {
        res.status(403).json({ error: 'Acesso negado. Você não tem permissão para esta ação.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Erro ao verificar permissões.' });
    }
  };
};

module.exports = { protect, checkPermission };
