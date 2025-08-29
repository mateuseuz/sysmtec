import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatCPForCNPJ, formatCelular } from '../../utils/validations';
import '../../styles/Clientes.css';

function VisualizacaoCliente() {
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

  useEffect(() => {
    const carregarCliente = async () => {
      try {
        const cliente = await api.buscarCliente(id);
        setFormData({
          nome: cliente.nome || '',
          cpf_cnpj: formatCPForCNPJ(cliente.cpf_cnpj) || '',
          celular: formatCelular(cliente.celular) || '',
          endereco: cliente.endereco || '',
          email: cliente.email || '',
          observacoes: cliente.observacoes || ''
        });
      } catch (error) {
        toast.error('Erro ao carregar cliente: ' + error.message + '.');
        navigate('/clientes');
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarCliente();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando cliente...</p>
      </div>
    );
  }

  return (
    <>
      <Link to="/clientes" className="back-button">⬅️ VOLTAR</Link>

      <div className="cliente-form"> {}
        <div className="form-group">
          <label>Nome</label> {}
          <input
            type="text"
            name="nome"
            value={formData.nome}
            readOnly
            disabled
          />
        </div>

        <div className="form-group">
          <label>CPF/CNPJ</label> {}
          <input
            type="text"
            name="cpf_cnpj"
            value={formData.cpf_cnpj}
            readOnly
            disabled
          />
        </div>

        <div className="form-group">
          <label>Celular</label>
          <input
            type="tel"
            name="celular"
            value={formData.celular}
            readOnly
            disabled
          />
        </div>

        <div className="form-group">
          <label>Endereço</label>
          <input
            type="text"
            name="endereco"
            value={formData.endereco}
            readOnly
            disabled
          />
        </div>

        <div className="form-group">
          <label>E-mail</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly
            disabled
          />
        </div>

        <div className="form-group">
          <label>Observações</label>
          <textarea
            name="observacoes"
            value={formData.observacoes}
            readOnly
            disabled
            maxLength="500"
          />
        </div>

        {}
      </div>
    </>
  );
}

export default VisualizacaoCliente;
