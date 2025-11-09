const pool = require('../config/database');

const Visita = {
  async create(agendamento) {
    const { titulo, data_agendamento, endereco, id_cliente, observacoes } = agendamento;
    const query = `
      INSERT INTO visitas (titulo, data_agendamento, endereco, id_cliente, observacoes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [titulo, data_agendamento, endereco, id_cliente, observacoes];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async getAll() {
    const query = `
      SELECT a.*, c.nome as nome_cliente
      FROM visitas a
      LEFT JOIN clientes c ON a.id_cliente = c.id_cliente
      ORDER BY a.data_agendamento ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async getById(id) {
    const query = `
      SELECT a.*, c.nome as nome_cliente
      FROM visitas a
      LEFT JOIN clientes c ON a.id_cliente = c.id_cliente
      WHERE a.id_agendamento = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  async update(id, agendamento) {
    const { titulo, data_agendamento, endereco, id_cliente, observacoes } = agendamento;
    const query = `
      UPDATE visitas
      SET titulo = $1, data_agendamento = $2, endereco = $3, id_cliente = $4, observacoes = $5, data_atualizacao = CURRENT_TIMESTAMP
      WHERE id_agendamento = $6
      RETURNING *;
    `;
    const values = [titulo, data_agendamento, endereco, id_cliente, observacoes, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM visitas WHERE id_agendamento = $1', [id]);
    if (rowCount === 0) {
      throw new Error('Agendamento não encontrado.');
    }
    return true;
  }
};

module.exports = Visita;
