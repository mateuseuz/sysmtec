import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../../styles/Permissoes.css';

function PermissoesPage() {
  const [permissoes, setPermissoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissoes = async () => {
      try {
        const data = await api.listarPermissoes();
        setPermissoes(data);
      } catch (error) {
        toast.error(`Erro ao carregar permissões: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchPermissoes();
  }, []);

  const handleCheckboxChange = async (perfil, modulo, permissao, checked) => {
    const originalPermissoes = [...permissoes];
    
    // Atualiza o estado local primeiro para uma UI mais responsiva
    const updatedPermissoes = permissoes.map(p => {
      if (p.perfil_nome === perfil && p.modulo_nome === modulo) {
        return { ...p, [permissao]: checked };
      }
      return p;
    });
    setPermissoes(updatedPermissoes);

    // Encontra a permissão específica para enviar para a API
    const permissaoParaAtualizar = updatedPermissoes.find(
      p => p.perfil_nome === perfil && p.modulo_nome === modulo
    );

    try {
      await api.atualizarPermissao(perfil, modulo, {
        pode_ler: permissaoParaAtualizar.pode_ler,
        pode_escrever: permissaoParaAtualizar.pode_escrever,
        pode_deletar: permissaoParaAtualizar.pode_deletar,
      });
      toast.success('Permissão atualizada com sucesso!');
    } catch (error) {
      toast.error(`Erro ao salvar: ${error.message}`);
      // Reverte o estado em caso de erro
      setPermissoes(originalPermissoes);
    }
  };
  
  // Agrupa as permissões por perfil para facilitar a renderização
  const permissoesAgrupadas = useMemo(() => {
    return permissoes.reduce((acc, p) => {
      acc[p.perfil_nome] = acc[p.perfil_nome] || [];
      acc[p.perfil_nome].push(p);
      return acc;
    }, {});
  }, [permissoes]);

  if (loading) {
    return <p>Carregando permissões...</p>;
  }

  return (
    <div className="permissoes-container">
      <h2>Gerenciamento de Permissões</h2>
      <p>Marque ou desmarque as caixas para conceder ou revogar o acesso dos perfis aos módulos do sistema.</p>
      
      <div className="permissoes-table-container">
        <table className="permissoes-table">
          <thead>
            <tr>
              <th>Módulo</th>
              <th className="permission-group">Ler</th>
              <th className="permission-group">Escrever</th>
              <th className="permission-group">Deletar</th>
            </tr>
          </thead>
          {Object.entries(permissoesAgrupadas).map(([perfil, modulos]) => (
            <tbody key={perfil}>
              <tr>
                <th colSpan="4" className="perfil-header">{perfil}</th>
              </tr>
              {modulos.map(({ modulo_nome, pode_ler, pode_escrever, pode_deletar }) => (
                <tr key={`${perfil}-${modulo_nome}`}>
                  <td className="modulo-cell">{modulo_nome}</td>
                  <td className="permission-group">
                    <input 
                      type="checkbox"
                      checked={pode_ler}
                      onChange={(e) => handleCheckboxChange(perfil, modulo_nome, 'pode_ler', e.target.checked)}
                    />
                  </td>
                  <td className="permission-group">
                    <input 
                      type="checkbox"
                      checked={pode_escrever}
                      onChange={(e) => handleCheckboxChange(perfil, modulo_nome, 'pode_escrever', e.target.checked)}
                    />
                  </td>
                  <td className="permission-group">
                    <input 
                      type="checkbox"
                      checked={pode_deletar}
                      onChange={(e) => handleCheckboxChange(perfil, modulo_nome, 'pode_deletar', e.target.checked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}

export default PermissoesPage;