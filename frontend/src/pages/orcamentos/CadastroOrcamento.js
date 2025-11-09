import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../styles/Clientes.css';
import '../../styles/Orcamentos.css';

const CadastroOrcamento = () => {
  const navigate = useNavigate();
  const { isFormDirty, setFormDirty } = useOutletContext();
  const [nomeOrcamento, setNomeOrcamento] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState([{ nome: '', quantidade: 1, valor: '' }]);
  const [valorTotal, setValorTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [erros, setErros] = useState({});
  const [isRemoveItemModalOpen, setIsRemoveItemModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);
  // Guarda o "formulário vazio" pra comparar depois e saber se algo foi alterado
  const [initialFormData] = useState({
    nomeOrcamento: '',
    clienteSelecionado: null,
    observacoes: '',
    itens: [{ nome: '', quantidade: 1, valor: '' }],
  });

  // Sempre que o formulário mudar, verifica se ele ficou diferente do inicial
  useEffect(() => {
    const currentFormData = {
      nomeOrcamento,
      clienteSelecionado,
      observacoes,
      itens,
    };
    setFormDirty(JSON.stringify(currentFormData) !== JSON.stringify(initialFormData));
  }, [nomeOrcamento, clienteSelecionado, observacoes, itens, initialFormData, setFormDirty]);

  // Quando o botão VOLTAR for clicado
  const handleBackClick = () => {
    if (isFormDirty) {
      setIsUnsavedChangesModalOpen(true);
    } else {
      navigate('/orcamentos');
    }
  };

  // Quando o usuário digita o nome de um cliente pra buscar
  useEffect(() => {
    if (termoBusca.length > 2 && !clienteSelecionado) {
      api.buscarClientesPorNome(termoBusca).then(response => {
        setSugestoes(response);
      });
    } else {
      setSugestoes([]);
    }
  }, [termoBusca, clienteSelecionado]);

  // Calcula o valor total do orçamento sempre que os itens mudarem
  useEffect(() => {
    const total = itens.reduce((acc, item) => {
      const quantidade = Number(item.quantidade) || 0;
      const valor = Number(item.valor) || 0;
      return acc + (quantidade * valor);
    }, 0);
    setValorTotal(total);
  }, [itens]);

  // Atualiza o conteúdo de um item (nome, quantidade, valor)
  const handleItemChange = (index, event) => {
    const { name, value } = event.target;
    const newItens = [...itens];
    newItens[index][name] = value;
    setItens(newItens);

    // Remove erro visual se o usuário corrigir o campo
    if (erros.itens && erros.itens[index] && erros.itens[index][name]) {
      const newErros = { ...erros };
      delete newErros.itens[index][name];
      if (Object.keys(newErros.itens[index]).length === 0) {
        delete newErros.itens[index];
      }
      if (Object.keys(newErros.itens).length === 0) {
        delete newErros.itens;
      }
      setErros(newErros);
    }
  };

  // Adiciona um novo item na lista
  const handleAddItem = () => {
    setItens([...itens, { nome: '', quantidade: 1, valor: '' }]);
  };

  // Confirmação de remoção
  const handleRemoveItem = (index) => {
    setItemToRemove(index);
    setIsRemoveItemModalOpen(true);
  };

  // Remoção confirmada
  const confirmRemoveItem = () => {
    const values = [...itens];
    values.splice(itemToRemove, 1);
    setItens(values);
    setIsRemoveItemModalOpen(false);
    setItemToRemove(null);
  };

  // Salvar
  const handleSubmit = async (event) => {
    event.preventDefault();

    const novosErros = { itens: {} };
    if (!nomeOrcamento.trim()) {
      novosErros.nomeOrcamento = 'Nome do orçamento é obrigatório.';
      toast.warn('Nome do orçamento é obrigatório.');
    }
    if (termoBusca.trim() && !clienteSelecionado) {
      novosErros.cliente = 'Cliente inexistente. Selecione um cliente da lista ou deixe o campo em branco.';
      toast.warn('Cliente inexistente. Selecione um cliente da lista ou deixe o campo em branco.');
    }

    // Valida cada item
    let hasItemError = false;
    itens.forEach((item, index) => {
      const itemErros = {};
      if (!item.nome.trim()) {
        itemErros.nome = true;
        hasItemError = true;
      }
      if (!String(item.valor).trim()) {
        itemErros.valor = true;
        hasItemError = true;
      }
      if (parseFloat(item.quantidade) < 0) {
        itemErros.quantidade = true;
        hasItemError = true;
      }
      if (parseFloat(item.valor) < 0) {
        itemErros.valor = true;
        hasItemError = true;
      }
      if (Object.keys(itemErros).length > 0) {
        novosErros.itens[index] = itemErros;
      }
    });

    if (hasItemError) {
      toast.warn('Por favor, corrija os itens inválidos.');
    }

    if (Object.keys(novosErros).length > 1 || Object.keys(novosErros.itens).length > 0) {
      setErros(novosErros);
      return;
    }

    setErros({});
    setIsLoading(true);

    const itensNumericos = itens.map(item => ({
      ...item,
      quantidade: parseInt(item.quantidade, 10) || 1, // Garante que a quantidade seja no mínimo 1
      valor: parseFloat(item.valor) || 0
    }));

    const orcamento = {
      nome: nomeOrcamento,
      id_cliente: clienteSelecionado ? clienteSelecionado.id_cliente : null,
      observacoes,
      itens: itensNumericos
    };
    try {
      console.log('Enviando orçamento:', orcamento);
      await api.criarOrcamento(orcamento);
      setFormDirty(false);
      toast.success('Orçamento cadastrado com sucesso!');
      navigate('/orcamentos');
    } catch (error) {
      toast.error('Erro ao criar orçamento.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={handleBackClick} className="back-button">
        <FontAwesomeIcon icon={faArrowLeft} /> VOLTAR
      </button>

      <form onSubmit={handleSubmit} className="cliente-form" noValidate>
        <div className="form-group">
          <label>Nome <span className="required-asterisk">*</span></label>
          <input
            type="text"
            value={nomeOrcamento}
            onChange={e => setNomeOrcamento(e.target.value)}
            placeholder="Nome do orçamento"
            className={erros.nomeOrcamento ? 'error' : ''}
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
              className={erros.cliente ? 'error' : ''}
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
                className={erros.itens?.[index]?.nome ? 'error' : ''}
              />
              <input
                type="number"
                name="quantidade"
                placeholder="Qtd."
                value={item.quantidade}
                onChange={e => handleItemChange(index, e)}
                min="0"
                className={erros.itens?.[index]?.quantidade ? 'error' : ''}
              />
              <input
                type="number"
                name="valor"
                placeholder="0,00"
                value={item.valor}
                onChange={e => handleItemChange(index, e)}
                min="0"
                className={erros.itens?.[index]?.valor ? 'error' : ''}
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
          disabled={isLoading}
          className={`submit-button ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Salvando...
            </>
          ) : 'Salvar orçamento'}
        </button>
      </form>
      <ConfirmationModal
        isOpen={isRemoveItemModalOpen}
        onClose={() => setIsRemoveItemModalOpen(false)}
        onConfirm={confirmRemoveItem}
        message="Tem certeza que deseja remover este item?"
      />
      <ConfirmationModal
        isOpen={isUnsavedChangesModalOpen}
        onClose={() => setIsUnsavedChangesModalOpen(false)}
        onConfirm={() => {
          setFormDirty(false);
          setTimeout(() => navigate('/orcamentos'), 0);
        }}
        message="Você tem certeza que quer descartar as alterações?"
      />
    </>
  );
};

export default CadastroOrcamento;
