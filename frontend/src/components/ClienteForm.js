import React from 'react';
import '../App.css';
import { validarCPFCNPJ, validarCelular } from '../utils/validations'; // Importe as validações

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
    nome: '',
    cpf_cnpj: '',
    celular: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Formatação em tempo real para CPF/CNPJ e celular
    let formattedValue = value;
    if (name === 'cpf_cnpj') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .substring(0, 18);
    } else if (name === 'celular') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{0,2})(\d{0,5})(\d{0,4})/, '($1) $2-$3')
        .trim()
        .substring(0, 15);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validações básicas
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    
    try {
      validarCPFCNPJ(formData.cpf_cnpj);
    } catch (error) {
      newErrors.cpf_cnpj = error.message;
    }

    try {
      validarCelular(formData.celular);
    } catch (error) {
      newErrors.celular = error.message;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Prepara os dados para envio (remove formatação)
    const payload = {
      ...formData,
      cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''),
      celular: formData.celular.replace(/\D/g, '') || null
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="cliente-form">
      <div className="form-group">
        <label>Nome <span className="required-asterisk">*</span></label>
        <input
          type="text"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          className={errors.nome ? 'error' : ''}
          required
          maxLength="50"
        />
        {errors.nome && <div className="error-message">{errors.nome}</div>}
      </div>

      <div className="form-group">
        <label>CPF/CNPJ <span className="required-asterisk">*</span></label>
        <input
          type="text"
          name="cpf_cnpj"
          value={formData.cpf_cnpj}
          onChange={handleChange}
          className={errors.cpf_cnpj ? 'error' : ''}
          placeholder="000.000.000-00 ou 00.000.000/0000-00"
          required
        />
        {errors.cpf_cnpj && <div className="error-message">{errors.cpf_cnpj}</div>}
      </div>

      <div className="form-group">
        <label>Celular</label>
        <input
          type="tel"
          name="celular"
          value={formData.celular}
          onChange={handleChange}
          className={errors.celular ? 'error' : ''}
          placeholder="(00) 00000-0000"
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