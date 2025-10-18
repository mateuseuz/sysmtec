import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../services/api';
import { formatCPForCNPJ } from '../../utils/validations';
import logo from '../../assets/images/logo.png';
import MontserratRegular from '../../assets/fonts/Montserrat-Regular.ttf';
import MontserratBold from '../../assets/fonts/Montserrat-Bold.ttf';
import MontserratLight from '../../assets/fonts/Montserrat-Light.ttf';
import '../../styles/Clientes.css';
import '../../styles/Orcamentos.css';

// Helper function to safely convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};


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

  const handleExportPDF = async () => {
    if (!orcamento) {
      toast.error("Dados do orçamento não carregados.");
      return;
    }

    const doc = new jsPDF();

    try {
      // Carregar e registrar fontes
      const fontRegular = await fetch(MontserratRegular).then(res => res.arrayBuffer());
      const fontBold = await fetch(MontserratBold).then(res => res.arrayBuffer());
      const fontLight = await fetch(MontserratLight).then(res => res.arrayBuffer());

      doc.addFileToVFS('Montserrat-Regular.ttf', arrayBufferToBase64(fontRegular));
      doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'normal');
      
      doc.addFileToVFS('Montserrat-Bold.ttf', arrayBufferToBase64(fontBold));
      doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'bold');

      doc.addFileToVFS('Montserrat-Light.ttf', arrayBufferToBase64(fontLight));
      doc.addFont('Montserrat-Light.ttf', 'Montserrat', 'light');

      // Header com Logo e Título
      doc.addImage(logo, 'PNG', 14, 12, 50, 15); 
      doc.setFont('Montserrat', 'light');
      doc.setFontSize(22);
      doc.text("SYSMTEC", 200, 22, { align: 'right' });

      doc.setLineWidth(0.5);
      doc.line(14, 30, 200, 30);

      // Informações do Cliente e Orçamento
      doc.setFontSize(12);
      doc.setFont('Montserrat', 'bold');
      doc.text("INFORMAÇÕES GERAIS", 14, 40);
      
      doc.setFont('Montserrat', 'normal');
    doc.text(`Nome do Projeto: ${orcamento.nome}`, 14, 48);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 56);

      if (cliente) {
        doc.setFont('Montserrat', 'bold');
        doc.text("DADOS DO CLIENTE", 110, 40);
        doc.setFont('Montserrat', 'normal');
        doc.text(`Nome: ${cliente.nome}`, 110, 48);
        doc.text(`CPF/CNPJ: ${formatCPForCNPJ(cliente.cpf_cnpj)}`, 110, 56);
      }
      
      doc.line(14, 72, 200, 72);

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
        startY: 80,
        theme: 'striped',
        headStyles: {
          fillColor: [3, 47, 126],
          textColor: [255, 255, 255],
          font: 'Montserrat',
          fontStyle: 'bold'
        },
        styles: {
          font: 'Montserrat',
          fontStyle: 'normal'
        }
      });

      // Valor Total
      const total = orcamento.itens.reduce((acc, item) => acc + (item.quantidade * item.valor), 0);
      const finalY = doc.lastAutoTable.finalY;
      doc.setFontSize(14);
      doc.setFont('Montserrat', 'bold');
      doc.text(`Valor Total:`, 14, finalY + 15);
      doc.setFont('Montserrat', 'normal');
      doc.text(`${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}`, 200, finalY + 15, { align: 'right' });

      // Observações
      if (orcamento.observacoes) {
        doc.setFontSize(12);
        doc.setFont('Montserrat', 'bold');
        doc.text("Observações:", 14, finalY + 25);
        doc.setFont('Montserrat', 'normal');
        const splitObservacoes = doc.splitTextToSize(orcamento.observacoes, 180);
        doc.text(splitObservacoes, 14, finalY + 32);
      }

      // Salvar o PDF
      doc.save(`Orcamento-${orcamento.nome.replace(/\s+/g, '_')}-${id}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Não foi possível gerar o PDF. Verifique o console para mais detalhes.");
    }
  };

  if (isLoading || !orcamento) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando orçamento...</p>
      </div>
    );
  }

  const valorTotal = orcamento.itens.reduce((acc, item) => acc + (item.quantidade * item.valor), 0);

  return (
    <>
      <div className="form-actions">
        <button onClick={() => navigate('/orcamentos')} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> VOLTAR
        </button>
          <button onClick={handleExportPDF} className="btn-primary">
          <FontAwesomeIcon icon={faFilePdf} /> EXPORTAR PARA PDF
        </button>
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
    </>
  );
};

export default VisualizacaoOrcamento;
