import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { validarCPFCNPJ, validarCelular } from '../../utils/validations';
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
  
  let formattedValue = value;
  
  if (name === 'cpf_cnpj') {
    // const originalValue = value; // Para controle de cursor avançado (não implementado aqui)
    const nums = value.replace(/\D/g, '');
    // formattedValue = nums; // Inicialização removida para evitar atribuição desnecessária

    if (nums.length === 0) {
      formattedValue = '';
    } else if (nums.length <= 3) { // XXX
      formattedValue = nums;
    } else if (nums.length <= 6) { // XXX.XXX
      formattedValue = `${nums.substring(0, 3)}.${nums.substring(3)}`;
    } else if (nums.length <= 9) { // XXX.XXX.XXX
      formattedValue = `${nums.substring(0, 3)}.${nums.substring(3, 6)}.${nums.substring(6, 9)}`;
    } else if (nums.length <= 11) { // XXX.XXX.XXX-XX (CPF)
      formattedValue = `${nums.substring(0, 3)}.${nums.substring(3, 6)}.${nums.substring(6, 9)}-${nums.substring(9, 11)}`;
    } else if (nums.length <= 14) { // XX.XXX.XXX/XXXX-XX (CNPJ)
      const cnpjNums = nums.substring(0, 14); // Pega no máximo 14 dígitos
      if (cnpjNums.length <= 2) {
        formattedValue = cnpjNums;
      } else if (cnpjNums.length <= 5) {
        formattedValue = `${cnpjNums.substring(0, 2)}.${cnpjNums.substring(2)}`;
      } else if (cnpjNums.length <= 8) {
        formattedValue = `${cnpjNums.substring(0, 2)}.${cnpjNums.substring(2, 5)}.${cnpjNums.substring(5)}`;
      } else if (cnpjNums.length <= 12) {
        formattedValue = `${cnpjNums.substring(0, 2)}.${cnpjNums.substring(2, 5)}.${cnpjNums.substring(5, 8)}/${cnpjNums.substring(8)}`;
      } else {
        formattedValue = `${cnpjNums.substring(0, 2)}.${cnpjNums.substring(2, 5)}.${cnpjNums.substring(5, 8)}/${cnpjNums.substring(8, 12)}-${cnpjNums.substring(12)}`;
      }
    } else { // Mais de 14 dígitos, truncar para o formato CNPJ formatado
      const cnpjNums = nums.substring(0, 14);
      formattedValue = `${cnpjNums.substring(0, 2)}.${cnpjNums.substring(2, 5)}.${cnpjNums.substring(5, 8)}/${cnpjNums.substring(8, 12)}-${cnpjNums.substring(12, 14)}`;
    }
  } else if (name === 'celular') {
    const nums = value.replace(/\D/g, '');
    formattedValue = ''; // Inicializa formattedValue

    if (nums.length === 0) {
      formattedValue = '';
    } else if (nums.length <= 2) { // (XX
      formattedValue = `(${nums}`;
    } else if (nums.length <= 6) { // (XX) XXXX
      formattedValue = `(${nums.substring(0, 2)}) ${nums.substring(2, 6)}`;
    } else if (nums.length <= 10) { // (XX) XXXX-ZZZZ (10 dígitos no total)
      formattedValue = `(${nums.substring(0, 2)}) ${nums.substring(2, 6)}-${nums.substring(6, 10)}`;
    } else { // (XX) XXXXX-ZZZZ (11 dígitos no total, ou mais, será truncado)
      formattedValue = `(${nums.substring(0, 2)}) ${nums.substring(2, 7)}-${nums.substring(7, 11)}`;
    }

    // Limitar o tamanho máximo da string formatada para evitar overflow no input se algo muito grande for colado.
    // (XX) XXXXX-XXXX tem 15 caracteres.
    if (formattedValue.length > 15) {
        formattedValue = formattedValue.substring(0, 15);
    }
  } else {
    formattedValue = value;
  }

  setFormData(prev => ({ ...prev, [name]: formattedValue }));
  if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
};

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
      isValid = false;
    }

    try {
      validarCPFCNPJ(formData.cpf_cnpj);
    } catch (error) {
      newErrors.cpf_cnpj = error.message;
      isValid = false;
    }

    try {
      validarCelular(formData.celular);
    } catch (error) {
      newErrors.celular = error.message;
      isValid = false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
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
    // Prepara os dados garantindo que nenhum campo seja null/undefined
    const payload = {
      nome: formData.nome,
      cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''), // Obrigatório (já validado)
      celular: formData.celular ? formData.celular.replace(/\D/g, '') : null,
      endereco: formData.endereco || null,
      email: formData.email || null,
      observacoes: formData.observacoes || null
    };

    console.log('Payload enviado:', payload); // Para debug

    await api.criarCliente(payload);
    toast.success('Cliente cadastrado com sucesso!');
    navigate('/clientes');
  } catch (error) {
    console.error('Erro detalhado:', error);
    toast.error(error.message || 'Erro ao cadastrar cliente');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="sysmtec-container">
      <header className="sysmtec-header">
        <h1>SYSMTEC</h1>
      </header>

      <div className="sysmtec-sidebar">
        <nav>
          <ul>
            <li><Link to="/agenda"><span>🗓️</span>Agenda</Link></li>
            <li className="active"><Link to="/clientes"><span>👥</span>Clientes</Link></li>
            <li><Link to="/projetos"><span>🛠️</span>Ordens de Serviço</Link></li>
            <li><Link to="/orcamentos"><span>📄</span>Orçamentos</Link></li>
            <li><Link to="/log"><span>📋</span>Log de alterações</Link></li>
          </ul>
        </nav>
      </div>

      <main className="sysmtec-main">
        <Link to="/clientes" className="back-button">&lt; VOLTAR</Link>

        <form onSubmit={handleSubmit} className="cliente-form">
          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={errors.nome ? 'error' : ''}
              required
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
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              required
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
              placeholder="(00) 00000-0000"
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