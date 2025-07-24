import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/Clientes.css';

function EditarOrcamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    descricao: '',
    valor: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const carregarOrcamento = async () => {
      try {
        const orcamento = await api.buscarOrcamento(id);
        setFormData({
          descricao: orcamento.descricao || '',
          valor: orcamento.valor || ''
        });
      } catch (error) {
        toast.error('Erro ao carregar orçamento: ' + error.message);
        navigate('/orcamentos');
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarOrcamento();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.descricao.trim()) {
      toast.warn('Descrição é obrigatória');
      newErrors.descricao = 'Descrição é obrigatória';
      isValid = false;
    }

    if (!formData.valor) {
      toast.warn('Valor é obrigatório');
      newErrors.valor = 'Valor é obrigatório';
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
      await api.atualizarOrcamento(id, formData);
      toast.success('Orçamento atualizado com sucesso!');
      navigate('/orcamentos');
    } catch (error) {
      toast.error(error.message || 'Erro ao atualizar orçamento');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="sysmtec-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando orçamento...</p>
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
            <li><Link to="/ordens-servico"><span>🛠️</span>Ordens de Serviço</Link></li>
            <li className="active"><Link to="/orcamentos"><span>📄</span>Orçamentos</Link></li>
            <li><Link to="/log"><span>📋</span>Log de alterações</Link></li>
          </ul>
        </nav>
      </div>

      <main className="sysmtec-main">
        <Link to="/orcamentos" className="back-button">&lt; VOLTAR</Link>

        <form onSubmit={handleSubmit} className="cliente-form">
          <div className="form-group">
            <label>Descrição *</label>
            <input
              type="text"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className={errors.descricao ? 'error' : ''}
            />
          </div>

          <div className="form-group">
            <label>Valor *</label>
            <input
              type="number"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              className={errors.valor ? 'error' : ''}
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
            ) : 'SALVAR ALTERAÇÕES'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default EditarOrcamento;
