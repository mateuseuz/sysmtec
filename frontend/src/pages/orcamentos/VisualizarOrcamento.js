import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/Clientes.css';

function VisualizarOrcamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [orcamento, setOrcamento] = useState(null);

  useEffect(() => {
    const carregarOrcamento = async () => {
      try {
        const data = await api.buscarOrcamento(id);
        setOrcamento(data);
      } catch (error) {
        toast.error('Erro ao carregar orçamento: ' + error.message);
        navigate('/orcamentos');
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarOrcamento();
  }, [id, navigate]);

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

        <div className="cliente-form">
          <div className="form-group">
            <label>Descrição</label>
            <input
              type="text"
              value={orcamento?.descricao || ''}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label>Valor</label>
            <input
              type="text"
              value={orcamento?.valor || ''}
              readOnly
              disabled
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default VisualizarOrcamento;
