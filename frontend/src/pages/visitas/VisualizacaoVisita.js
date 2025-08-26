import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/Clientes.css';

function VisualizacaoVisita() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [visita, setVisita] = useState(null);
  
  useEffect(() => {
    const carregarVisita = async () => {
      try {
        const data = await api.buscarVisita(id);
        setVisita(data);
      } catch (error) {
        toast.error('Erro ao carregar dados da visita.');
        navigate('/agenda');
      } finally {
        setIsLoading(false);
      }
    };
    carregarVisita();
  }, [id, navigate]);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return { data: '', hora: '' };
    const date = new Date(dateTimeString);
    const data = date.toLocaleDateString('pt-BR');
    const hora = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { data, hora };
  };
  
  const { data, hora } = formatDateTime(visita?.data_agendamento);

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
        <Link to="/agenda" className="back-button">⬅️ VOLTAR</Link>

        <div className="cliente-form">

          <div className="form-group">
            <label>Nome</label>
            <input type="text" value={visita?.titulo || ''} readOnly disabled />
          </div>

          <div className="form-group">
            <label>Cliente vinculado</label>
            <input type="text" value={visita?.nome_cliente || 'Nenhum'} readOnly disabled />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Data</label>
              <input type="text" value={data} readOnly disabled />
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input type="text" value={hora} readOnly disabled />
            </div>
          </div>

          <div className="form-group">
            <label>Endereço</label>
            <input type="text" value={visita?.endereco || ''} readOnly disabled />
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea value={visita?.observacoes || ''} readOnly disabled />
          </div>
        </div>
      </main>
    </div>
  );
}

export default VisualizacaoVisita;
