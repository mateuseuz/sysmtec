const Log = require('../models/logModel');

exports.createLog = async (autor, acao, alvo) => {
  try {
    await Log.create(autor, acao, alvo);
  } catch (error) {
    console.error('Falha ao registrar log:', error);
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await Log.getAll();
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar logs.' });
  }
};

exports.clearLogs = async (req, res) => {
  try {
    await Log.deleteAll();
    res.status(200).json({ message: 'Histórico de logs limpo com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao limpar os logs.' });
  }
};