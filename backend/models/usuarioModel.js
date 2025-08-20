const pool = require('../config/database');

const Usuario = {
  async create(nome_usuario, email, senha_hash) {
    const query = `
      INSERT INTO usuarios (nome_usuario, email, senha_hash)
      VALUES ($1, $2, $3)
      RETURNING id_usuario, nome_usuario, email;
    `;
    const values = [nome_usuario, email, senha_hash];
    
    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      // Código de erro para violação de unicidade (ex: usuário ou email já existe)
      if (error.code === '23505') {
        if (error.constraint === 'usuarios_nome_usuario_key') {
          throw new Error('Nome de usuário já está em uso.');
        }
        if (error.constraint === 'usuarios_email_key') {
          throw new Error('E-mail já está em uso.');
        }
      }
      throw error;
    }
  },

  async findByUsername(nome_usuario) {
    const query = `
      SELECT * FROM usuarios WHERE nome_usuario = $1;
    `;
    const values = [nome_usuario];
    const { rows } = await pool.query(query, values);
    return rows[0]; // Retorna o usuário encontrado ou undefined
  }
};

module.exports = Usuario;
