const pool = require('../config/database');

const Usuario = {
  // Modificado para ser usado por um administrador para criar um novo usuário.
  // O nome de usuário será o e-mail inicialmente.
  async create(email, perfil = 'usuario') {
    // Garante que o nome_usuario não exceda o limite do banco de dados.
    // Usa a parte local do e-mail como base, truncado para 20 caracteres.
    let nomeUsuario = email.split('@')[0];
    if (nomeUsuario.length > 20) {
      nomeUsuario = nomeUsuario.substring(0, 20);
    }

    const query = `
      INSERT INTO usuarios (nome_usuario, email, perfil)
      VALUES ($1, $2, $3)
      RETURNING id_usuario, nome_usuario, email, perfil;
    `;
    const values = [nomeUsuario, email, perfil];
    
    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('E-mail ou nome de usuário já está em uso.');
      }
      throw error;
    }
  },

  async findByUsername(nome_usuario) {
    const query = `
      SELECT id_usuario, nome_usuario, email, perfil, senha_hash FROM usuarios WHERE nome_usuario = $1;
    `;
    const values = [nome_usuario];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async findByEmail(email) {
    const query = `
      SELECT * FROM usuarios WHERE email = $1;
    `;
    const values = [email];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async findById(id) {
    const query = `
      SELECT id_usuario, nome_usuario, email, perfil FROM usuarios WHERE id_usuario = $1;
    `;
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async findByToken(token) {
    const query = `
      SELECT * FROM usuarios WHERE token_redefinir_senha = $1 AND token_expiracao > NOW();
    `;
    const values = [token];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async findAll() {
    const query = `
      SELECT id_usuario, nome_usuario, email, perfil FROM usuarios ORDER BY nome_usuario;
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  // Função de atualização flexível para modificar quaisquer campos.
  async update(id, fields) {
    const validFields = Object.entries(fields).filter(([key, value]) => key !== 'id_usuario' && value !== undefined);

    if (validFields.length === 0) {
      return this.findById(id); // Nada a atualizar, retorna o usuário atual
    }

    const setClause = validFields
      .map(([key], index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = validFields.map(([, value]) => value);
    
    const query = `
      UPDATE usuarios
      SET ${setClause}
      WHERE id_usuario = $1
      RETURNING id_usuario, nome_usuario, email, perfil;
    `;

    const { rows } = await pool.query(query, [id, ...values]);
    return rows[0];
  },

  async delete(id) {
    const query = `
      DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *;
    `;
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }
};

module.exports = Usuario;
