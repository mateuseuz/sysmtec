import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ConfirmationModal from './ConfirmationModal';

const NavLink = ({ to, icon, isDirty = false, setFormDirty, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isActive = location.pathname.startsWith(to);

  const handleNavigate = () => {
    if (isDirty) {
      setIsModalOpen(true);
    } else {
      navigate(to);
    }
  };

  const confirmNavigation = () => {
    setIsModalOpen(false);
    if (setFormDirty) {
      setFormDirty(false);
    }
    navigate(to);
  };

  return (
    <>
      <li className={isActive ? 'active' : ''}>
        <div onClick={handleNavigate} className="nav-link-container">
          <FontAwesomeIcon icon={icon} />
          <span>{children}</span>
        </div>
      </li>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmNavigation}
        message="Você tem certeza que quer descartar as alterações?"
      />
    </>
  );
};

export default NavLink;
