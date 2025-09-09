const pool = require('../config/database');

const OrdemServico = {
  async create(ordemData) {
    const { nome, id_cliente, observacoes = null, id_orcamento = null } = ordemData;
    if (!nome || nome.length > 100) {
      throw new Error('Nome do projeto é obrigatório e deve ter até 100 caracteres');
    }
    if (!id_cliente) {
      throw new Error('Cliente é obrigatório');
    }

    const query = `
      INSERT INTO ordens_servico 
      (nome, id_cliente, observacoes, id_orcamento) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *`;
    
    const values = [
      nome,
      id_cliente,
      observacoes,
      id_orcamento
    ];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async update(id_ordem_servico, ordemData) {
    const { nome, id_cliente, observacoes, id_orcamento } = ordemData;
    
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const addField = (field, value) => {
      if (value !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    };

    addField('nome', nome);
    addField('id_cliente', id_cliente);
    addField('observacoes', observacoes);
    addField('id_orcamento', id_orcamento);

    if (fields.length === 0) {
      // Retorna os dados atuais se nenhum campo for alterado
      return this.getById(id_ordem_servico);
    }

    values.push(id_ordem_servico);

    const query = `
      UPDATE ordens_servico 
      SET ${fields.join(', ')}, data_atualizacao = CURRENT_TIMESTAMP
      WHERE id_ordem_servico = $${paramIndex}
      RETURNING *`;

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) throw new Error('Ordem de serviço não encontrada');
    
    return rows[0];
  },

  async getAll() {
    const { rows } = await pool.query(`
      SELECT os.*, c.nome as nome_cliente 
      FROM ordens_servico os
      JOIN clientes c ON os.id_cliente = c.id_cliente
    `);
    return rows;
  },

  async getById(id_ordem_servico) {
    const { rows } = await pool.query(`
      SELECT os.*, c.nome as nome_cliente
      FROM ordens_servico os 
      JOIN clientes c ON os.id_cliente = c.id_cliente
      WHERE id_ordem_servico = $1
    `, [id_ordem_servico]);
    if (rows.length === 0) return null;
    
    return rows[0];
  },
  
  async delete(id_ordem_servico) {
    const { rowCount } = await pool.query('DELETE FROM ordens_servico WHERE id_ordem_servico = $1', [id_ordem_servico]);
    if (rowCount === 0) {
      throw new Error('Ordem de serviço não encontrada');
    }
    return true;
  }
};

module.exports = OrdemServico;
