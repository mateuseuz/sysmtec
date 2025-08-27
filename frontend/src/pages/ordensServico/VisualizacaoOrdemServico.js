import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import NavLink from '../../components/NavLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCalendarAlt, faUsers, faWrench, faFileInvoiceDollar, faHistory, faCogs } from '@fortawesome/free-solid-svg-icons';
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
        <button onClick={() => navigate('/ordens-servico')} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> VOLTAR
        </button>

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
