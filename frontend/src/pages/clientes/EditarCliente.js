import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/Clientes.css';

function EditarCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    celular: '',
    endereco: '',
    email: '',
    observacoes: ''
  });
  const [errors, setErrors] = useState({});

  // Carrega os dados do cliente ao montar o componente
  useEffect(() => {
    const carregarCliente = async () => {
      try {
        const cliente = await api.buscarCliente(id);
        setFormData({
          nome: cliente.nome || '',
          cpf_cnpj: formatarDocumento(cliente.cpf_cnpj) || '',
          celular: formatarTelefone(cliente.celular) || '',
          endereco: cliente.endereco || '',
          email: cliente.email || '',
          observacoes: cliente.observacoes || ''
        });
      } catch (error) {
        toast.error('Erro ao carregar cliente: ' + error.message);
        navigate('/clientes');
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarCliente();
  }, [id, navigate]);

  // Funções auxiliares para formatação
  const formatarDocumento = (doc) => {
    if (!doc) return '';
    const nums = doc.replace(/\D/g, '');
    return nums.length === 11 ? 
      nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') :
      nums.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatarTelefone = (tel) => {
    if (!tel) return '';
    const nums = tel.replace(/\D/g, '');
    return nums.length === 11 ? 
      nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') :
      nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Formatação específica para CPF/CNPJ e celular
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
    
    // Limpa erro do campo quando modificado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validação do nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
      isValid = false;
    }

    // Validação do CPF/CNPJ
    const cpfCnpjLimpo = formData.cpf_cnpj.replace(/\D/g, '');
    if (!(cpfCnpjLimpo.length === 11 || cpfCnpjLimpo.length === 14)) {
      newErrors.cpf_cnpj = 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos';
      isValid = false;
    }

    // Validação do e-mail
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
      const payload = {
        ...formData,
        cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''),
        celular: formData.celular ? formData.celular.replace(/\D/g, '') : null
      };

      await api.atualizarCliente(id, payload);
      toast.success('Cliente atualizado com sucesso!');
      navigate('/clientes');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error(error.response?.data?.error || 'Erro ao atualizar cliente');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="sysmtec-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sysmtec-container">
      <header className="sysmtec-header">
        <h1>SYSMTEC</h1>
        <h2>TELA DE EDIÇÃO DE CLIENTE</h2>
      </header>

      <div className="sysmtec-sidebar">
        <nav>
          <ul>
            <li><Link to="/agenda">Agenda</Link></li>
            <li className="active"><Link to="/clientes">Clientes</Link></li>
            <li><Link to="/projetos">Ordens de Serviço</Link></li>
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
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              className={errors.cpf_cnpj ? 'error' : ''}
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
              placeholder="(00) 00000-0000"
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
            ) : 'SALVAR ALTERAÇÕES'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default EditarCliente;