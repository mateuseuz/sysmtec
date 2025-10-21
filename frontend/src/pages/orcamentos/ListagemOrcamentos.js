import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEye, faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import '../../styles/Clientes.css';

function ListagemOrcamentos() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrcamentoId, setSelectedOrcamentoId] = useState(null);
  const [permissions, setPermissions] = useState({});
  const toastShownRef = useRef(false);

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
          const permission = response.find(p => p.modulo_nome === 'orcamentos');
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
        carregarOrcamentos();
      } else {
        // Se a verificação de permissão foi bem-sucedida, mas o usuário não tem permissão
        if (!toastShownRef.current) {
            toast.error('Você não tem permissão para acessar este módulo.');
            toastShownRef.current = true;
        }
        setIsLoading(false);
      }
    };

    checkPermissionsAndLoad();
  }, []);

  const carregarOrcamentos = async () => {
    setIsLoading(true);
    try {
      const data = await api.listarOrcamentos();
      setOrcamentos(data);
    } catch (error) {
      toast.error('Erro ao carregar orçamentos: ' + error.message + '.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcluir = async (id) => {
    try {
      const ordensServico = await api.listarOrdensServico();
      const isOrcamentoEmUso = ordensServico.some(os => os.id_orcamento === id);

      if (isOrcamentoEmUso) {
        toast.error('Não foi possível excluir o orçamento porque ele está vinculado a uma ordem de serviço.');
        return;
      }

      setSelectedOrcamentoId(id);
      setIsModalOpen(true);
    } catch (error) {
      toast.error('Erro ao verificar ordens de serviço: ' + error.message + '.');
    }
  };

  const confirmExcluir = async () => {
    try {
      await api.deletarOrcamento(selectedOrcamentoId);
      toast.success('Orçamento excluído com sucesso!');
      carregarOrcamentos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao excluir orçamento.');
    } finally {
      setIsModalOpen(false);
      setSelectedOrcamentoId(null);
    }
  };

  return (
    <>
      {permissions.ativo && (
        <div className="clientes-header">
          <Link to="/orcamentos/novo" className="add-client-link">
            <FontAwesomeIcon icon={faPlus} /> CADASTRAR ORÇAMENTO
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando orçamentos...</p>
        </div>
      ) : orcamentos.length === 0 ? (
        <div className="no-results">
          <p>Nenhum orçamento cadastrado ainda</p>
        </div>
      ) : (
        <div className="clientes-table-container">
          <table className="clientes-table">
            <thead>
              <tr>
                <th>Nome do orçamento</th>
                <th>Cliente</th>
                <th>Valor total</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {orcamentos.map(orcamento => (
                <tr key={orcamento.id_orcamento}>
                  <td>{orcamento.nome}</td>
                  <td>{orcamento.nome_cliente || 'N/A'}</td>
                  <td>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(orcamento.valor_total)}
                  </td>
                  <td className="actions-cell">
                    {permissions.ativo && (
                      <>
                        <Link
                          to={`/orcamentos/visualizar/${orcamento.id_orcamento}`}
                          className="view-button"
                          title="Visualizar orçamento"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Link>
                        <Link
                          to={`/orcamentos/editar/${orcamento.id_orcamento}`}
                          className="edit-button"
                          title="Editar orçamento"
                        >
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </Link>
                        <button
                          onClick={() => handleExcluir(orcamento.id_orcamento)}
                          className="delete-button"
                          title="Excluir orçamento"
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
        message="Tem certeza que deseja excluir este orçamento?"
      />
    </>
  );
}

export default ListagemOrcamentos;
