import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/Clientes.css';

function VisualizarOrdemServico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [ordemServico, setOrdemServico] = useState(null);

  useEffect(() => {
    const carregarOrdemServico = async () => {
      try {
        const data = await api.buscarOrdemServico(id);
        setOrdemServico(data);
      } catch (error) {
        toast.error('Erro ao carregar ordem de serviço: ' + error.message);
        navigate('/ordens-servico');
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarOrdemServico();
  }, [id, navigate]);

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
        <Link to="/ordens-servico" className="back-button">&lt; VOLTAR</Link>

        <div className="cliente-form">
          <div className="form-group">
            <label>Nome do projeto/serviço</label>
            <input
              type="text"
              value={ordemServico?.nome_projeto || ''}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label>Orçamento</label>
            <input
              type="text"
              value={ordemServico?.fk_id_orcamento || ''}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label>Orçamento</label>
            <input
              type="text"
              value={ordemServico?.fk_id_orcamento || ''}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label>Cliente relacionado</label>
            <input
              type="text"
              value={ordemServico?.nome_cliente || ''}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label>Situação</label>
            <input
              type="text"
              value={ordemServico?.situacao || ''}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              value={ordemServico?.observacoes || ''}
              readOnly
              disabled
              maxLength="500"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default VisualizarOrdemServico;
