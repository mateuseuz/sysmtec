const Log = require('../models/logModel');

const createLog = async (autor, acao) => {
  try {
    await Log.create(autor, acao);
  } catch (error) {
    console.error('Falha ao registrar log:', error);
    // Decide if you want to throw the error or just log it
    // For now, we'll just log it to avoid interrupting the main operation
  }
};

const getLogs = async (req, res) => {
  try {
    const logs = await Log.getAll();
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar logs' });
  }
};

module.exports = {
  createLog,
  getLogs,
};
