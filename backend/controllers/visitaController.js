const Visita = require('../models/visitaModel');
const { createLog } = require('./logController');

exports.createAgendamento = async (req, res) => {
  try {
    const novoAgendamento = await Visita.create(req.body);
    await createLog(req.usuario.nome_completo, 'Criação', `Agendamento "${req.body.titulo}"`);
    res.status(201).json(novoAgendamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAgendamentos = async (req, res) => {
  try {
    const agendamentos = await Visita.getAll();
    res.status(200).json(agendamentos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAgendamentoById = async (req, res) => {
  try {
    const agendamento = await Visita.getById(req.params.id);
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }
    res.status(200).json(agendamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateAgendamento = async (req, res) => {
  try {
    const agendamentoAtualizado = await Visita.update(req.params.id, req.body);
    await createLog(req.usuario.nome_completo, 'Atualização', `Agendamento "${req.body.titulo}"`);
    res.status(200).json(agendamentoAtualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteAgendamento = async (req, res) => {
  try {
    const id_visita = req.params.id;
    const visita = await Visita.getById(id_visita);
    if (!visita) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }
    await Visita.delete(id_visita);
    await createLog(req.usuario.nome_completo, 'Exclusão', `Agendamento "${visita.titulo}"`);
    res.status(200).json({ message: 'Agendamento deletado com sucesso.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
