import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../styles/Clientes.css';

function ListagemOrdensServico() {
  const [ordensServico, setOrdensServico] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrdemServicoId, setSelectedOrdemServicoId] = useState(null);

  useEffect(() => {
    carregarOrdensServico();
  }, []);

  const carregarOrdensServico = async () => {
    setIsLoading(true);
    try {
      const data = await api.listarOrdensServico();
      setOrdensServico(data);
    } catch (error) {
      toast.error('Erro ao carregar ordens de serviço: ' + error.message + '.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcluir = (id) => {
    setSelectedOrdemServicoId(id);
    setIsModalOpen(true);
  };

  const confirmExcluir = async () => {
    try {
      await api.deletarOrdemServico(selectedOrdemServicoId);
      toast.success('Ordem de serviço excluída com sucesso!');
      carregarOrdensServico();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao excluir ordem de serviço.');
    } finally {
      setIsModalOpen(false);
      setSelectedOrdemServicoId(null);
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
            <li className="active"><Link to="/ordens-servico"><span>🛠️</span>Ordens de Serviço</Link></li>
            <li><Link to="/orcamentos"><span>📄</span>Orçamentos</Link></li>
            <li><Link to="/log"><span>📋</span>Log de alterações</Link></li>
          </ul>
        </nav>
      </div>

      <main className="sysmtec-main">
        <div className="clientes-header">
          <Link to="/ordens-servico/novo" className="add-client-link">
            ➕ CADASTRAR ORDEM DE SERVIÇO
          </Link>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando ordens de serviço...</p>
          </div>
        ) : ordensServico.length === 0 ? (
          <div className="no-results">
            <p>Nenhuma ordem de serviço cadastrada ainda</p>
          </div>
        ) : (
          <div className="clientes-table-container">
            <table className="clientes-table">
              <thead>
                <tr>
                  <th>Nome do projeto/serviço</th>
                  <th>Cliente</th>
                  <th>Situação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ordensServico.map(os => (
                  <tr key={os.id_ordem_servico}>
                    <td>{os.nome}</td>
                    <td>{os.nome_cliente}</td>
                    <td>{os.situacao}</td>
                    <td className="actions-cell">
                      <Link
                        to={`/ordens-servico/visualizar/${os.id_ordem_servico}`}
                        className="view-button"
                        title="Visualizar ordem de serviço"
                      >
                        🔎
                      </Link>
                      <Link 
                        to={`/ordens-servico/editar/${os.id_ordem_servico}`} 
                        className="edit-button"
                        title="Editar ordem de serviço"
                      >
                        ✏️
                      </Link>
                      <button 
                        onClick={() => handleExcluir(os.id_ordem_servico)}
                        className="delete-button"
                        title="Excluir ordem de serviço"
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
        message="Tem certeza que deseja excluir esta ordem de serviço?"
      />
    </div>
  );
}

export default ListagemOrdensServico;
