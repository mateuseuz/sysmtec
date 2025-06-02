import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/Clientes.css';

function CadastroCliente() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    celular: '',
    endereco: '',
    email: '',
    observacoes: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
  const { name, value } = e.target;
  
  // Remove todos os caracteres não numéricos para CPF/CNPJ e celular
  const cleanedValue = (name === 'cpf_cnpj' || name === 'celular') 
    ? value.replace(/\D/g, '')
    : value;

  setFormData(prev => ({ ...prev, [name]: cleanedValue }));
  
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};

  const validateForm = () => {
  const newErrors = {};
  let isValid = true;

  if (!formData.nome.trim()) {
    newErrors.nome = 'Nome é obrigatório';
    isValid = false;
  }

  if (!formData.cpf_cnpj || !/^\d+$/.test(formData.cpf_cnpj)) {
    newErrors.cpf_cnpj = 'Digite apenas números';
    isValid = false;
  } else if (!(formData.cpf_cnpj.length === 11 || formData.cpf_cnpj.length === 14)) {
    newErrors.cpf_cnpj = 'CPF (11 dígitos) ou CNPJ (14 dígitos)';
    isValid = false;
  }

  // Validação opcional para celular
  if (formData.celular && !/^\d{11}$/.test(formData.celular)) {
    newErrors.celular = 'Celular deve ter 11 dígitos';
    isValid = false;
  }

  setErrors(newErrors);
  return isValid;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''),
        celular: formData.celular.replace(/\D/g, '') || null
      };

      await api.criarCliente(payload);
      toast.success('Cliente cadastrado com sucesso!');
      navigate('/clientes');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao cadastrar cliente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sysmtec-container">
      <header className="sysmtec-header">
        <h1>SYSMTEC</h1>
        <h2>TELA DE CADASTRO DE CLIENTE</h2>
      </header>

      <div className="sysmtec-sidebar">
        <nav>
          <ul>
            <li><Link to="/agenda">Agenda</Link></li>
            <li className="active"><Link to="/clientes">Clientes</Link></li>
            <li><Link to="/projetos">Projetos e Serviços</Link></li>
            <li><Link to="/orcamentos">Orçamentos</Link></li>
            <li><Link to="/log">Log de alterações</Link></li>
          </ul>
        </nav>
      </div>

      <main className="sysmtec-main">
        <Link to="/clientes" className="back-button">VOLTAR</Link>

        <form onSubmit={handleSubmit} className="cliente-form">
          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={errors.nome ? 'error' : ''}
            />
            {errors.nome && <span className="error-message">{errors.nome}</span>}
          </div>

          <div className="form-group">
            <label>CPF/CNPJ *</label>
            <input
              type="text"
              name="cpf_cnpj"
              value={formData.cpf_cnpj}
              onChange={handleChange}
              className={errors.cpf_cnpj ? 'error' : ''}
            />
            {errors.cpf_cnpj && <span className="error-message">{errors.cpf_cnpj}</span>}
          </div>

          <div className="form-group">
            <label>Celular</label>
            <input
              type="tel"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              className={errors.celular ? 'error' : ''}
            />
            {errors.celular && <span className="error-message">{errors.celular}</span>}
          </div>

          <div className="form-group">
            <label>Endereço</label>
            <input
              type="text"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              maxLength="500"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`submit-button ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Salvando...
              </>
            ) : 'Cadastrar Cliente'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default CadastroCliente;