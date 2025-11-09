const Mensagem = require('../models/mensagemModel');

exports.getMensagens = async (req, res) => {
  try {
    const mensagens = await Mensagem.findAll();
    res.status(200).json(mensagens);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o histórico de mensagens.' });
  }
};