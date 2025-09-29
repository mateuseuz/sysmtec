import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import '../styles/EsqueciSenha.css'; // Vamos criar este estilo

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
      setSubmitted(true); // Mostra a mensagem de confirmação
    } catch (error) {
      toast.error(`Erro ao enviar o pedido: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="esqueci-senha-page">
      <div className="esqueci-senha-container">
        <h2>Esqueceu sua Senha?</h2>
        {submitted ? (
          <div className="confirmation-message">
            <p>Se um usuário com o e-mail fornecido existir em nosso sistema, um link para redefinição de senha foi enviado.</p>
            <p>Por favor, verifique sua caixa de entrada (e a pasta de spam).</p>
            <Link to="/login" className="btn-back-to-login">Voltar para o Login</Link>
          </div>
        ) : (
          <>
            <p>Não se preocupe. Insira seu e-mail abaixo e enviaremos um link para você redefinir sua senha.</p>
            <form onSubmit={handleSubmit} className="esqueci-senha-form">
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-control"
                />
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
              </button>
            </form>
            <div className="back-to-login-link">
              <Link to="/login">Lembrou a senha? Voltar para o Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EsqueciSenhaPage;
