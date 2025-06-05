const pool = require('../config/database');
const { formatCPForCNPJ, formatCelular } = require('../../frontend/src/utils/validations');

const Cliente = {
  async create(nome, cpf_cnpj, endereco = null, email = null, celular = null, observacoes = null) {
    // Validação básica (o controller já fez a validação completa)
    if (!nome || nome.length > 50) {
      throw new Error('Nome é obrigatório e deve ter até 50 caracteres');
    }

    const query = `
      INSERT INTO clientes 
      (nome, cpf_cnpj, endereco, email, celular, observacoes) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`;
    
    const values = [
      nome,
      cpf_cnpj, // Já vem validado e limpo do controller
      endereco,
      email,
      celular,  // Já vem validado e limpo do controller
      observacoes
    ];
    
    try {
      const { rows } = await pool.query(query, values);
      return {
        ...rows[0],
        cpf_cnpj_formatado: formatCPForCNPJ(rows[0].cpf_cnpj),
        celular_formatado: formatCelular(rows[0].celular)
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('CPF/CNPJ já cadastrado');
      }
      throw error;
    }
  },

  async update(id_cliente, nome, cpf_cnpj, endereco, email, celular, observacoes) {
    // Validação básica
    if (!nome || nome.length > 50) {
      throw new Error('Nome é obrigatório e deve ter até 50 caracteres');
    }

    // Query dinâmica
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
    addField('cpf_cnpj', cpf_cnpj); // Já validado
    addField('endereco', endereco);
    addField('email', email);
    addField('celular', celular); // Já validado
    addField('observacoes', observacoes);

    values.push(id_cliente);

    const query = `
      UPDATE clientes 
      SET ${fields.join(', ')}
      WHERE id_cliente = $${paramIndex}
      RETURNING *`;

    try {
      const { rows } = await pool.query(query, values);
      if (rows.length === 0) throw new Error('Cliente não encontrado');
      
      return {
        ...rows[0],
        cpf_cnpj_formatado: formatCPForCNPJ(rows[0].cpf_cnpj),
        celular_formatado: formatCelular(rows[0].celular)
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('CPF/CNPJ já cadastrado em outro cliente');
      }
      throw error;
    }
  },

  async getAll() {
    const { rows } = await pool.query('SELECT * FROM clientes');
    return rows.map(cliente => ({
      ...cliente,
      cpf_cnpj_formatado: formatCPForCNPJ(cliente.cpf_cnpj),
      celular_formatado: formatCelular(cliente.celular)
    }));
  },

  async getById(id_cliente) {
    const { rows } = await pool.query('SELECT * FROM clientes WHERE id_cliente = $1', [id_cliente]);
    if (rows.length === 0) return null;
    
    return {
      ...rows[0],
      cpf_cnpj_formatado: formatCPForCNPJ(rows[0].cpf_cnpj),
      celular_formatado: formatCelular(rows[0].celular)
    };
  },
  
  async delete(id_cliente) {
    const { rowCount } = await pool.query('DELETE FROM clientes WHERE id_cliente = $1', [id_cliente]);
    if (rowCount === 0) {
      throw new Error('Cliente não encontrado');
    }
    return true;
  }
};

module.exports = Cliente;