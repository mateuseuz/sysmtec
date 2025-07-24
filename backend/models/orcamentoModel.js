const pool = require('../config/database');

const Orcamento = {
  async create(descricao, valor) {
    if (!descricao || !valor) {
      throw new Error('Descrição and valor are required');
    }

    const query = `
      INSERT INTO orcamentos 
      (descricao, valor) 
      VALUES ($1, $2) 
      RETURNING *`;
    
    const values = [
      descricao,
      valor
    ];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async getAll() {
    const { rows } = await pool.query('SELECT * FROM orcamentos');
    return rows;
  },

  async getById(id_orcamento) {
    const { rows } = await pool.query('SELECT * FROM orcamentos WHERE id_orcamento = $1', [id_orcamento]);
    if (rows.length === 0) return null;
    
    return rows[0];
  },
  
  async delete(id_orcamento) {
    const { rowCount } = await pool.query('DELETE FROM orcamentos WHERE id_orcamento = $1', [id_orcamento]);
    if (rowCount === 0) {
      throw new Error('Orçamento não encontrado');
    }
    return true;
  }
};

module.exports = Orcamento;
