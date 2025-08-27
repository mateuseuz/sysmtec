import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import NavLink from '../../components/NavLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCalendarAlt, faUsers, faWrench, faFileInvoiceDollar, faHistory, faCogs } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../styles/Clientes.css';

function EdicaoVisita() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    id_cliente: '',
    data: '',
    hora: '',
    endereco: '',
    observacoes: '',
  });
  const [initialFormData, setInitialFormData] = useState(null);
  const [erros, setErros] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  const [clientSearch, setClientSearch] = useState('');
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const carregarVisita = async () => {
      try {
        const visitaData = await api.buscarVisita(id);
        const { data_agendamento } = visitaData;
        const date = new Date(data_agendamento);
        
        const initialData = {
          titulo: visitaData.titulo || '',
          id_cliente: visitaData.id_cliente || '',
          data: date.toISOString().slice(0, 10),
          hora: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          endereco: visitaData.endereco || '',
          observacoes: visitaData.observacoes || '',
        };
        setFormData(initialData);
        setInitialFormData(initialData);

        if (visitaData.id_cliente) {
          setClientSearch(visitaData.nome_cliente);
          setSelectedClient({ id_cliente: visitaData.id_cliente, nome: visitaData.nome_cliente });
        }

      } catch (error) {
        toast.error('Erro ao carregar dados da visita.');
        navigate('/agenda');
      } finally {
        setIsLoading(false);
      }
    };
    carregarVisita();
  }, [id, navigate]);

  useEffect(() => {
    if (initialFormData) {
      setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialFormData));
    }
  }, [formData, initialFormData]);

  const handleBackClick = () => {
    if (isDirty) {
      setIsModalOpen(true);
    } else {
      navigate('/agenda');
    }
  };

  useEffect(() => {
    if (clientSearch.length > 1 && !selectedClient) {
      const fetchClients = async () => {
        try {
          const data = await api.buscarClientesPorNome(clientSearch);
          setClientSuggestions(data);
        } catch (error) {
          toast.error('Erro ao buscar clientes: ' + error.message + '.');
        }
      };
      fetchClients();
    } else {
      setClientSuggestions([]);
    }
  }, [clientSearch, selectedClient]);

  const handleClientChange = (e) => {
    setClientSearch(e.target.value);
    setSelectedClient(null);
    setFormData(prev => ({ ...prev, id_cliente: '' }));
  };

  const handleClientSuggestionClick = (client) => {
    setClientSearch(client.nome);
    setSelectedClient(client);
    setFormData(prev => ({ ...prev, id_cliente: client.id_cliente }));
    setClientSuggestions([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const novosErros = {};
    if (!formData.titulo) {
      novosErros.titulo = 'Nome da visita é obrigatório.';
      toast.warn('Nome da visita é obrigatório.');
    }
    if (!formData.data) {
      novosErros.data = 'A data da visita é obrigatória.';
      toast.warn('A data da visita é obrigatória.');
    }
    if (!formData.hora) {
      novosErros.hora = 'A hora da visita é obrigatória.';
      toast.warn('A hora da visita é obrigatória.');
    }
    if (!formData.endereco) {
      novosErros.endereco = 'Endereço é obrigatório.';
      toast.warn('Endereço é obrigatório.');
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setErros({});
    setIsLoading(true);
    const data_agendamento = `${formData.data}T${formData.hora}:00`;

    const visitaParaSalvar = {
      titulo: formData.titulo,
      data_agendamento,
      endereco: formData.endereco,
      id_cliente: formData.id_cliente || null,
      observacoes: formData.observacoes,
    };

    try {
      await api.atualizarVisita(id, visitaParaSalvar);
      toast.success('Visita atualizada com sucesso!');
      navigate('/agenda');
    } catch (error) {
      toast.error('Erro ao atualizar visita: ' + error.message + '.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="sysmtec-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando visita...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sysmtec-container">
      <header className="sysmtec-header">
        <h1>SYSMTEC</h1>
      </header>
      
      <div className="sysmtec-sidebar">
        <nav>
          <ul>
            <NavLink to="/agenda" icon={faCalendarAlt} isDirty={isDirty}>Agenda</NavLink>
            <NavLink to="/clientes" icon={faUsers} isDirty={isDirty}>Clientes</NavLink>
            <NavLink to="/ordens-servico" icon={faWrench} isDirty={isDirty}>Ordens de Serviço</NavLink>
            <NavLink to="/orcamentos" icon={faFileInvoiceDollar} isDirty={isDirty}>Orçamentos</NavLink>
            <NavLink to="/logs" icon={faHistory} isDirty={isDirty}>Log de alterações</NavLink>
            <NavLink to="/painel-controle" icon={faCogs} isDirty={isDirty}>Painel de Controle</NavLink>
          </ul>
        </nav>
      </div>

      <main className="sysmtec-main">
        <button type="button" onClick={handleBackClick} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> VOLTAR
        </button>

        <form onSubmit={handleSubmit} className="cliente-form">

          <div className="form-group">
            <label>Nome <span className="required-asterisk">*</span></label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className={erros.titulo ? 'error' : ''}
            />
          </div>

          <div className="form-group">
            <label>Vincular visita ao cliente</label>
            <input type="text" value={clientSearch} onChange={handleClientChange} placeholder="Digite para buscar um cliente" autoComplete="off" />
            {clientSuggestions.length > 0 && (
              <ul className="suggestions-list">
                {clientSuggestions.map(client => (
                  <li key={client.id_cliente} onMouseDown={() => handleClientSuggestionClick(client)}>
                    {client.nome}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Data <span className="required-asterisk">*</span></label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleChange}
                className={erros.data ? 'error' : ''}
              />
            </div>
            <div className="form-group">
              <label>Hora <span className="required-asterisk">*</span></label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                className={erros.hora ? 'error' : ''}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Endereço <span className="required-asterisk">*</span></label>
            <input
              type="text"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              className={erros.endereco ? 'error' : ''}
            />
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`submit-button ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? 'Salvando...' : 'Salvar visita'}
          </button>
        </form>
      </main>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => navigate('/agenda')}
        message="Você tem certeza que quer descartar as alterações?"
      />
    </div>
  );
}

export default EdicaoVisita;
