import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import '../styles/GerenciarUsuarios.css';
import '../styles/Clientes.css';
import '../styles/Orcamentos.css';

function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
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

  return (
    <div className="sysmtec-container-public">
      <header className="sysmtec-header">
        <h1>SYSMTEC</h1>
      </header>
      <main className="sysmtec-main-public">
        <div className="gerenciar-usuarios-container" style={{ maxWidth: '600px', margin: 'auto' }}>
          <div className="header-container" style={{ marginBottom: '2rem', textAlign: 'center', justifyContent: 'center' }}>
            <h2>Esqueceu sua Senha?</h2>
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                Se um usuário com o e-mail fornecido existir em nosso sistema, um link para redefinição de senha foi enviado.
              </p>
              <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
                Por favor, verifique sua caixa de entrada (e a pasta de spam).
              </p>
              <Link to="/login" className="btn-primary" style={{ minWidth: '100px' }}>
                Voltar para o Login
              </Link>
            </div>
          ) : (
            <>
              <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.1rem' }}>
                Não se preocupe. Insira seu e-mail abaixo e enviaremos um link para você redefinir sua senha.
              </p>
              <form onSubmit={handleSubmit} className="cliente-form" style={{ maxWidth: '100%' }}>
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
        </div>
      </main>
    </div>
  );
}

export default EsqueciSenhaPage;
