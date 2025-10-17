const pool = require('../config/database');

const Log = {
  async create(autor, acao, alvo) {
    const query = `
      INSERT INTO logs (autor, acao, alvo) 
      VALUES ($1, $2, $3) 
      RETURNING *`;
    
    const values = [autor, acao, alvo];
    
    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Erro ao criar log:', error);
      throw error;
    }
  },

  async getAll() {
    const { rows } = await pool.query('SELECT * FROM logs ORDER BY data DESC');
    return rows;
  },

  async deleteAll() {
    const query = 'DELETE FROM logs';
    try {
      await pool.query(query);
      return { message: 'Todos os logs foram deletados com sucesso.' };
    } catch (error) {
      console.error('Erro ao deletar logs:', error);
      throw error;
    }
  }
};

module.exports = Log;