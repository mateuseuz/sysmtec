import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatCPForCNPJ, formatCelular } from '../../utils/validations';
import '../../styles/Clientes.css';

function VisualizacaoCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    celular: '',
    endereco: '',
    email: '',
    observacoes: ''
  });

  useEffect(() => {
    const carregarCliente = async () => {
      try {
        const cliente = await api.buscarCliente(id);
        setFormData({
          nome: cliente.nome || '',
          cpf_cnpj: formatCPForCNPJ(cliente.cpf_cnpj) || '',
          celular: formatCelular(cliente.celular) || '',
          endereco: cliente.endereco || '',
          email: cliente.email || '',
          observacoes: cliente.observacoes || ''
        });
      } catch (error) {
        toast.error('Erro ao carregar cliente: ' + error.message + '.');
        navigate('/clientes');
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarCliente();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="sysmtec-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando cliente...</p>
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
            <li className="active"><Link to="/clientes"><span>👥</span>Clientes</Link></li>
            <li><Link to="/ordens-servico"><span>🛠️</span>Ordens de Serviço</Link></li>
            <li><Link to="/orcamentos"><span>📄</span>Orçamentos</Link></li>
            <li><Link to="/logs"><span>📋</span>Log de alterações</Link></li>
            <li><Link to="/painel-controle"><span>⚙️</span>Painel de Controle</Link></li>
          </ul>
        </nav>
      </div>

      <main className="sysmtec-main">
        <Link to="/clientes" className="back-button">⬅️ VOLTAR</Link>

        <div className="cliente-form"> {}
          <div className="form-group">
            <label>Nome</label> {}
            <input
              type="text"
              name="nome"
              value={formData.nome}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label>CPF/CNPJ</label> {}
            <input
              type="text"
              name="cpf_cnpj"
              value={formData.cpf_cnpj}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label>Celular</label>
            <input
              type="tel"
              name="celular"
              value={formData.celular}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label>Endereço</label>
            <input
              type="text"
              name="endereco"
              value={formData.endereco}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              readOnly
              disabled
              maxLength="500"
            />
          </div>

          {}
        </div>
      </main>
    </div>
  );
}

export default VisualizacaoCliente;
