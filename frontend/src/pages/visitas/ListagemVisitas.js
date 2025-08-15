import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/Clientes.css';
import '../../styles/Agenda.css';

function ListagemVisitas() {
  const [visitas, setVisitas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [centerDate, setCenterDate] = useState(new Date());
  const carouselRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  const carregarVisitas = async () => {
    setIsLoading(true);
    try {
      const data = await api.listarVisitas();
      setVisitas(data);
    } catch (error) {
      toast.error('Erro ao carregar visitas: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarVisitas();
  }, []);

  const datesToShow = useMemo(() => {
    const start = new Date(centerDate);
    start.setDate(centerDate.getDate() - 2);
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [centerDate]);
  
  useEffect(() => {
    if (carouselRef.current) {
      const centerIndex = datesToShow.findIndex(d => d.toDateString() === centerDate.toDateString());
      if (centerIndex !== -1) {
        const cardElement = carouselRef.current.children[centerIndex];
        if (cardElement) {
          const scrollLeft = cardElement.offsetLeft - (carouselRef.current.offsetWidth / 2) + (cardElement.offsetWidth / 2);
          carouselRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
      }
    }
  }, [centerDate, visitas, datesToShow]);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta visita?')) {
      try {
        await api.deletarVisita(id);
        toast.success('Visita excluída com sucesso!');
        carregarVisitas();
      } catch (error) {
        toast.error('Erro ao excluir visita.');
      }
    }
  };

  const handleNav = (direction) => {
    setCenterDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + direction);
      return newDate;
    });
  };

  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Hoje';
    return new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' });
  };
  
  const filteredVisitas = useMemo(() => {
    if (!searchTerm) return visitas;
    const searchLower = searchTerm.toLowerCase();
    return visitas.filter(item => 
      item.titulo.toLowerCase().includes(searchLower) ||
      (item.nome_cliente && item.nome_cliente.toLowerCase().includes(searchLower)) ||
      (item.observacoes && item.observacoes.toLowerCase().includes(searchLower))
    );
  }, [visitas, searchTerm]);

  return (
    <div className="sysmtec-container">
      <header className="sysmtec-header"><h1>SYSMTEC</h1></header>
      <div className="sysmtec-sidebar">
        <nav>
          <ul>
            <li className="active"><Link to="/agenda"><span>🗓️</span>Agenda</Link></li>
            <li><Link to="/clientes"><span>👥</span>Clientes</Link></li>
            <li><Link to="/ordens-servico"><span>🛠️</span>Ordens de Serviço</Link></li>
            <li><Link to="/orcamentos"><span>📄</span>Orçamentos</Link></li>
            <li><Link to="/log"><span>📋</span>Log de alterações</Link></li>
          </ul>
        </nav>
      </div>

      <main className="sysmtec-main">
        <div className="agenda-header">
          <Link to="/agenda/novo" className="add-client-link">➕ CADASTRAR VISITA</Link>
          <div className="agenda-filters">
            <input 
              type="text"
              placeholder="Pesquisar em todas as visitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="agenda-search-input"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container"><div className="spinner"></div><p>Carregando...</p></div>
        ) : (
          <div className="carousel-container">
            <button onClick={() => handleNav(-1)} className="carousel-arrow left-arrow">‹</button>
            <div className="carousel-track" ref={carouselRef}>
              {datesToShow.map(date => {
                const dayString = date.toISOString().slice(0, 10);
                const appointmentsForDay = filteredVisitas.filter(v => v.data_agendamento.startsWith(dayString));
                const isCenter = date.toDateString() === centerDate.toDateString();

                return (
                  <div key={dayString} className={`carousel-card ${isCenter ? 'center' : ''}`}>
                    <h3>{formatDate(date)}</h3>
                    <div className="appointments-list">
                      {appointmentsForDay.length > 0 ? (
                        <ul>
                          {appointmentsForDay.map(visita => (
                            <li key={visita.id_agendamento}>
                              <div className="appointment-info">
                                <span className="appointment-time">{formatTime(visita.data_agendamento)}</span>
                                <span className="appointment-title">{visita.titulo}</span>
                              </div>
                              <div className="appointment-actions">
                                <Link to={`/agenda/visualizar/${visita.id_agendamento}`} className="view-button" title="Visualizar">🔎</Link>
                                <Link to={`/agenda/editar/${visita.id_agendamento}`} className="edit-button" title="Editar">✏️</Link>
                                <button onClick={() => handleDelete(visita.id_agendamento)} className="delete-button" title="Excluir">🗑️</button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-appointments">Sem compromissos</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => handleNav(1)} className="carousel-arrow right-arrow">›</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default ListagemVisitas;
