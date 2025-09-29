import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import '../styles/DefinirSenha.css';

function DefinirSenhaPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const response = await api.redefinirSenha(token, senha);
      toast.success(response.message || 'Senha definida com sucesso! Você já pode fazer login.');
      navigate('/login');
    } catch (error) {
      toast.error(`Erro ao definir a senha: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="definir-senha-page">
      <div className="definir-senha-container">
        <h2>Definir Nova Senha</h2>
        <p>Por favor, escolha uma nova senha para sua conta.</p>
        <form onSubmit={handleSubmit} className="definir-senha-form">
          <div className="form-group">
            <input
              type="password"
              placeholder="Digite a nova senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirme a nova senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Nova Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DefinirSenhaPage;
