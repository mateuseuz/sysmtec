import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEye, faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import '../../styles/Clientes.css';

function ListagemOrdensServico() {
  const [ordensServico, setOrdensServico] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrdemServicoId, setSelectedOrdemServicoId] = useState(null);
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('usuario'));

    const fetchPermissions = async () => {
      if (user && user.perfil === 'admin') {
        setPermissions({ ativo: true });
        return;
      }
      
      try {
        const response = await api.getMinhasPermissoes();
        const ordensPermissions = response.find(p => p.modulo_nome === 'ordensServico');
        setPermissions(ordensPermissions || { ativo: false });
      } catch (error) {
        if (error.response && error.response.status !== 403 && error.response.status !== 401) {
          toast.error('Erro ao carregar permissões.');
        }
      }
    };

    fetchPermissions();
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
    <>
      {permissions.ativo && (
        <div className="clientes-header">
          <Link to="/ordens-servico/novo" className="add-client-link">
            <FontAwesomeIcon icon={faPlus} /> CADASTRAR ORDEM DE SERVIÇO
          </Link>
        </div>
      )}

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
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ordensServico.map(os => (
                <tr key={os.id_ordem_servico}>
                  <td>{os.nome}</td>
                  <td>{os.nome_cliente}</td>
                  <td className="actions-cell">
                    {permissions.ativo && (
                      <>
                        <Link
                          to={`/ordens-servico/visualizar/${os.id_ordem_servico}`}
                          className="view-button"
                          title="Visualizar ordem de serviço"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Link>
                        <Link
                          to={`/ordens-servico/editar/${os.id_ordem_servico}`}
                          className="edit-button"
                          title="Editar ordem de serviço"
                        >
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </Link>
                        <button
                          onClick={() => handleExcluir(os.id_ordem_servico)}
                          className="delete-button"
                          title="Excluir ordem de serviço"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmExcluir}
        message="Tem certeza que deseja excluir esta ordem de serviço?"
      />
    </>
  );
}

export default ListagemOrdensServico;
