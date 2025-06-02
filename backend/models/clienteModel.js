const pool = require('../config/database');

function validarCPF(cpf) {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  
  // Cálculo dos dígitos verificadores
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  
  return resto === parseInt(cpf.charAt(10));
}

function validarCNPJ(cnpj) {
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  // Cálculo do primeiro dígito verificador
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  // Cálculo do segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
}

// Teste se o e-mail é válido
const validateEmail = (email) => {
  if (!email) return true; // Campo opcional
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const formatCPForCNPJ = (cpfCnpj) => {
  if (!cpfCnpj) return '';
  const str = cpfCnpj.toString().replace(/\D/g, '');
  
  if (str.length === 11) {
    return str.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (str.length === 14) {
    return str.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return str;
};

const formatCelular = (celular) => {
  if (!celular) return '';
  return celular.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

const Cliente = {
  async create(nome, cpf_cnpj, endereco = null, email = null, celular = null, observacoes = null) {
    // Validações consistentes com a controller
    if (!nome || nome.length > 50) {
      throw new Error('Nome é obrigatório e deve ter até 50 caracteres');
    }

    const cpfCnpjLimpo = cpf_cnpj.replace(/\D/g, '');
    if (!(validarCPF(cpfCnpjLimpo) || validarCNPJ(cpfCnpjLimpo))) {
      throw new Error('CPF/CNPJ inválido');
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('E-mail inválido');
    }

    if (celular && !/^\d{10,11}$/.test(celular)) {
      throw new Error('Celular deve ter 10 ou 11 dígitos com DDD');
    }

    // Query (mantida igual)
    const query = `
        INSERT INTO clientes 
        (nome, cpf_cnpj, endereco, email, celular, observacoes) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`;
    
    const values = [nome, cpfCnpjLimpo, endereco, email, celular?.replace(/\D/g, ''), observacoes];
    
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

  async update(id_cliente, nome, cpf_cnpj, endereco, email, celular, observacoes) {
    if (!nome || nome.length > 50) {
      throw new Error('Nome é obrigatório e deve ter até 50 caracteres');
    }
    
    if (!cpf_cnpj || (cpf_cnpj.length !== 11 && cpf_cnpj.length !== 14)) {
      throw new Error('CPF/CNPJ é obrigatório e deve ter 11 (CPF) ou 14 (CNPJ) dígitos');
    }
  
    if (celular && (celular.length !== 10 && celular.length !== 11)) {
      throw new Error('Celular deve ter 10 ou 11 dígitos com DDD');
    }
  
    // Query dinâmica para atualizar apenas os campos fornecidos
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
  
    // Campos obrigatórios sempre são incluídos
    fields.push(`nome = $${paramIndex}`);
    values.push(nome);
    paramIndex++;
    
    fields.push(`cpf_cnpj = $${paramIndex}`);
    values.push(cpf_cnpj);
    paramIndex++;
  
    // Campos opcionais
    if (endereco !== undefined) {
      fields.push(`endereco = $${paramIndex}`);
      values.push(endereco);
      paramIndex++;
    }
    
    if (email !== undefined) {
      fields.push(`email = $${paramIndex}`);
      values.push(email);
      paramIndex++;
    }
    
    if (celular !== undefined) {
      fields.push(`celular = $${paramIndex}`);
      values.push(celular);
      paramIndex++;
    }
    
    if (observacoes !== undefined) {
      fields.push(`observacoes = $${paramIndex}`);
      values.push(observacoes);
      paramIndex++;
    }
  
    // Adiciona o ID no final
    values.push(id_cliente);
  
    const query = `
      UPDATE clientes 
      SET ${fields.join(', ')}
      WHERE id_cliente = $${paramIndex}
      RETURNING *`;
  
    try {
      const { rows } = await pool.query(query, values);
      if (rows.length === 0) {
        throw new Error('Cliente não encontrado');
      }
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
  
  async delete(id_cliente) {
    const { rowCount } = await pool.query('DELETE FROM clientes WHERE id_cliente = $1', [id_cliente]);
    if (rowCount === 0) {
      throw new Error('Cliente não encontrado');
    }
    return true;
  }
};

module.exports = Cliente;