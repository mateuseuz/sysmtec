const OrdemServico = require('../models/ordemServicoModel');
const { createLog } = require('./logController');

exports.createOrdemServico = async (req, res) => {
  try {
    const novaOrdemServico = await OrdemServico.create(req.body);
    await createLog(req.usuario.nome_usuario, `criou a ordem de serviço #${novaOrdemServico.id_ordem_servico}`);
    res.status(201).json(novaOrdemServico);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateOrdemServico = async (req, res) => {
  try {
    const ordemServicoAtualizada = await OrdemServico.update(req.params.id, req.body);
    await createLog(req.usuario.nome_usuario, `atualizou a ordem de serviço #${req.params.id}`);
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
    await createLog(req.usuario.nome_usuario, `deletou a ordem de serviço #${id_ordem_servico}`);
    res.status(200).json({ message: 'Ordem de serviço deletada com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
