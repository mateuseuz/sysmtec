const OrdemServico = require('../models/ordemServicoModel');

exports.createOrdemServico = async (req, res) => {
  try {
    const { nome_projeto, id_cliente, situacao, observacoes, fk_id_orcamento } = req.body;
    const novaOrdemServico = await OrdemServico.create(
      nome_projeto,
      id_cliente,
      situacao,
      observacoes,
      fk_id_orcamento
    );
    res.status(201).json(novaOrdemServico);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateOrdemServico = async (req, res) => {
  try {
    const { nome_projeto, id_cliente, situacao, observacoes, fk_id_orcamento } = req.body;
    const ordemServicoAtualizada = await OrdemServico.update(
      req.params.id,
      nome_projeto,
      id_cliente,
      situacao,
      observacoes,
      fk_id_orcamento
    );
    res.status(200).json(ordemServicoAtualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getOrdensServico = async (req, res) => {
  try {
    const ordensServico = await OrdemServico.getAll();
    res.status(200).json(ordensServico);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getOrdemServicoById = async (req, res) => {
  try {
    const ordemServico = await OrdemServico.getById(req.params.id);
    if (!ordemServico) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }
    res.status(200).json(ordemServico);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteOrdemServico = async (req, res) => {
  try {
    const id_ordem_servico = req.params.id;
    await OrdemServico.delete(id_ordem_servico);
    res.status(200).json({ message: 'Ordem de serviço deletada com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
