import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../styles/Clientes.css';

function CadastroVisita() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    id_cliente: '',
    data: '',
    hora: '',
    endereco: '',
    observacoes: '',
  });
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
  const [isDirty, setIsDirty] = useState(false);
  
  const [clientSearch, setClientSearch] = useState('');
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialFormData));
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
    
    if (!formData.titulo || !formData.data || !formData.hora || !formData.endereco) {
      toast.error('Nome, data, hora e endereço são obrigatórios.');
      return;
    }
    
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
      toast.success('Visita cadastrada com sucesso!');
      navigate('/agenda');
    } catch (error) {
      toast.error('Erro ao agendar visita: ' + error.message + '.');
    } finally {
      setIsLoading(false);
    }
  };

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
            <li><Link to="/logs"><span>📋</span>Log de alterações</Link></li>
            <li><Link to="/painel-controle"><span>⚙️</span>Painel de Controle</Link></li>
          </ul>
        </nav>
      </div>

      <main className="sysmtec-main">
        <button type="button" onClick={handleBackClick} className="back-button">⬅️ VOLTAR</button>

        <form onSubmit={handleSubmit} className="cliente-form">

          <div className="form-group">
            <label>Nome <span className="required-asterisk">*</span></label>
            <input
              type="text"
              name="titulo"
              placeholder="Ex: Visita técnica para orçamento"
              value={formData.titulo}
              onChange={handleChange}
              required
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
                required
              />
            </div>
            <div className="form-group">
              <label>Hora <span className="required-asterisk">*</span></label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                required
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
              required
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

export default CadastroVisita;
