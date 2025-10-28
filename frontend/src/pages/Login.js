import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import '../styles/Login.css';
// Supondo que o logo esteja na pasta de assets ou public
// import logo from '../assets/logo-mtec.png'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !senha) {
      toast.error('Por favor, preencha o e-mail e a senha.');
      return;
    }

    try {
      const response = await api.login({ email, senha });
      localStorage.setItem('token', response.token); // Salva o token
      // Opcional: salvar dados do usuário também
      localStorage.setItem('usuario', JSON.stringify(response.usuario));
      toast.success('Login realizado com sucesso!');
      navigate('/agenda'); // Redireciona para a página principal
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        {/* <img src={logo} alt="MTEC Soluções em Tecnologia" className="login-logo" /> */}
        <div className="login-header-text">
          <span className="welcome-text">Bem-vindo(a) ao</span>
          <span className="system-name">SYSMTEC</span>
        </div>
      </header>
      <main className="login-main">
        <div className="login-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                className="form-control"
                placeholder="Insira seu e-mail..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className="form-control"
                placeholder="Insira sua senha..."
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            <div className="form-options">
              <Link to="/esqueci-senha" className="forgot-password-link">
                Esqueci a senha
              </Link>
            </div>
            <button type="submit" className="login-button">
              Entrar
            </button>
          </form>
        </div>
      </main>
      <footer className="login-footer">
        <p>&lt;/&gt; por Mateus Euzébio</p>
      </footer>
    </div>
  );
}

export default LoginPage;
