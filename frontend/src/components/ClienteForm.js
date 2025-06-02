import React from 'react';
import '../App.css';

function ClienteForm({ cliente, onSubmit, isLoading }) {
  const [formData, setFormData] = React.useState({
    nome: cliente?.nome || '',
    cpf_cnpj: cliente?.cpf_cnpj || '',
    endereco: cliente?.endereco || '',
    email: cliente?.email || '',
    celular: cliente?.celular || '',
    observacoes: cliente?.observacoes || ''
  });

  const [errors, setErrors] = React.useState({
    cpf_cnpj: '',
    celular: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    // Apenas números para CPF/CNPJ e celular
    const cleanedValue = (name === 'cpf_cnpj' || name === 'celular')
      ? value.replace(/\D/g, '')
      : value;

    setFormData(prev => ({ ...prev, [name]: cleanedValue }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let hasErrors = false;
    const newErrors = { ...errors };
  
    if (!/^\d+$/.test(formData.cpf_cnpj)) {
      newErrors.cpf_cnpj = 'CPF/CNPJ deve conter apenas números';
      hasErrors = true;
    }
  
    if (formData.celular && !/^\d+$/.test(formData.celular)) {
      newErrors.celular = 'Celular deve conter apenas números';
      hasErrors = true;
    }
  
    setErrors(newErrors);
    if (hasErrors) return;
    if (!formData.cpf_cnpj || (formData.cpf_cnpj.length !== 11 && formData.cpf_cnpj.length !== 14)) {
      alert('CPF/CNPJ deve ter 11 (CPF) ou 14 (CNPJ) dígitos');
      return;
    }
    
    if (formData.celular && (formData.celular.length !== 10 && formData.celular.length !== 11)) {
      alert('Celular deve ter 10 ou 11 dígitos (com DDD)');
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="cliente-form">
      <div className="form-group">
        <label>Nome</label>
        <input
          type="text"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
          maxLength="50"
        />
      </div>

      <div className="form-group">
        <label>CPF/CNPJ</label>
        <input
          type="text"
          name="cpf_cnpj"
          value={formData.cpf_cnpj}
          onChange={handleChange}
          required
          maxLength={14}
        />
        {errors.cpf_cnpj && <div className="error-message">{errors.cpf_cnpj}</div>}
      </div>

      <div className="form-group">
        <label>Endereço</label>
        <input
          type="text"
          name="endereco"
          value={formData.endereco}
          onChange={handleChange}
          maxLength="70"
        />
      </div>

      <div className="form-group">
        <label>E-mail</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          maxLength="50"
        />
      </div>

      <div className="form-group">
        <label>Celular</label>
        <input
          type="tel"
          name="celular"
          value={formData.celular}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          maxLength="11"
        />
        {errors.celular && <div className="error-message">{errors.celular}</div>}
      </div>

      <div className="form-group">
        <label>Observações</label>
        <textarea
          name="observacoes"
          value={formData.observacoes}
          onChange={handleChange}
          maxLength="100"
        />
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}

export default ClienteForm;