const Orcamento = require('../models/orcamentoModel');
const { createLog } = require('./logController');

exports.createOrcamento = async (req, res) => {
  try {
    const novoOrcamento = await Orcamento.create(req.body);
    await createLog(req.usuario.nome_completo, 'Criação', `Orçamento "${req.body.nome}"`);
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
      return res.status(404).json({ error: 'Orçamento não encontrado.' });
    }
    res.status(200).json(orcamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateOrcamento = async (req, res) => {
  try {
    const id_orcamento = req.params.id;
    const orcamentoAtualizado = await Orcamento.update(id_orcamento, req.body);
    await createLog(req.usuario.nome_completo, 'Atualização', `Orçamento "${req.body.nome}"`);
    res.status(200).json(orcamentoAtualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteOrcamento = async (req, res) => {
  try {
    const id_orcamento = req.params.id;
    const orcamento = await Orcamento.getById(id_orcamento);
    if (!orcamento) {
      return res.status(404).json({ error: 'Orçamento não encontrado.' });
    }
    await Orcamento.delete(id_orcamento);
    await createLog(req.usuario.nome_completo, 'Exclusão', `Orçamento "${orcamento.nome}"`);
    res.status(200).json({ message: 'Orçamento deletado com sucesso.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
