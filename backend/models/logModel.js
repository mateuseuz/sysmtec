const pool = require('../config/database');

const Log = {
  async create(autor, acao) {
    const query = `
      INSERT INTO logs (autor, acao) 
      VALUES ($1, $2) 
      RETURNING *`;
    
    const values = [autor, acao];
    
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
