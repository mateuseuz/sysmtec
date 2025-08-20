const Cliente = require('../models/clienteModel');
const { createLog } = require('./logController');
const { validarCPFCNPJ, validarCelular } = require('../../frontend/src/utils/validations');

exports.createCliente = async (req, res) => {
  try {
    const { nome, cpf_cnpj, endereco, email, celular, observacoes } = req.body;
    
    // Validações
    validarCPFCNPJ(cpf_cnpj);
    validarCelular(celular);
    
    const novoCliente = await Cliente.create(
      nome,
      cpf_cnpj.replace(/\D/g, ''),
      endereco,
      email,
      celular ? celular.replace(/\D/g, '') : null,
      observacoes
    );
    
    await createLog(req.usuario.nome_usuario, `criou o cliente "${nome}"`);
    res.status(201).json(novoCliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.searchClientes = async (req, res) => {
  try {
    const { nome } = req.query;
    const clientes = await Cliente.search(nome);
    res.status(200).json(clientes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateCliente = async (req, res) => {
  try {
    const { nome, cpf_cnpj, endereco, email, celular, observacoes } = req.body;
    
    // Validações
    validarCPFCNPJ(cpf_cnpj);
    validarCelular(celular);

    const clienteAtualizado = await Cliente.update(
      req.params.id,
      nome,
      cpf_cnpj.replace(/\D/g, ''),
      endereco,
      email,
      celular ? celular.replace(/\D/g, '') : null,
      observacoes
    );

    await createLog(req.usuario.nome_usuario, `atualizou o cliente "${nome}"`);
    res.status(200).json(clienteAtualizado);
  } catch (error) {
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

exports.deleteCliente = async (req, res) => {
  try {
    const id_cliente = req.params.id;
    const cliente = await Cliente.getById(id_cliente);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    await Cliente.delete(id_cliente);
    await createLog(req.usuario.nome_usuario, `deletou o cliente "${cliente.nome}"`);
    res.status(200).json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};