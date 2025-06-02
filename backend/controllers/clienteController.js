const Cliente = require('../models/clienteModel');

// Funções de validação real (adicionadas no topo do arquivo)
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

// Controller original com apenas a validação real adicionada
exports.createCliente = async (req, res) => {
  try {
    console.log('Dados recebidos no backend:', req.body); // Log crucial
    const { nome, cpf_cnpj, endereco, email, celular, observacoes } = req.body;
    
    const cpfCnpjLimpo = cpf_cnpj.replace(/\D/g, '');
    
    // Validação modificada (agora com validação real)
    if (!(
      (cpfCnpjLimpo.length === 11 && validarCPF(cpfCnpjLimpo)) ||
      (cpfCnpjLimpo.length === 14 && validarCNPJ(cpfCnpjLimpo))
    )) {
      throw new Error('CPF/CNPJ inválido');
    }
    
    if (celular && (!/^\d+$/.test(celular) || (celular.length !== 10 && celular.length !== 11))) {
      throw new Error('Celular deve conter apenas números e ter 10 ou 11 dígitos');
    }
    
    const novoCliente = await Cliente.create(
      nome, 
      cpfCnpjLimpo, // Já está limpo e validado
      endereco, 
      email, 
      celular, 
      observacoes
    );
    
    res.status(201).json(novoCliente);
  } catch (error) {
    console.error('Erro detalhado:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.getAll();
    res.status(200).json(clientes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.getById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.status(200).json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateCliente = async (req, res) => {
  try {
    const id_cliente = req.params.id;

    const clienteExistente = await Cliente.getById(id_cliente);
    if (!clienteExistente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Mescla os dados existentes com os novos
    const {
      nome = clienteExistente.nome,
      cpf_cnpj = clienteExistente.cpf_cnpj,
      endereco = clienteExistente.endereco,
      email = clienteExistente.email,
      celular = clienteExistente.celular,
      observacoes = clienteExistente.observacoes
    } = req.body;

    const cpfCnpjLimpo = cpf_cnpj.replace(/\D/g, '');
    const celularLimpo = celular ? celular.replace(/\D/g, '') : null;

    const clienteAtualizado = await Cliente.update(
      id_cliente,
      nome,
      cpfCnpjLimpo,
      endereco,
      email,
      celularLimpo,
      observacoes
    );

    res.status(200).json(clienteAtualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCliente = async (req, res) => {
  try {
    const id_cliente = req.params.id;
    await Cliente.delete(id_cliente);
    res.status(200).json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};