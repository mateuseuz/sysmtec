import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import '../styles/GerenciarUsuarios.css';
import '../styles/Clientes.css';
import '../styles/Orcamentos.css';

function DefinirSenhaPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [nome_completo, setNomeCompleto] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const isActivation = location.pathname.includes('/ativar-conta');
  const pageTitle = isActivation ? 'Ative sua Conta' : 'Redefina sua Senha';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome_completo.trim() || nome_completo.trim().length < 3) {
      toast.error('Por favor, insira um nome completo válido (mínimo 3 caracteres).');
      return;
    }
    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.redefinirSenha(token, { senha, nome_completo });
      toast.success(response.message || 'Operação realizada com sucesso! Você já pode fazer login.');
      navigate('/login');
    } catch (error) {
      toast.error(`Erro ao processar a solicitação: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sysmtec-container-public">
      <header className="sysmtec-header">
        <h1>SYSMTEC</h1>
      </header>
      <main className="sysmtec-main-public">
        <div className="gerenciar-usuarios-container" style={{ maxWidth: '600px', margin: 'auto' }}>
          <div className="header-container" style={{ marginBottom: '2rem', textAlign: 'center', justifyContent: 'center' }}>
            <h2>{pageTitle}</h2>
          </div>

          <form onSubmit={handleSubmit} className="cliente-form" style={{ maxWidth: '100%' }}>
            <div className="form-group">
              <label htmlFor="nome_completo">Nome completo</label>
              <input
                id="nome_completo"
                type="text"
                placeholder="Digite seu nome completo"
                value={nome_completo}
                onChange={(e) => setNomeCompleto(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="senha">Nova senha</label>
              <input
                id="senha"
                type="password"
                placeholder="Digite a nova senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmarSenha">Confirme a nova senha</label>
              <input
                id="confirmarSenha"
                type="password"
                placeholder="Repita a senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ textAlign: 'center' }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ minWidth: '50px' }}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default DefinirSenhaPage;
