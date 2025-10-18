import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPencilAlt, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import '../../styles/GerenciarUsuarios.css';
import '../../styles/Clientes.css'; // Importando o CSS com o estilo do botão
import '../../styles/Orcamentos.css';
import UserFormModal from '../../components/UserFormModal';
import ConfirmationModal from '../../components/ConfirmationModal';

function GerenciarUsuariosPage() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // State para os modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // State para os dados dos modais
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.listarUsuarios();
      setUsuarios(data);
    } catch (error) {
      toast.error(`Erro ao buscar usuários: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (usuario) => {
    setEditingUser(usuario);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (id) => {
    setDeletingUserId(id);
    setIsConfirmModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsConfirmModalOpen(false);
    setEditingUser(null);
    setDeletingUserId(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingUser) {
        await api.atualizarUsuario(editingUser.id_usuario, formData);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        await api.criarUsuario(formData);
        toast.success('Usuário criado com sucesso! Um e-mail de ativação foi enviado.');
      }
      handleCloseModals();
      fetchUsuarios();
    } catch (error) {
      toast.error(`Erro ao salvar usuário: ${error.message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUserId) return;
    try {
      await api.deletarUsuario(deletingUserId);
      toast.success('Usuário deletado com sucesso!');
      handleCloseModals();
      fetchUsuarios();
    } catch (error) {
      toast.error(`Erro ao deletar usuário: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <div className="gerenciar-usuarios-container">
        <button onClick={() => navigate(-1)} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> VOLTAR
        </button>
        <div className="header-container">
          <h2>Gerenciar Usuários</h2>
          <button onClick={handleOpenCreateModal} className="btn-primary">
            <FontAwesomeIcon icon={faPlus} /> NOVO USUÁRIO
          </button>
        </div>

        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Nome Completo</th>
              <th>Email</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length > 0 ? (
              usuarios.map((usuario) => (
                <tr key={usuario.id_usuario}>
                  <td>{usuario.nome_completo}</td>
                  <td>{usuario.email}</td>
                  <td className="action-buttons">
                    <button onClick={() => handleOpenEditModal(usuario)} className="btn-edit" title="Editar usuário">
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </button>
                    <button onClick={() => handleOpenDeleteModal(usuario.id_usuario)} className="btn-delete" title="Excluir usuário">
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">Nenhum usuário encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleFormSubmit}
        initialData={editingUser}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza de que deseja excluir este usuário? Esta ação não pode ser desfeita."
      />
    </>
  );
}

export default GerenciarUsuariosPage;
