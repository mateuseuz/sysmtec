import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../styles/Clientes.css';
import '../../styles/Orcamentos.css';

const EdicaoOrcamento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [nomeOrcamento, setNomeOrcamento] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState([{ nome: '', quantidade: 1, valor: '' }]);
  const [valorTotal, setValorTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Começa true para carregar dados
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoveItemModalOpen, setIsRemoveItemModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Efeito para carregar os dados do orçamento ao montar o componente
  useEffect(() => {
    const carregarOrcamento = async () => {
      try {
        const orcamento = await api.buscarOrcamento(id);
        const initialData = {
          nomeOrcamento: orcamento.nome,
          observacoes: orcamento.observacoes || '',
          itens: orcamento.itens.length > 0 ? orcamento.itens : [{ nome: '', quantidade: 1, valor: '' }],
        };
        setNomeOrcamento(initialData.nomeOrcamento);
        setObservacoes(initialData.observacoes);
        setItens(initialData.itens);
        setInitialFormData(initialData);

        if (orcamento.id_cliente) {
          const cliente = await api.buscarCliente(orcamento.id_cliente);
          setClienteSelecionado(cliente);
          setTermoBusca(cliente.nome);
        }
      } catch (error) {
        toast.error('Erro ao carregar dados do orçamento.');
        navigate('/orcamentos');
      } finally {
        setIsLoading(false);
      }
    };
    carregarOrcamento();
  }, [id, navigate]);

  useEffect(() => {
    if (initialFormData) {
      const currentFormData = {
        nomeOrcamento,
        observacoes,
        itens,
      };
      setIsDirty(JSON.stringify(currentFormData) !== JSON.stringify(initialFormData));
    }
  }, [nomeOrcamento, observacoes, itens, initialFormData]);

  const handleBackClick = () => {
    if (isDirty) {
      setIsUnsavedChangesModalOpen(true);
    } else {
      navigate('/orcamentos');
    }
  };

  // Efeito para buscar clientes na autocomplete
  useEffect(() => {
    if (termoBusca.length > 2 && !clienteSelecionado) {
      api.buscarClientesPorNome(termoBusca).then(response => {
        setSugestoes(response);
      });
    } else {
      setSugestoes([]);
    }
  }, [termoBusca, clienteSelecionado]);

  useEffect(() => {
    const total = itens.reduce((acc, item) => {
      const quantidade = Number(item.quantidade) || 0;
      const valor = Number(item.valor) || 0;
      return acc + (quantidade * valor);
    }, 0);
    setValorTotal(total);
  }, [itens]);

  const handleItemChange = (index, event) => {
    const values = [...itens];
    values[index][event.target.name] = event.target.value;
    setItens(values);
  };

  const handleAddItem = () => {
    setItens([...itens, { nome: '', quantidade: 1, valor: '' }]);
  };

  const handleRemoveItem = (index) => {
    setItemToRemove(index);
    setIsRemoveItemModalOpen(true);
  };

  const confirmRemoveItem = () => {
    const values = [...itens];
    values.splice(itemToRemove, 1);
    setItens(values);
    setIsRemoveItemModalOpen(false);
    setItemToRemove(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validação
    if (!nomeOrcamento.trim()) {
      toast.error('Nome do orçamento é obrigatório.');
      return;
    }
    if (termoBusca.trim() && !clienteSelecionado) {
      toast.error('Cliente inexistente. Selecione um cliente da lista ou deixe o campo em branco.');
      return;
    }

    const itensInvalidos = itens.some(item => !item.nome.trim() || !String(item.valor).trim());
    if (itens.length === 0 || (itens.length === 1 && !itens[0].nome.trim()) || itensInvalidos) {
      toast.error('É obrigatório preencher o nome e o valor de todos os itens.');
      return;
    }

    const valoresNegativos = itens.some(item => parseFloat(item.quantidade) < 0 || parseFloat(item.valor) < 0);
    if (valoresNegativos) {
      toast.error('Quantidade e valor dos itens não podem ser negativos.');
      return;
    }

    setIsSaving(true);

    const itensNumericos = itens.map(item => ({
      ...item,
      quantidade: parseInt(item.quantidade, 10) || 1,
      valor: parseFloat(item.valor) || 0
    }));

    const orcamento = {
      nome: nomeOrcamento,
      id_cliente: clienteSelecionado ? clienteSelecionado.id_cliente : null,
      observacoes,
      itens: itensNumericos
    };

    try {
      await api.atualizarOrcamento(id, orcamento);
      toast.success('Orçamento atualizado com sucesso!');
      navigate('/orcamentos');
    } catch (error) {
      toast.error('Erro ao atualizar orçamento.');
    } finally {
      setIsSaving(false);
    }
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
        <button type="button" onClick={handleBackClick} className="back-button">⬅️ VOLTAR</button>

        <form onSubmit={handleSubmit} className="cliente-form" noValidate>
          <div className="form-group">
            <label>Nome <span className="required-asterisk">*</span></label>
            <input
              type="text"
              value={nomeOrcamento}
              onChange={e => setNomeOrcamento(e.target.value)}
              placeholder="Nome do orçamento"
            />
          </div>
          <div className="form-group">
            <label>Vincular orçamento ao cliente</label>
            <div className="autocomplete-container">
              <input
                type="text"
                value={termoBusca}
                onChange={e => {
                  setTermoBusca(e.target.value);
                  setClienteSelecionado(null);
                }}
                placeholder="Nome do cliente"
              />
              {sugestoes.length > 0 && (
                <ul className="sugestoes-lista">
                  {sugestoes.map(cliente => (
                    <li
                      key={cliente.id_cliente}
                      onMouseDown={() => { // Usar onMouseDown para evitar problemas de foco
                        setClienteSelecionado(cliente);
                        setTermoBusca(cliente.nome);
                        setSugestoes([]);
                      }}
                    >
                      {cliente.nome}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="itens-orcamento-grid-container">
            {/* Cabeçalho do Grid */}
            <label className="grid-header">Item <span className="required-asterisk">*</span></label>
            <label className="grid-header">Qtd. <span className="required-asterisk">*</span></label>
            <label className="grid-header">Valor (un.) <span className="required-asterisk">*</span></label>
            <div /> {/* Célula vazia para alinhar com o botão de remover */}

            {/* Linhas de Itens */}
            {itens.map((item, index) => (
              <React.Fragment key={index}>
                <input
                  type="text"
                  name="nome"
                  placeholder="Produto/serviço"
                  value={item.nome}
                  onChange={e => handleItemChange(index, e)}
                />
                <input
                  type="number"
                  name="quantidade"
                  placeholder="Qtd."
                  value={item.quantidade}
                  onChange={e => handleItemChange(index, e)}
                  min="0"
                />
                <input
                  type="number"
                  name="valor"
                  placeholder="0,00"
                  value={item.valor}
                  onChange={e => handleItemChange(index, e)}
                  min="0"
                />
                <button type="button" onClick={() => handleRemoveItem(index)} className="remove-item-btn">Remover</button>
              </React.Fragment>
            ))}
          </div>
          <button type="button" onClick={handleAddItem} className="add-item-btn">Adicionar item</button>

          <div className="form-group">
            <label>Valor total</label>
            <input
              type="text"
              value={valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Observações sobre o orçamento"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className={`submit-button ${isSaving ? 'loading' : ''}`}
          >
            {isSaving ? (
              <>
                <span className="spinner"></span>
                Salvando...
              </>
            ) : 'Salvar orçamento'}
          </button>
        </form>
      </main>
      <ConfirmationModal
        isOpen={isRemoveItemModalOpen}
        onClose={() => setIsRemoveItemModalOpen(false)}
        onConfirm={confirmRemoveItem}
        message="Tem certeza que deseja remover este item?"
      />
      <ConfirmationModal
        isOpen={isUnsavedChangesModalOpen}
        onClose={() => setIsUnsavedChangesModalOpen(false)}
        onConfirm={() => navigate('/orcamentos')}
        message="Você tem certeza que quer descartar as alterações?"
      />
    </div>
  );
};

export default EdicaoOrcamento;
