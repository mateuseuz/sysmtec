import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { faPlus, faEye, faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import api from '../../services/api';
import { formatCPForCNPJ, formatCelular } from '../../utils/validations';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../styles/Clientes.css';

function ListagemClientes() {
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('usuario'));

    const checkPermissionsAndLoad = async () => {
      let userPermissions = { ativo: false };
      let hasPermission = false;

      if (user && user.perfil === 'admin') {
        userPermissions = { ativo: true };
        hasPermission = true;
      } else {
        try {
          const response = await api.getMinhasPermissoes();
          const permission = response.find(p => p.modulo_nome === 'clientes');
          if (permission && permission.ativo) {
            userPermissions = permission;
            hasPermission = true;
          }
        } catch (error) {
          // O interceptor da API já trata erros de autenticação (401)
          // e exibe um toast genérico para outros erros de rede.
          // Não precisamos exibir outro toast aqui para evitar duplicação.
          setIsLoading(false);
          return; // Interrompe a execução se as permissões não puderem ser carregadas
        }
      }

      setPermissions(userPermissions);

      if (hasPermission) {
        carregarClientes();
      } else {
        // Se a verificação de permissão foi bem-sucedida, mas o usuário não tem permissão
        toast.error('Você não tem permissão para acessar este módulo.');
        setIsLoading(false);
      }
    };

    checkPermissionsAndLoad();
  }, []);

  const carregarClientes = async () => {
    setIsLoading(true);
    try {
      const data = await api.listarClientes();
      setClientes(data);
    } catch (error) {
      toast.error('Erro ao carregar clientes: ' + error.message + '.');
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
      toast.error('Erro ao verificar associações do cliente: ' + error.message + '.');
    }
  };

  const confirmExcluir = async () => {
    try {
      await api.deletarCliente(selectedClientId);
      toast.success('Cliente excluído com sucesso!');
      carregarClientes();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao excluir cliente.');
    } finally {
      setIsModalOpen(false);
      setSelectedClientId(null);
    }
  };

  return (
    <>
      {permissions.ativo && (
        <div className="clientes-header">
          <Link to="/clientes/novo" className="add-client-link">
            <FontAwesomeIcon icon={faPlus} /> CADASTRAR CLIENTE
          </Link>
        </div>
      )}

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
                    {permissions.ativo && (
                      <>
                        <Link
                          to={`/clientes/visualizar/${cliente.id_cliente}`}
                          className="view-button"
                          title="Visualizar cliente"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Link>
                        <Link
                          to={`/clientes/editar/${cliente.id_cliente}`}
                          className="edit-button"
                          title="Editar cliente"
                        >
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </Link>
                        <button
                          onClick={() => handleExcluir(cliente.id_cliente)}
                          className="delete-button"
                          title="Excluir cliente"
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
        message="Tem certeza que deseja excluir este cliente e todos os dados associados?"
      />
    </>
  );
}

export default ListagemClientes;