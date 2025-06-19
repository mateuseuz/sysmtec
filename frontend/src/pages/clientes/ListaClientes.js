import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatCPForCNPJ, formatCelular } from '../../utils/validations'; // Verifique o caminho correto
import '../../styles/Clientes.css';

function ListaClientes() {
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    setIsLoading(true);
    try {
      const data = await api.listarClientes();
      setClientes(data);
    } catch (error) {
      toast.error('Erro ao carregar clientes: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente e todos os dados associados?')) {
      try {
        await api.deletarCliente(id);
        toast.success('Cliente excluído com sucesso!');
        carregarClientes();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Erro ao excluir cliente');
      }
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
            <li className="active"><Link to="/clientes"><span>👥</span>Clientes</Link></li>
            <li><Link to="/projetos"><span>🛠️</span>Ordens de Serviço</Link></li>
            <li><Link to="/orcamentos"><span>📄</span>Orçamentos</Link></li>
            <li><Link to="/log"><span>📋</span>Log de alterações</Link></li>
          </ul>
        </nav>
      </div>

      <main className="sysmtec-main">
        <div className="clientes-header">
          <Link to="/clientes/novo" className="add-client-link">
            + ADICIONAR NOVO CLIENTE
          </Link>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando clientes...</p>
          </div>
        ) : clientes.length === 0 ? (
          <div className="no-results">
            <p>Nenhum cliente cadastrado ainda</p>
          </div>
        ) : (
          <div className="clientes-table-container">
            <table className="clientes-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF/CNPJ</th>
                  <th>Celular</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(cliente => (
                  <tr key={cliente.id_cliente}>
                    <td>
                      {cliente.nome}
                    </td>
                    <td>{formatCPForCNPJ(cliente.cpf_cnpj) || '-'}</td>
                    <td>{formatCelular(cliente.celular) || '-'}</td>
                    <td className="actions-cell">
                      <Link
                        to={`/clientes/visualizar/${cliente.id_cliente}`} // Defina a rota correta se for diferente
                        className="view-button" // Nova classe para o botão de visualização
                        title="Visualizar cliente"
                      >
                        🔎
                      </Link>
                      <Link 
                        to={`/clientes/editar/${cliente.id_cliente}`} 
                        className="edit-button"
                        title="Editar cliente"
                      >
                        ✏️
                      </Link>
                      <button 
                        onClick={() => handleExcluir(cliente.id_cliente)}
                        className="delete-button"
                        title="Excluir cliente"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default ListaClientes;