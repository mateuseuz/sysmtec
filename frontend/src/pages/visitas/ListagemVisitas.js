import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import NavLink from '../../components/NavLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEye, faPencilAlt, faTrashAlt, faCalendarAlt, faUsers, faWrench, faFileInvoiceDollar, faHistory, faCogs } from '@fortawesome/free-solid-svg-icons';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import '../../styles/Clientes.css';
import '../../styles/Agenda.css';

function ListagemVisitas() {
  const [visitas, setVisitas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [popover, setPopover] = useState({ visible: false, x: 0, y: 0, event: null });
  const [visitaToDelete, setVisitaToDelete] = useState(null);

  const carregarVisitas = async () => {
    setIsLoading(true);
    try {
      const data = await api.listarVisitas();
      setVisitas(data);
    } catch (error) {
      toast.error('Erro ao carregar visitas: ' + error.message + '.');
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
    closePopover(); // Close any existing popover
    const eventEl = clickInfo.el;
    const rect = eventEl.getBoundingClientRect();
    setPopover({
      visible: true,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 60, // Position above the event
      event: clickInfo.event,
    });
    clickInfo.jsEvent.stopPropagation();
  };

  const closePopover = () => {
    setPopover({ visible: false, x: 0, y: 0, event: null });
  };

  const handleDelete = (id) => {
    setVisitaToDelete(id);
    closePopover();
  };

  const handleConfirmDelete = async () => {
    if (visitaToDelete) {
      try {
        await api.deletarVisita(visitaToDelete);
        toast.success('Visita excluída com sucesso!');
        setVisitaToDelete(null);
        carregarVisitas(); // Recarrega as visitas
      } catch (error) {
        toast.error('Erro ao deletar visita: ' + error.message + '.');
        setVisitaToDelete(null);
      }
    }
  };

  return (
    <div className="sysmtec-container" onClick={closePopover}>
      <header className="sysmtec-header"><h1>SYSMTEC</h1></header>
      <div className="sysmtec-sidebar">
        <nav>
          <ul>
            <NavLink to="/agenda" icon={faCalendarAlt}>Agenda</NavLink>
            <NavLink to="/clientes" icon={faUsers}>Clientes</NavLink>
            <NavLink to="/ordens-servico" icon={faWrench}>Ordens de Serviço</NavLink>
            <NavLink to="/orcamentos" icon={faFileInvoiceDollar}>Orçamentos</NavLink>
            <NavLink to="/logs" icon={faHistory}>Log de alterações</NavLink>
            <NavLink to="/painel-controle" icon={faCogs}>Painel de Controle</NavLink>
          </ul>
        </nav>
      </div>

      <main className="sysmtec-main">
        <div className="agenda-header">
          <Link to="/agenda/novo" className="add-client-link"><FontAwesomeIcon icon={faPlus} /> CADASTRAR VISITA</Link>
        </div>

        {isLoading ? (
          <div className="loading-container"><div className="spinner"></div><p>Carregando...</p></div>
        ) : (
          <div className="calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              eventClick={handleEventClick}
              locale="pt-br"
              buttonText={{ today: 'Hoje' }}
              eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            />
          </div>
        )}
      </main>

      {popover.visible && (
        <div
          className="calendar-popover"
          style={{ top: popover.y, left: popover.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <Link to={`/agenda/visualizar/${popover.event.id}`} className="popover-icon"><FontAwesomeIcon icon={faEye} /></Link>
          <Link to={`/agenda/editar/${popover.event.id}`} className="popover-icon"><FontAwesomeIcon icon={faPencilAlt} /></Link>
          <button onClick={() => handleDelete(popover.event.id)} className="popover-icon popover-button"><FontAwesomeIcon icon={faTrashAlt} /></button>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!visitaToDelete}
        onClose={() => setVisitaToDelete(null)}
        onConfirm={handleConfirmDelete}
        message="Tem certeza que deseja excluir esta visita?"
      />
    </div>
  );
}

export default ListagemVisitas;
