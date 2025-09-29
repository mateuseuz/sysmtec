const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_jwt_padrao');

      // Attach user to the request object (without the password)
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

const isAdmin = (req, res, next) => {
  // Verifica se o usuário tem o perfil 'admin'
  if (req.usuario && req.usuario.perfil === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado. Esta rota é restrita a administradores.' });
  }
};

module.exports = { protect, isAdmin };
