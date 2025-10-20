import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEye, faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
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
  const [permissions, setPermissions] = useState({});

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
    const user = JSON.parse(localStorage.getItem('usuario'));

    const fetchPermissions = async () => {
      if (user && user.perfil === 'admin') {
        setPermissions({ ativo: true });
        return;
      }
      
      try {
        const response = await api.getMinhasPermissoes();
        const visitasPermissions = response.find(p => p.modulo_nome === 'visitas');
        setPermissions(visitasPermissions || { ativo: false });
      } catch (error) {
        if (error.response && error.response.status !== 403 && error.response.status !== 401) {
          toast.error('Erro ao carregar permissões.');
        }
      }
    };

    fetchPermissions();
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
    <div onClick={closePopover}>
      {permissions.ativo && (
        <div className="agenda-header">
          <Link to="/agenda/novo" className="add-client-link"><FontAwesomeIcon icon={faPlus} /> CADASTRAR VISITA</Link>
        </div>
      )}

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

      {popover.visible && permissions.ativo && (
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
