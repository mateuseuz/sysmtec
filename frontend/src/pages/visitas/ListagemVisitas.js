import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import '../../styles/Clientes.css';
import '../../styles/Agenda.css';

function ListagemVisitas() {
  const [visitas, setVisitas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

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

  const calendarEvents = useMemo(() => {
    return visitas.map(visita => ({
      id: visita.id_agendamento,
      title: visita.titulo,
      start: new Date(visita.data_agendamento),
    }));
  }, [visitas]);

  const handleEventClick = (clickInfo) => {
    navigate(`/agenda/visualizar/${clickInfo.event.id}`);
  };

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
        </div>

        {isLoading ? (
          <div className="loading-container"><div className="spinner"></div><p>Carregando...</p></div>
        ) : (
          <div className="calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              eventClick={handleEventClick}
              locale="pt-br"
              buttonText={{
                today: 'Hoje',
              }}
            />
          </div>
        )}
      </main>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {}}
        message="Esta ação não é mais suportada nesta tela."
      />
    </div>
  );
}

export default ListagemVisitas;
