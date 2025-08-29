import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { validarCPFCNPJ, validarCelular } from '../../utils/validations';
import ConfirmationModal from '../../components/ConfirmationModal';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../styles/Clientes.css';

function CadastroCliente() {
  const navigate = useNavigate();
  const { isFormDirty, setFormDirty } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    celular: '',
    endereco: '',
    email: '',
    observacoes: ''
  });
  const [initialFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    celular: '',
    endereco: '',
    email: '',
    observacoes: ''
  });
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setFormDirty(JSON.stringify(formData) !== JSON.stringify(initialFormData));
  }, [formData, initialFormData, setFormDirty]);

  const handleBackClick = () => {
    if (isFormDirty) {
      setIsModalOpen(true);
    } else {
      navigate('/clientes');
    }
  };

  const handleChange = (e) => {
  const { name, value } = e.target;
  
  let formattedValue = value;
  
  if (name === 'cpf_cnpj') {
    const nums = value.replace(/\D/g, '');

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
    formattedValue = '';

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
      toast.warn('Nome é obrigatório.');
      newErrors.nome = 'Nome é obrigatório.';
      isValid = false;
    }

    try {
      validarCPFCNPJ(formData.cpf_cnpj);
    } catch (error) {
      toast.warn(error.message);
      newErrors.cpf_cnpj = error.message;
      isValid = false;
    }

    try {
      validarCelular(formData.celular);
    } catch (error) {
      toast.warn(error.message);
      newErrors.celular = error.message;
      isValid = false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.warn('E-mail inválido.');
      newErrors.email = 'E-mail inválido.';
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
    setFormDirty(false);
    toast.success('Cliente cadastrado com sucesso!');
    navigate('/clientes');
  } catch (error) {
    console.error('Erro detalhado:', error);
    toast.error(error.message || 'Erro ao cadastrar cliente.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <>
      <button type="button" onClick={handleBackClick} className="back-button">
        <FontAwesomeIcon icon={faArrowLeft} /> VOLTAR
      </button>

      <form onSubmit={handleSubmit} className="cliente-form">
        <div className="form-group">
          <label>Nome <span className="required-asterisk">*</span></label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Nome do cliente"
            className={errors.nome ? 'error' : ''}
          />
          {/* {errors.nome && <span className="error-message">{errors.nome}</span>} */}
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
          />
          {/* {errors.cpf_cnpj && <span className="error-message">{errors.cpf_cnpj}</span>} */}
        </div>

        <div className="form-group">
          <label>Celular <span className="required-asterisk">*</span></label>
          <input
            type="tel"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            className={errors.celular ? 'error' : ''}
            placeholder="(00) 00000-0000"
          />
          {/* {errors.celular && <span className="error-message">{errors.celular}</span>} */}
        </div>

        <div className="form-group">
          <label>Endereço</label>
          <input
            type="text"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            placeholder="Endereço do cliente"
          />
        </div>

        <div className="form-group">
          <label>E-mail</label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Endereço de e-mail do cliente"
            className={errors.email ? 'error' : ''}
          />
          {/* {errors.email && <span className="error-message">{errors.email}</span>} */}
        </div>

        <div className="form-group">
          <label>Observações</label>
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            placeholder="Observações sobre o cliente"
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
          ) : 'Salvar cliente'}
        </button>
      </form>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          setFormDirty(false);
          setTimeout(() => navigate('/clientes'), 0);
        }}
        message="Você tem certeza que quer descartar as alterações?"
      />
    </>
  );
}

export default CadastroCliente;