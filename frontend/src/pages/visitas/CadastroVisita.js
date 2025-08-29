import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../styles/Clientes.css';

function CadastroVisita() {
  const navigate = useNavigate();
  const { isFormDirty, setFormDirty } = useOutletContext();
  const [formData, setFormData] = useState({
    titulo: '',
    id_cliente: '',
    data: '',
    hora: '',
    endereco: '',
    observacoes: '',
    selectedClient: null
  });
  const [erros, setErros] = useState({});
  const [initialFormData] = useState({
    titulo: '',
    id_cliente: '',
    data: '',
    hora: '',
    endereco: '',
    observacoes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [clientSearch, setClientSearch] = useState('');
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const isClientDirty = initialFormData.selectedClient?.id_cliente !== selectedClient?.id_cliente;
    const isFormDataDirty = (
      formData.titulo !== initialFormData.titulo ||
      formData.data !== initialFormData.data ||
      formData.hora !== initialFormData.hora ||
      formData.endereco !== initialFormData.endereco ||
      formData.observacoes !== initialFormData.observacoes
    );
    setFormDirty(isClientDirty || isFormDataDirty);
  }, [formData, selectedClient, initialFormData, setFormDirty]);

  const handleBackClick = () => {
    if (isFormDirty) {
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
      await api.criarVisita(visitaParaSalvar);
      setFormDirty(false);
      toast.success('Visita cadastrada com sucesso!');
      navigate('/agenda');
    } catch (error) {
      toast.error('Erro ao agendar visita: ' + error.message + '.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={handleBackClick} className="back-button">
        <FontAwesomeIcon icon={faArrowLeft} /> VOLTAR
      </button>

      <form onSubmit={handleSubmit} className="cliente-form">

        <div className="form-group">
          <label>Nome <span className="required-asterisk">*</span></label>
          <input
            type="text"
            name="titulo"
            placeholder="Ex: Visita técnica para orçamento"
            value={formData.titulo}
            onChange={handleChange}
            className={erros.titulo ? 'error' : ''}
          />
        </div>

        <div className="form-group">
          <label>Vincular visita ao cliente</label>
          <input
            type="text"
            value={clientSearch}
            onChange={handleClientChange}
            placeholder="Digite para buscar..."
            autoComplete="off"
          />
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
            placeholder="Insira o endereço do local da visita"
            value={formData.endereco}
            onChange={handleChange}
            className={erros.endereco ? 'error' : ''}
          />
        </div>

        <div className="form-group">
          <label>Observações</label>
          <textarea
            name="observacoes"
            placeholder="Observações sobre a visita..."
            value={formData.observacoes}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`submit-button ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? 'Salvando...' : 'Salvar visita'}
        </button>
      </form>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          setFormDirty(false);
          setTimeout(() => navigate('/agenda'), 0);
        }}
        message="Você tem certeza que quer descartar as alterações?"
      />
    </>
  );
}

export default CadastroVisita;
