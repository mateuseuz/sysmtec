import React, { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

function AuthPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [nome_completo, setNomeCompleto] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isActivation = location.pathname.includes('/ativar-conta');
  const isReset = location.pathname.includes('/redefinir-senha');
  const isForgotPassword = location.pathname.includes('/esqueci-senha');

  let pageTitle;
  if (isActivation) {
    pageTitle = 'Ative sua conta';
  } else if (isReset) {
    pageTitle = 'Redefina sua senha';
  } else {
    pageTitle = 'Esqueceu sua senha?';
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (senha.length < 6) {
      toast.error('A senha deve ter, no mínimo, 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      let response;
      if (isActivation) {
        response = await api.ativarConta(token, { nome_completo, senha });
      } else {
        response = await api.redefinirSenha(token, { senha });
      }
      toast.success(response.message || 'Operação realizada com sucesso!');
      navigate('/login');
    } catch (error) {
      toast.error(`Erro ao processar a solicitação: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.esqueciSenha(email);
      toast.success(response.message || 'Pedido de redefinição de senha enviado com sucesso.');
      setSubmitted(true);
    } catch (error) {
      toast.error(`Erro ao enviar o pedido: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderForgotPasswordForm = () => (
    <>
      {submitted ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '0rem', fontSize: '1.1rem' }}>
            E-mail de redefinição de senha enviado! 
          </p>
          <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
            Verifique sua caixa de entrada (e a pasta de spam).
          </p>
          <Link to="/login" className="btn-primary" style={{ minWidth: '100px' }}>
            Voltar para o Login
          </Link>
        </div>
      ) : (
        <>
          <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Insira seu e-mail abaixo e enviaremos um link para você redefinir sua senha.
          </p>
          <form onSubmit={handleForgotSubmit} className="cliente-form" style={{ maxWidth: '100%' }}>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
              <Link to="/login" className="btn-secondary">
                Voltar
              </Link>
              <button type="submit" className="btn-primary" disabled={loading} style={{ minWidth: '100px' }}>
                {loading ? 'Enviando...' : 'Enviar Link'}
              </button>
            </div>
          </form>
        </>
      )}
    </>
  );

  const renderPasswordForm = () => (
    <form onSubmit={handlePasswordSubmit} className="cliente-form" style={{ maxWidth: '100%' }}>
      {isActivation && (
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
      )}
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
  );

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
          {isForgotPassword ? renderForgotPasswordForm() : renderPasswordForm()}
        </div>
      </main>
    </div>
  );
}

export default AuthPage;