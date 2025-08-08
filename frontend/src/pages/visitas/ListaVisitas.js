import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/Clientes.css'; // Estilos base
import '../../styles/Agenda.css';   // Estilos específicos da agenda

function ListaVisitas() {
  const [visitas, setVisitas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
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
    carregarVisitas();
  }, []);

  const filteredVisitas = useMemo(() => {
    return visitas.filter(item => {
      const itemDate = new Date(item.data_agendamento).toISOString().slice(0, 10);
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = (
        item.titulo.toLowerCase().includes(searchLower) ||
        (item.nome_cliente && item.nome_cliente.toLowerCase().includes(searchLower)) ||
        (item.observacoes && item.observacoes.toLowerCase().includes(searchLower))
      );
      
      const matchesDate = filterDate ? itemDate === filterDate : true;

      return matchesSearch && matchesDate;
    });
  }, [visitas, searchTerm, filterDate]);

  const datesToShow = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i - 2);
      return date;
    });
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (date) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    let dateString = date.toLocaleDateString('pt-BR', options);
    return dateString.charAt(0).toUpperCase() + dateString.slice(1);
  };
  
  const getDayLabel = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCompare = new Date(date);
    dateToCompare.setHours(0, 0, 0, 0);

    if (today.getTime() === dateToCompare.getTime()) {
      return 'Hoje';
    }
    return formatDate(date);
  }

  return (
    <div className="sysmtec-container">
      <header className="sysmtec-header">
        <h1>SYSMTEC</h1>
      </header>

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
          <Link to="/agenda/novo" className="add-client-link">
            + AGENDAR VISITA
          </Link>
          <div className="agenda-filters">
            <input 
              type="text"
              placeholder="Pesquisar nas visitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="agenda-search-input"
            />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="agenda-date-filter"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando visitas...</p>
          </div>
        ) : (
          <div className="agenda-view">
            {datesToShow.map(date => {
              const dayString = date.toISOString().slice(0, 10);
              const appointmentsForDay = filteredVisitas.filter(a => a.data_agendamento.startsWith(dayString));

              return (
                <div key={dayString} className="agenda-day">
                  <h3>{getDayLabel(date)}</h3>
                  {appointmentsForDay.length > 0 ? (
                    <ul>
                      {appointmentsForDay.map(visita => (
                        <li key={visita.id_agendamento}>
                          <span className="appointment-time">{formatTime(visita.data_agendamento)}</span>
                          <span className="appointment-title">{visita.titulo}</span>
                          {visita.nome_cliente && <span className="appointment-client">({visita.nome_cliente})</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-appointments">Sem compromissos marcados</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default ListaVisitas;
