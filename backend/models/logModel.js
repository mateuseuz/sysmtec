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
  }
};

module.exports = Log;