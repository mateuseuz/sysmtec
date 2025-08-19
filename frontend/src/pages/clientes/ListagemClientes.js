import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatCPForCNPJ, formatCelular } from '../../utils/validations';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../styles/Clientes.css';

function ListagemClientes() {
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);

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
    try {
      const [orcamentos, ordensServico, visitas] = await Promise.all([
        api.listarOrcamentos(),
        api.listarOrdensServico(),
        api.listarVisitas()
      ]);

      const isClienteEmUso = 
        orcamentos.some(o => o.id_cliente === id) ||
        ordensServico.some(os => os.id_cliente === id) ||
        visitas.some(v => v.id_cliente === id);

      if (isClienteEmUso) {
        toast.error('Não foi possível excluir o cliente porque ele está vinculado a um orçamento, ordem de serviço ou visita.');
        return;
      }

      setSelectedClientId(id);
      setIsModalOpen(true);
    } catch (error) {
      toast.error('Erro ao verificar associações do cliente: ' + error.message);
    }
  };

  const confirmExcluir = async () => {
    try {
      await api.deletarCliente(selectedClientId);
      toast.success('Cliente excluído com sucesso!');
      carregarClientes();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao excluir cliente');
    } finally {
      setIsModalOpen(false);
      setSelectedClientId(null);
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
            <li><Link to="/ordens-servico"><span>🛠️</span>Ordens de Serviço</Link></li>
            <li><Link to="/orcamentos"><span>📄</span>Orçamentos</Link></li>
            <li><Link to="/log"><span>📋</span>Log de alterações</Link></li>
          </ul>
        </nav>
      </div>

      <main className="sysmtec-main">
        <div className="clientes-header">
          <Link to="/clientes/novo" className="add-client-link">
            ➕ CADASTRAR CLIENTE
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
                  <th>Nome do cliente</th>
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
                        to={`/clientes/visualizar/${cliente.id_cliente}`}
                        className="view-button"
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
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmExcluir}
        message="Tem certeza que deseja excluir este cliente e todos os dados associados?"
      />
    </div>
  );
}

export default ListagemClientes;