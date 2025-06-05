import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
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

  /* const formatarTelefone = (telefone) => {
    if (!telefone) return '-';
    const nums = telefone.replace(/\D/g, '');
    return nums.length === 11 ? 
      nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') :
      nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }; */

  /* const formatarDocumento = (doc) => {
    if (!doc) return '-';
    const nums = doc.replace(/\D/g, '');
    return nums.length === 11 ? 
      nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') :
      nums.length === 14 ? 
      nums.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') :
      doc;
  }; */

  return (
    <div className="sysmtec-container">
      <header className="sysmtec-header">
        <h1>SYSMTEC</h1>
        <h2>TELA DE LISTAGEM DE CLIENTES</h2>
      </header>

      <div className="sysmtec-sidebar">
        <nav>
          <ul>
            <li><Link to="/agenda">Agenda</Link></li>
            <li className="active"><Link to="/clientes">Clientes</Link></li>
            <li><Link to="/projetos">Ordens de Serviço</Link></li>
            <li><Link to="/orcamentos">Orçamentos</Link></li>
            <li><Link to="/log">Log de alterações</Link></li>
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
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(cliente => (
                  <tr key={cliente.id_cliente}>
                    <td>
                      <div className="cliente-nome-box">
                        {cliente.nome}
                      </div>
                    </td>
                    <td className="actions-cell">
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