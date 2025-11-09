import React, { useState, useEffect } from 'react';
import '../styles/UserFormModal.css';

function UserFormModal({ isOpen, onClose, onSubmit, initialData, isSubmitting }) {
  const [formData, setFormData] = useState({ email: '', perfil: 'usuario', nome_completo: '' });

  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email || '',
        perfil: initialData.perfil || 'usuario',
        nome_completo: initialData.nome_completo || '',
      });
    } else {
      setFormData({ email: '', perfil: 'usuario', nome_completo: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Garante que o perfil não seja enviado ao editar
    // Ao criar, o backend já assume 'usuario' como padrão
    const dataToSend = { ...formData };
    if (isEditing) {
      delete dataToSend.perfil;
    }
    onSubmit(dataToSend);
  };

  const isEditing = initialData && initialData.id_usuario;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{isEditing ? 'Editar Usuário' : 'Criar Novo Usuário'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              maxLength="50"
            />
          </div>
          {isEditing && (
            <div className="form-group">
              <label htmlFor="nome_completo">Nome Completo</label>
              <input
                type="text"
                id="nome_completo"
                name="nome_completo"
                value={formData.nome_completo}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              {isSubmitting && !isEditing ? 'Enviando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserFormModal;
