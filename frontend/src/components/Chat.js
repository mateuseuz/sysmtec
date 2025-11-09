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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Conexão socket e usuário
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('usuario') || 'null');
    const token = localStorage.getItem('token');

    if (user && token) {
      setCurrentUser(user);

      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: { token }
      });

      socket.current = newSocket;

      newSocket.on('connect', () => {
        setIsConnected(true);
      });

      newSocket.on('mensagem_recebida', (mensagem) => setMessages(prev => [...prev, mensagem]));
      newSocket.on('mensagem_apagada', ({ id_mensagem }) => {
        setMessages(prev => prev.filter(msg => msg.id_mensagem !== id_mensagem));
        toast.info("Uma mensagem foi removida do chat.");
      });

      newSocket.on('disconnect', () => {
        toast.warn("Desconectado do chat.");
        setIsConnected(false);
      });

      newSocket.on('erro_chat', (error) => toast.error(`Erro no chat: ${error.message}`));

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
        setIsConnected(false);
      };
    }
  }, []);

  // Carregar histórico de mensagens após definir o usuário
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await api.listarMensagens();
        setMessages(history);
      } catch (error) {
        if (error && error.message && !error.message.includes('Acesso negado')) {
          toast.error(`Erro ao carregar histórico do chat: ${error.message}`);
        }
      }
    };
    
    if (currentUser) {
      fetchHistory();
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
    if (socket.current) {
      socket.current.emit('apagar_mensagem', id_mensagem);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  const formatUserName = (fullName) => {
    if (!fullName) return '';
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length < 2) {
      return fullName;
    }
    const firstName = nameParts[0];
    const lastNameInitial = nameParts[nameParts.length - 1].charAt(0);
    return `${firstName} ${lastNameInitial}.`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  
  // Apenas usuários conectados podem ver o chat
  if (!currentUser) {
    return null;
  }

  return (
    <div className={`chat-container ${isOpen ? 'open' : 'closed'}`}>
      <div className="chat-header" onClick={toggleChat}>
        <h3>Chat</h3>
        <span className="toggle-icon">
          <FontAwesomeIcon icon={isOpen ? faTimes : faComments} />
        </span>
      </div>
      {isOpen && (
        <div className="chat-body">
          <div className="messages-area">
            {messages.map((msg) => (
              <div key={msg.id_mensagem} className={`message-wrapper ${msg.id_usuario === currentUser?.id_usuario ? 'mine' : 'other'}`}>
                <span className="user-name">{formatUserName(msg.nome_usuario)}</span>
                <div className="message">
                  <p>{msg.texto}</p>
                  <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
                  {currentUser?.perfil === 'admin' && (
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