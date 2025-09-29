import React, { useState, useEffect } from 'react';
import '../styles/UserFormModal.css';

function UserFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({ email: '', perfil: 'usuario' });

  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email || '',
        perfil: initialData.perfil || 'usuario',
      });
    } else {
      setFormData({ email: '', perfil: 'usuario' });
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
    onSubmit(formData);
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
              disabled={isEditing} // Não permite editar o e-mail
            />
          </div>
          <div className="form-group">
            <label htmlFor="perfil">Perfil</label>
            <select
              id="perfil"
              name="perfil"
              value={formData.perfil}
              onChange={handleChange}
              required
            >
              <option value="usuario">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-save">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserFormModal;
