import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/Clientes.css';
import '../../styles/Orcamentos.css';

const CadastroOrcamento = () => {
  const navigate = useNavigate();
  const [nomeOrcamento, setNomeOrcamento] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState([{ nome: '', quantidade: 1, valor: '' }]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (termoBusca.length > 2) {
      api.buscarClientesPorNome(termoBusca).then(response => {
        setSugestoes(response);
      });
    } else {
      setSugestoes([]);
    }
  }, [termoBusca]);

  const handleItemChange = (index, event) => {
    const values = [...itens];
    values[index][event.target.name] = event.target.value;
    setItens(values);
  };

  const handleAddItem = () => {
    setItens([...itens, { nome: '', quantidade: 1, valor: '' }]);
  };

  const handleRemoveItem = index => {
    const values = [...itens];
    values.splice(index, 1);
    setItens(values);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      toast.success('Orçamento criado com sucesso!');
      navigate('/orcamentos');
    } catch (error) {
      toast.error('Erro ao criar orçamento.');
    } finally {
      setIsLoading(false);
    }
  };

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

        <form onSubmit={handleSubmit} className="cliente-form">
          <div className="form-group">
            <label>Nome do Orçamento:</label>
            <input
              type="text"
              value={nomeOrcamento}
              onChange={e => setNomeOrcamento(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Vincular orçamento ao cliente (opcional):</label>
            <div className="autocomplete-container">
              <input
                type="text"
                value={termoBusca}
                onChange={e => setTermoBusca(e.target.value)}
                placeholder="Digite o nome do cliente"
              />
              {sugestoes.length > 0 && (
                <ul className="sugestoes-lista">
                  {sugestoes.map(cliente => (
                    <li
                      key={cliente.id_cliente}
                      onClick={() => {
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

          <div className="itens-orcamento-container">
            <h3>Itens do Orçamento</h3>
            {itens.map((item, index) => (
              <div key={index} className="item-orcamento-row">
                <input
                  type="text"
                  name="nome"
                  placeholder="Insira um produto/serviço"
                  value={item.nome}
                  onChange={e => handleItemChange(index, e)}
                  className="item-descricao"
                />
                <input
                  type="number"
                  name="quantidade"
                  placeholder="Qtd."
                  value={item.quantidade}
                  onChange={e => handleItemChange(index, e)}
                  className="item-quantidade"
                />
                <input
                  type="number"
                  name="valor"
                  placeholder="Valor (un.)"
                  value={item.valor}
                  onChange={e => handleItemChange(index, e)}
                  className="item-valor"
                />
                <button type="button" onClick={() => handleRemoveItem(index)} className="remove-item-btn">Remover</button>
              </div>
            ))}
            <button type="button" onClick={handleAddItem} className="add-item-btn">Adicionar Item</button>
          </div>

          <div className="form-group">
            <label>Observações:</label>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
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
            ) : 'Salvar Orçamento'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default CadastroOrcamento;
