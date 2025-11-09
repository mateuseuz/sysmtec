const pool = require('../config/database');

const Usuario = {
  // Cria um novo usuário apenas com e-mail e perfil.
  async create(email, perfil = 'usuario') {
    const query = `
      INSERT INTO usuarios (email, perfil)
      VALUES ($1, $2)
      RETURNING id_usuario, email, perfil;
    `;
    // A senha_hash e o nome_completo podem ser nulos inicialmente.
    const values = [email, perfil];
    
    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      if (error.code === '23505') { // violação de chave única
        throw new Error('Este e-mail já está em uso.');
      }
      throw error;
    }
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
      SELECT id_usuario, nome_completo, email, perfil FROM usuarios WHERE id_usuario = $1;
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
      SELECT id_usuario, nome_completo, email, perfil FROM usuarios WHERE perfil <> 'admin' ORDER BY nome_completo;
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
      RETURNING id_usuario, nome_completo, email, perfil;
    `;

    const { rows } = await pool.query(query, [id, ...values]);
    return rows[0];
  },

  async delete(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Primeiro, deleta as permissões associadas ao usuário
      await client.query('DELETE FROM permissoes_usuario WHERE id_usuario = $1', [id]);
      
      // Depois, deleta o usuário
      const deleteUserQuery = 'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *;';
      const { rows } = await client.query(deleteUserQuery, [id]);

      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = Usuario;
