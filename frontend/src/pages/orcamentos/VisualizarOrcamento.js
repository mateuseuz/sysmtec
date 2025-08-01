import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/Clientes.css';
import '../../styles/Orcamentos.css';

const VisualizarOrcamento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [orcamento, setOrcamento] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [valorTotal, setValorTotal] = useState(0);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const orcamentoData = await api.buscarOrcamento(id);
        setOrcamento(orcamentoData);

        if (orcamentoData.id_cliente) {
          const clienteData = await api.buscarCliente(orcamentoData.id_cliente);
          setCliente(clienteData);
        }

        // Calcula o valor total
        const total = orcamentoData.itens.reduce((acc, item) => acc + (item.quantidade * item.valor), 0);
        setValorTotal(total);

      } catch (error) {
        toast.error('Erro ao carregar dados do orçamento: ' + error.message);
        navigate('/orcamentos');
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarDados();
  }, [id, navigate]);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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

  if (!orcamento) {
    return <p>Orçamento não encontrado.</p>;
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

        <h2>Visualizar Orçamento</h2>

        <div className="cliente-form">
          <div className="form-group">
            <label>Nome do Orçamento</label>
            <input
              type="text"
              value={orcamento.nome || ''}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label>Cliente</label>
            <input
              type="text"
              value={cliente ? cliente.nome : 'N/A'}
              readOnly
              disabled
            />
          </div>

          <div className="itens-orcamento-container">
            <h3>Itens do Orçamento</h3>
            <table className="itens-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qtd.</th>
                  <th>Valor Un.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orcamento.itens.map((item, index) => (
                  <tr key={index}>
                    <td>{item.nome}</td>
                    <td>{item.quantidade}</td>
                    <td>{formatCurrency(item.valor)}</td>
                    <td>{formatCurrency(item.quantidade * item.valor)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Valor Total:</td>
                  <td style={{ fontWeight: 'bold' }}>{formatCurrency(valorTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              value={orcamento.observacoes || ''}
              readOnly
              disabled
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default VisualizarOrcamento;
