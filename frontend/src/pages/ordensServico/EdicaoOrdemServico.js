import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/Clientes.css';

function EdicaoOrdemServico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    nome: '',
    id_cliente: '',
    situacao: '',
    observacoes: ''
  });
  const [errors, setErrors] = useState({});

  const [clientSearch, setClientSearch] = useState('');
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const [orcamentos, setOrcamentos] = useState([]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [ordemServico, orcamentosData] = await Promise.all([
          api.buscarOrdemServico(id),
          api.listarOrcamentos()
        ]);
        setFormData({
          nome: ordemServico.nome || '',
          id_cliente: ordemServico.id_cliente || '',
          situacao: ordemServico.situacao || '',
          observacoes: ordemServico.observacoes || '',
          id_orcamento: ordemServico.id_orcamento || ''
        });
        setClientSearch(ordemServico.nome_cliente);
        setSelectedClient({ id_cliente: ordemServico.id_cliente, nome: ordemServico.nome_cliente });
        setOrcamentos(orcamentosData);
      } catch (error) {
        toast.error('Erro ao carregar dados: ' + error.message);
        navigate('/ordens-servico');
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarDados();
  }, [id, navigate]);

  useEffect(() => {
    if (clientSearch.length > 1 && !selectedClient) {
      const fetchClients = async () => {
        try {
          const data = await api.buscarClientesPorNome(clientSearch);
          setClientSuggestions(data);
        } catch (error) {
          toast.error('Erro ao buscar clientes: ' + error.message);
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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.nome.trim()) {
      toast.warn('Nome do projeto é obrigatório');
      newErrors.nome = 'Nome do projeto é obrigatório';
      isValid = false;
    }

    if (!formData.id_cliente) {
      toast.warn('Cliente é obrigatório');
      newErrors.id_cliente = 'Cliente é obrigatório';
      isValid = false;
    }

    if (!formData.id_orcamento) {
      toast.warn('Orçamento é obrigatório');
      newErrors.id_orcamento = 'Orçamento é obrigatório';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await api.atualizarOrdemServico(id, formData);
      toast.success('Ordem de serviço atualizada com sucesso!');
      navigate('/ordens-servico');
    } catch (error) {
      toast.error(error.message || 'Erro ao atualizar ordem de serviço');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="sysmtec-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando ordem de serviço...</p>
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
            <li><Link to="/agenda"><span>🗓️</span>Agenda</Link></li>
            <li><Link to="/clientes"><span>👥</span>Clientes</Link></li>
            <li className="active"><Link to="/ordens-servico"><span>🛠️</span>Ordens de Serviço</Link></li>
            <li><Link to="/orcamentos"><span>📄</span>Orçamentos</Link></li>
            <li><Link to="/log"><span>📋</span>Log de alterações</Link></li>
          </ul>
        </nav>
      </div>

      <main className="sysmtec-main">
        <Link to="/ordens-servico" className="back-button">⬅️ VOLTAR</Link>

        <form onSubmit={handleSubmit} className="cliente-form">
          <div className="form-group">
            <label>Nome do projeto/serviço *</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={errors.nome ? 'error' : ''}
            />
          </div>

          <div className="form-group">
            <label>Cliente relacionado *</label>
            <input
              type="text"
              name="id_cliente"
              value={clientSearch}
              onChange={handleClientChange}
              className={errors.id_cliente ? 'error' : ''}
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

          <div className="form-group">
            <label>Orçamento *</label>
            <select
              name="id_orcamento"
              value={formData.id_orcamento}
              onChange={handleChange}
              className={errors.id_orcamento ? 'error' : ''}
            >
              <option value="">Selecione um orçamento</option>
              {orcamentos.map(orcamento => (
                <option key={orcamento.id_orcamento} value={orcamento.id_orcamento}>
                  {orcamento.nome} - {orcamento.nome_cliente || 'N/A'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Situação *</label>
            <select
              name="situacao"
              value={formData.situacao}
              onChange={handleChange}
            >
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              maxLength="500"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`submit-button ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Salvando...
              </>
            ) : 'Salvar ordem de serviço'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default EdicaoOrdemServico;
