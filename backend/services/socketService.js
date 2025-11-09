const jwt = require('jsonwebtoken');
const Mensagem = require('../models/mensagemModel');
const Usuario = require('../models/usuarioModel');
const PermissaoUsuario = require('../models/permissaoUsuarioModel');

const initSocket = (io) => {
  // Middleware de autenticação do Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token not provided.'));
    }

    jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_jwt_padrao', (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token.'));
      }
      socket.usuario = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Usuário autenticado conectado: ${socket.usuario.nome_usuario} (${socket.id})`);

    // Handler para receber novas mensagens
    socket.on('nova_mensagem', async (texto) => {
      if (!texto || typeof texto !== 'string' || texto.trim() === '') {
        // Envia um erro de volta para o cliente que enviou a mensagem
        socket.emit('erro_chat', { message: 'A mensagem não pode estar vazia.' });
        return;
      }
      
      try {
        // 1. Salvar a mensagem no banco de dados
        const novaMensagem = await Mensagem.create(socket.usuario.id_usuario, texto.trim());
        
        // 2. Buscar o nome de usuário atualizado do banco de dados
        const usuario = await Usuario.findById(socket.usuario.id_usuario);
        const nomeUsuario = usuario ? usuario.nome_completo : 'Usuário desconhecido';

        // 3. Preparar o objeto da mensagem com o nome de usuário do banco
        const mensagemParaClientes = {
          id_mensagem: novaMensagem.id_mensagem,
          texto: novaMensagem.texto,
          timestamp: novaMensagem.timestamp,
          id_usuario: socket.usuario.id_usuario,
          nome_usuario: nomeUsuario,
        };

        // 4. Transmitir a mensagem para todos os  conectados
        io.emit('mensagem_recebida', mensagemParaClientes);

      } catch (error) {
        console.error('[Socket.IO] Erro ao processar nova mensagem:', error);
        socket.emit('erro_chat', { message: 'Erro ao enviar a mensagem. Tente novamente.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Usuário desconectado: ${socket.usuario.nome_usuario} (${socket.id})`);
    });

    // Handler para apagar mensagens (sem verificação de permissão)
    socket.on('apagar_mensagem', async (id_mensagem) => {
      try {
        if (!socket.usuario || socket.usuario.perfil !== 'admin') {
          return socket.emit('erro_chat', { message: 'Acesso negado. Você não tem permissão para apagar mensagens.' });
        }

        if (!id_mensagem) {
          return socket.emit('erro_chat', { message: 'ID da mensagem não fornecido.' });
        }

        const mensagemApagada = await Mensagem.delete(id_mensagem);

        if (mensagemApagada) {
          io.emit('mensagem_apagada', { id_mensagem: mensagemApagada.id_mensagem });
        } else {
          socket.emit('erro_chat', { message: 'Mensagem não encontrada.' });
        }
      } catch (error) {
        console.error('[Socket.IO] Erro ao apagar mensagem:', error);
        socket.emit('erro_chat', { message: 'Erro ao apagar a mensagem.' });
      }
    });
  });
};

module.exports = { initSocket };