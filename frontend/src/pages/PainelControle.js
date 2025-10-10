import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faUsersCog, faUserShield } from '@fortawesome/free-solid-svg-icons';
import '../styles/PainelControle.css';

function PainelControlePage() {
  return (
    <>
      <h2>Painel de Controle</h2>
      <p>Bem-vindo ao painel de controle. Utilize as opções abaixo para gerenciar o sistema.</p>

      <div className="admin-options">
        <h3>Opções de Administrador</h3>
        <ul className="admin-actions">
          <li>
            <Link to="/painel-controle/logs" className="action-card">
              <FontAwesomeIcon icon={faHistory} className="icon" />
              <span>Visualizar Logs</span>
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
    </>
  );
}

export default PainelControlePage;
