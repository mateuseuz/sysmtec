import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../services/api';
import '../../styles/Clientes.css';
import '../../styles/Orcamentos.css';

const VisualizacaoOrcamento = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [orcamento, setOrcamento] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const orcamentoData = await api.buscarOrcamento(id);
        setOrcamento(orcamentoData);

        if (orcamentoData.id_cliente) {
          const clienteData = await api.buscarCliente(orcamentoData.id_cliente);
          setCliente(clienteData);
        }
      } catch (error) {
        toast.error('Erro ao carregar dados do orçamento.');
        navigate('/orcamentos');
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarDados();
  }, [id, navigate]);

  const handleExportPDF = () => {
    if (!orcamento) {
      toast.error("Dados do orçamento não carregados.");
      return;
    }

    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.text("Orçamento - SYSMTEC", 14, 22);

    // Informações do Cliente e Orçamento
    doc.setFontSize(12);
    doc.text(`Orçamento: ${orcamento.nome}`, 14, 32);
    if (cliente) {
      doc.text(`Cliente: ${cliente.nome}`, 14, 40);
      doc.text(`CPF/CNPJ: ${cliente.cpf_cnpj}`, 14, 48);
    } else {
      doc.text("Cliente: Não informado", 14, 40);
    }
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 170, 48);

    // Tabela de Itens
    const tableColumn = ["Item", "Quantidade", "Valor Unitário", "Valor Total"];
    const tableRows = [];

    orcamento.itens.forEach(item => {
      const itemData = [
        item.nome,
        item.quantidade,
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor),
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantidade * item.valor)
      ];
      tableRows.push(itemData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
    });

    // Valor Total
    const total = orcamento.itens.reduce((acc, item) => acc + (item.quantidade * item.valor), 0);
    const finalY = doc.lastAutoTable.finalY; // Pega a posição Y após a tabela
    doc.setFontSize(14);
    doc.text(`Valor Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}`, 14, finalY + 15);

    // Observações
    if (orcamento.observacoes) {
      doc.setFontSize(12);
      doc.text("Observações:", 14, finalY + 25);
      const splitObservacoes = doc.splitTextToSize(orcamento.observacoes, 180);
      doc.text(splitObservacoes, 14, finalY + 30);
    }

    // Salvar o PDF
    doc.save(`Orcamento-${orcamento.nome.replace(/\s+/g, '_')}-${id}.pdf`);
  };

  if (isLoading || !orcamento) {
    return (
      <div className="sysmtec-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando orçamento...</p>
        </div>
      </div>
    );
  }

  const valorTotal = orcamento.itens.reduce((acc, item) => acc + (item.quantidade * item.valor), 0);

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
            <li><Link to="/painel-controle"><span>⚙️</span>Painel de Controle</Link></li>
          </ul>
        </nav>
      </div>

      <main className="sysmtec-main">
        <div className="form-actions">
          <Link to="/orcamentos" className="back-button">⬅️ VOLTAR</Link>
          <button onClick={handleExportPDF} className="export-pdf-button">📄 EXPORTAR PARA PDF</button>
        </div>

        <div className="cliente-form">
          <div className="form-group">
            <label>Nome do orçamento</label>
            <input
              type="text"
              value={orcamento.nome}
              readOnly
              disabled
            />
          </div>
          <div className="form-group">
            <label>Cliente</label>
            <input
              type="text"
              value={cliente ? cliente.nome : 'Nenhum cliente vinculado'}
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
            {orcamento.itens.map((item, index) => (
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

export default VisualizacaoOrcamento;
