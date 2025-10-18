import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import '../styles/Chat.css';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const socket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [canDelete, setCanDelete] = useState(false); // Novo estado para permissão
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('usuario') || 'null');
    const token = localStorage.getItem('token');

    if (user && token) {
      setCurrentUser(user);

      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token: token
        }
      });

      socket.current = newSocket;

      newSocket.on('connect', () => {
        toast.success("Conectado ao chat!");
        setIsConnected(true);
      });

      newSocket.on('mensagem_recebida', (mensagem) => {
        setMessages((prevMessages) => [...prevMessages, mensagem]);
      });

      newSocket.on('mensagem_apagada', ({ id_mensagem }) => {
        setMessages((prevMessages) => prevMessages.filter(msg => msg.id_mensagem !== id_mensagem));
        toast.info("Uma mensagem foi removida do chat.");
      });

      newSocket.on('disconnect', () => {
        toast.warn("Desconectado do chat.");
        setIsConnected(false);
      });

      newSocket.on('erro_chat', (error) => {
        toast.error(`Erro no chat: ${error.message}`);
      });

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
        setIsConnected(false);
      };
    }
  }, []);

  useEffect(() => {
    const fetchHistoryAndPermissions = async () => {
      // Admin tem permissão para deletar por padrão, não precisa checar a API.
      if (currentUser?.perfil === 'admin') {
        setCanDelete(true);
      }

      try {
        const [history, minhasPermissoes] = await Promise.all([
          api.listarMensagens(),
          // Se não for admin, busca permissões. Se for, pode pular.
          currentUser?.perfil !== 'admin' ? api.getMinhasPermissoes() : Promise.resolve([])
        ]);

        setMessages(history);

        // A lógica de permissão só é necessária se não for admin
        if (currentUser?.perfil !== 'admin') {
          const chatPermission = minhasPermissoes.find(p => p.modulo_nome === 'chat');
          if (chatPermission && chatPermission.pode_deletar) {
            setCanDelete(true);
          }
        }
      } catch (error) {
        // Com Promise.all, o catch é acionado apenas uma vez.
        // Apenas mostramos o erro se não for um erro de "Acesso negado".
        if (error && error.message && !error.message.includes('Acesso negado')) {
          toast.error(`Erro ao carregar dados do chat: ${error.message}`);
        }
      }
    };
    
    if (currentUser) {
        fetchHistoryAndPermissions();
    }
  }, [currentUser]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (socket.current && newMessage.trim()) {
      socket.current.emit('nova_mensagem', newMessage.trim());
      setNewMessage('');
    }
  };

  const handleDeleteMessage = (id_mensagem) => {
    if (socket.current && canDelete) {
      socket.current.emit('apagar_mensagem', id_mensagem);
    } else {
      toast.error('Você não tem permissão para apagar mensagens.');
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className={`chat-container ${isOpen ? 'open' : 'closed'}`}>
      <div className="chat-header" onClick={toggleChat}>
        <h3>Chat Global</h3>
        <span className="toggle-icon">
          <FontAwesomeIcon icon={isOpen ? faTimes : faComments} />
        </span>
      </div>
      {isOpen && (
        <div className="chat-body">
          <div className="messages-area">
            {messages.map((msg) => (
              <div key={msg.id_mensagem} className={`message-wrapper ${msg.id_usuario === currentUser?.id_usuario ? 'mine' : 'other'}`}>
                <span className="user-name">{msg.nome_usuario}</span>
                <div className="message">
                  <p>{msg.texto}</p>
                  <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
                  {canDelete && (
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDeleteMessage(msg.id_mensagem)}
                      aria-label="Apagar mensagem"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="message-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={!isConnected}
            />
            <button type="submit" disabled={!isConnected}>Enviar</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;