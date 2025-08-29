import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../styles/ConfirmationModal.css';

const modalRoot =
  document.getElementById('modal-root') || document.body;

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  closeOnBackdrop = true,
}) => {
  // trava o scroll enquanto o modal está aberto
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modal = (
    <div
      className="modal-overlay"
      onClick={closeOnBackdrop ? onClose : undefined}
      role="presentation"
    >
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onConfirm} className="confirm-button">Confirmar</button>
          <button onClick={onClose} className="cancel-button">Cancelar</button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, modalRoot);
};

export default ConfirmationModal;
