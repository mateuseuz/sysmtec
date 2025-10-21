import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faUsersCog, faUserShield } from '@fortawesome/free-solid-svg-icons';
import '../styles/PainelControle.css';

function PainelControlePage() {
  return (
    <div className="painel-controle-container">
      <h2>Painel de Controle</h2>

      <div className="admin-options">
        <h3>Opções de Administrador</h3>
        <ul className="admin-actions">
          <li>
            <Link to="/painel-controle/logs" className="action-card">
              <FontAwesomeIcon icon={faHistory} className="icon" />
              <span>Consultar Logs</span>
            </Link>
          </li>
          <li>
            <Link to="/painel-controle/usuarios" className="action-card">
              <FontAwesomeIcon icon={faUsersCog} className="icon" />
              <span>Gerenciar Usuários</span>
            </Link>
          </li>
          <li>
            <Link to="/painel-controle/permissoes" className="action-card">
              <FontAwesomeIcon icon={faUserShield} className="icon" />
              <span>Gerenciar Permissões</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default PainelControlePage;
