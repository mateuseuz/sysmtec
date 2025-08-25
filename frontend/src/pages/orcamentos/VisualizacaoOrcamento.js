import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/Clientes.css';
import '../../styles/Orcamentos.css';

const VisualizacaoOrcamento = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nomeOrcamento, setNomeOrcamento] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState([]);
  const [valorTotal, setValorTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const orcamentoData = await api.buscarOrcamento(id);
        setNomeOrcamento(orcamentoData.nome);
        setObservacoes(orcamentoData.observacoes || '');
        setItens(orcamentoData.itens || []);

        if (orcamentoData.id_cliente) {
          const clienteData = await api.buscarCliente(orcamentoData.id_cliente);
          setClienteNome(clienteData.nome);
        } else {
          setClienteNome('Nenhum cliente vinculado');
        }

        const total = orcamentoData.itens.reduce((acc, item) => acc + (item.quantidade * item.valor), 0);
        setValorTotal(total);

      } catch (error) {
        toast.error('Erro ao carregar dados do orçamento.');
        navigate('/orcamentos');
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
            <li><Link to="/logs"><span>📋</span>Log de alterações</Link></li>
          </ul>
        </nav>
      </div>

      <main className="sysmtec-main">
        <Link to="/orcamentos" className="back-button">⬅️ VOLTAR</Link>

        <div className="cliente-form">
          <div className="form-group">
            <label>Nome do orçamento</label>
            <input
              type="text"
              value={nomeOrcamento}
              readOnly
              disabled
            />
          </div>
          <div className="form-group">
            <label>Cliente</label>
            <input
              type="text"
              value={clienteNome}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <div className="itens-orcamento-grid-container">
              {/* Cabeçalho do Grid */}
              <label className="grid-header">Item</label>
            <label className="grid-header">Qtd.</label>
            <label className="grid-header">Valor (un.)</label>
            <div /> {/* Célula vazia para alinhamento */}

            {/* Linhas de Itens */}
            {itens.map((item, index) => (
              <React.Fragment key={index}>
                <input
                  type="text"
                  name="nome"
                  value={item.nome}
                  readOnly
                  disabled
                />
                <input
                  type="number"
                  name="quantidade"
                  value={item.quantidade}
                  readOnly
                  disabled
                />
                <input
                  type="text"
                  name="valor"
                  value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                  readOnly
                  disabled
                />
                <div /> {/* Célula vazia para alinhamento */}
              </React.Fragment>
            ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Valor total</label>
            <input
              type="text"
              value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              value={observacoes}
              readOnly
              disabled
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default VisualizacaoOrcamento;
