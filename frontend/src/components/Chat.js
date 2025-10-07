import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faTimes } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import '../styles/Chat.css';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [socket, setSocket] = useState(null);
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

      setSocket(newSocket);

      newSocket.on('connect', () => {
        toast.success("Conectado ao chat!");
      });

      newSocket.on('mensagem_recebida', (mensagem) => {
        setMessages((prevMessages) => [...prevMessages, mensagem]);
      });

      newSocket.on('disconnect', () => {
        toast.warn("Desconectado do chat.");
      });

      newSocket.on('erro_chat', (error) => {
        toast.error(`Erro no chat: ${error.message}`);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await api.listarMensagens();
        setMessages(history);
      } catch (error) {
        toast.error('Erro ao carregar o histórico do chat.');
      }
    };
    
    fetchHistory();
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (socket && newMessage.trim()) {
      socket.emit('nova_mensagem', newMessage.trim());
      setNewMessage('');
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
              <div 
                key={msg.id_mensagem} 
                className={`message ${msg.id_usuario === currentUser?.id_usuario ? 'mine' : 'other'}`}>
                <span className="user-name">{msg.nome_usuario}</span>
                <p>{msg.texto}</p>
                <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
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
              disabled={!socket}
            />
            <button type="submit" disabled={!socket}>Enviar</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;