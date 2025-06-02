import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../../styles/Clientes.css';

function EditarCliente() {
  const { id } = useParams();
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

  useEffect(() => {
    const carregarCliente = async () => {
      setIsLoading(true);
      try {
        const response = await api.buscarCliente(id);
        setFormData({
          nome: response.data.nome,
          cpf_cnpj: response.data.cpf_cnpj,
          celular: response.data.celular,
          endereco: response.data.endereco,
          email: response.data.email,
          observacoes: response.data.observacoes
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf_cnpj') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .substring(0, 14);
    }

    if (name === 'celular') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
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

    const cpfCnpj = formData.cpf_cnpj.replace(/\D/g, '');
    if (!(cpfCnpj.length === 11 || cpfCnpj.length === 14)) {
      newErrors.cpf_cnpj = 'CPF/CNPJ inválido (11 ou 14 dígitos)';
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
      const payload = {
        ...formData,
        cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''),
        celular: formData.celular.replace(/\D/g, '') || null
      };

      await api.atualizarCliente(id, payload);
      toast.success('Cliente atualizado com sucesso!');
      navigate('/clientes');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar cliente');
    } finally {
      setIsLoading(false);
    }
  };

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
              type="text"
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
            ) : 'Salvar Alterações'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default EditarCliente;