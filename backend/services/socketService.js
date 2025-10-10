const jwt = require('jsonwebtoken');
const Mensagem = require('../models/mensagemModel');
const Permissao = require('../models/permissaoModel'); // Importar o modelo de permissão

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
      socket.usuario = decoded; // Anexa os dados do usuário ao objeto do socket
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

        // 2. Preparar o objeto da mensagem para enviar aos clientes (incluindo o nome de usuário)
        const mensagemParaClientes = {
          id_mensagem: novaMensagem.id_mensagem,
          texto: novaMensagem.texto,
          timestamp: novaMensagem.timestamp,
          id_usuario: socket.usuario.id_usuario,
          nome_usuario: socket.usuario.nome_usuario,
        };

        // 3. Transmitir a mensagem para todos os clientes conectados
        io.emit('mensagem_recebida', mensagemParaClientes);

      } catch (error) {
        console.error('[Socket.IO] Erro ao processar nova mensagem:', error);
        socket.emit('erro_chat', { message: 'Erro ao enviar a mensagem. Tente novamente.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Usuário desconectado: ${socket.usuario.nome_usuario} (${socket.id})`);
    });

    // Handler para apagar mensagens, usando o sistema de permissões
    socket.on('apagar_mensagem', async (id_mensagem) => {
      try {
        if (!socket.usuario || !socket.usuario.perfil) {
          return socket.emit('erro_chat', { message: 'Usuário não autenticado corretamente.' });
        }

        const permissao = await Permissao.findByProfileAndModule(socket.usuario.perfil, 'chat');
        
        if (!permissao || !permissao.pode_deletar) {
          return socket.emit('erro_chat', { message: 'Ação não permitida.' });
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