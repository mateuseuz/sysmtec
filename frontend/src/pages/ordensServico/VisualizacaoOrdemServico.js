import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/Clientes.css';

function VisualizacaoOrdemServico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [ordemServico, setOrdemServico] = useState(null);
  const [orcamentoNome, setOrcamentoNome] = useState('Nenhum');

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const osData = await api.buscarOrdemServico(id);
        setOrdemServico(osData);

        if (osData && osData.id_orcamento) {
          try {
            const orcamentoData = await api.buscarOrcamento(osData.id_orcamento);
            setOrcamentoNome(orcamentoData.nome);
          } catch (error) {
            console.error("Erro ao buscar orçamento vinculado:", error);
            setOrcamentoNome(`ID ${osData.id_orcamento} (não encontrado)`);
          }
        }
      } catch (error) {
        toast.error('Erro ao carregar ordem de serviço: ' + error.message + '.');
        navigate('/ordens-servico');
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarDados();
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
        <Link to="/ordens-servico" className="back-button">⬅️ VOLTAR</Link>

        <div className="cliente-form">
          <div className="form-group">
            <label>Nome do projeto/serviço</label>
            <input
              type="text"
              value={ordemServico?.nome || ''}
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
            <label>Orçamento vinculado</label>
            <input
              type="text"
              value={orcamentoNome}
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

export default VisualizacaoOrdemServico;
