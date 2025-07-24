const Orcamento = require('../models/orcamentoModel');

exports.createOrcamento = async (req, res) => {
  try {
    const { descricao, valor } = req.body;
    const novoOrcamento = await Orcamento.create(
      descricao,
      valor
    );
    res.status(201).json(novoOrcamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getOrcamentos = async (req, res) => {
  try {
    const orcamentos = await Orcamento.getAll();
    res.status(200).json(orcamentos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getOrcamentoById = async (req, res) => {
  try {
    const orcamento = await Orcamento.getById(req.params.id);
    if (!orcamento) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    res.status(200).json(orcamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteOrcamento = async (req, res) => {
  try {
    const id_orcamento = req.params.id;
    await Orcamento.delete(id_orcamento);
    res.status(200).json({ message: 'Orçamento deletado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
