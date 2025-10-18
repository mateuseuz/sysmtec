import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../../styles/Permissoes.css';
import '../../styles/Clientes.css'; // Importando o CSS com o estilo do botão

function PermissoesPage() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissoes, setPermissoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPermissoes, setLoadingPermissoes] = useState(false);

  // Busca a lista de usuários ao montar o componente
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const data = await api.listarUsuarios();
        setUsuarios(data);
      } catch (error) {
        toast.error(`Erro ao carregar usuários: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  // Busca as permissões do usuário selecionado
  const handleUserSelect = async (id_usuario) => {
    if (!id_usuario) {
      setSelectedUser(null);
      setPermissoes([]);
      return;
    }
    setLoadingPermissoes(true);
    try {
      const user = usuarios.find(u => u.id_usuario === id_usuario);
      setSelectedUser(user);
      const data = await api.getPermissoesPorUsuario(id_usuario);
      setPermissoes(data);
    } catch (error) {
      toast.error(`Erro ao carregar permissões do usuário: ${error.message}`);
    } finally {
      setLoadingPermissoes(false);
    }
  };

  // Atualiza a permissão quando um checkbox é clicado
  const handleCheckboxChange = async (modulo_nome, permissao, checked) => {
    if (!selectedUser) return;

    const originalPermissoes = [...permissoes];
    
    const updatedPermissoes = permissoes.map(p => {
      if (p.modulo_nome === modulo_nome) {
        return { ...p, [permissao]: checked };
      }
      return p;
    });
    setPermissoes(updatedPermissoes);

    try {
      const permissaoParaAtualizar = updatedPermissoes.find(p => p.modulo_nome === modulo_nome);
      await api.updatePermissaoUsuario(selectedUser.id_usuario, modulo_nome, {
        pode_ler: permissaoParaAtualizar.pode_ler,
        pode_escrever: permissaoParaAtualizar.pode_escrever,
        pode_deletar: permissaoParaAtualizar.pode_deletar,
      });
      toast.success('Permissão atualizada com sucesso!');
    } catch (error) {
      toast.error(`Erro ao salvar: ${error.message}`);
      setPermissoes(originalPermissoes);
    }
  };

  if (loading) {
    return <p>Carregando usuários...</p>;
  }

  return (
    <div className="permissoes-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <FontAwesomeIcon icon={faArrowLeft} /> VOLTAR
      </button>

      <div className="header-container">
        <h2>Gerenciar Permissões</h2>
        <select 
          onChange={(e) => handleUserSelect(parseInt(e.target.value, 10))}
          defaultValue=""
          className="user-permission-select"
        >
          <option value="" disabled>Selecione um usuário para configurar suas permissões de acesso</option>
          {usuarios.map(u => (
            <option key={u.id_usuario} value={u.id_usuario}>
              {u.nome_completo} ({u.email})
            </option>
          ))}
        </select>
      </div>

      {loadingPermissoes ? (
        <p>Carregando permissões do usuário...</p>
      ) : selectedUser && (
        <>
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Módulo</th>
                <th className="permission-group">Ler</th>
                <th className="permission-group">Escrever</th>
                <th className="permission-group">Deletar</th>
              </tr>
            </thead>
            <tbody>
              {permissoes.map(({ modulo_nome, pode_ler, pode_escrever, pode_deletar }) => (
                <tr key={`${selectedUser.id_usuario}-${modulo_nome}`}>
                  <td className="modulo-cell">{modulo_nome}</td>
                  <td className="permission-group">
                    <input 
                      type="checkbox"
                      checked={pode_ler}
                      onChange={(e) => handleCheckboxChange(modulo_nome, 'pode_ler', e.target.checked)}
                      disabled={selectedUser.perfil === 'admin'}
                    />
                  </td>
                  <td className="permission-group">
                    <input 
                      type="checkbox"
                      checked={pode_escrever}
                      onChange={(e) => handleCheckboxChange(modulo_nome, 'pode_escrever', e.target.checked)}
                      disabled={selectedUser.perfil === 'admin'}
                    />
                  </td>
                  <td className="permission-group">
                    <input 
                      type="checkbox"
                      checked={pode_deletar}
                      onChange={(e) => handleCheckboxChange(modulo_nome, 'pode_deletar', e.target.checked)}
                      disabled={selectedUser.perfil === 'admin'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedUser.perfil === 'admin' && (
            <p className="admin-notice">
              O perfil "admin" tem acesso total a todos os módulos. As permissões não podem ser editadas.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default PermissoesPage;