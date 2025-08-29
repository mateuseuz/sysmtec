import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavLink from './NavLink';
import { faCalendarAlt, faUsers, faWrench, faFileInvoiceDollar, faHistory, faCogs } from '@fortawesome/free-solid-svg-icons';
import '../styles/Clientes.css';

const Layout = () => {
  const [isFormDirty, setFormDirty] = useState(false);

  return (
    <div className="sysmtec-container">
      <div className="sysmtec-sidebar">
        <header className="sysmtec-header">
          <h1>SYSMTEC</h1>
        </header>
        <nav>
          <ul>
            <NavLink to="/agenda" icon={faCalendarAlt} isDirty={isFormDirty}>Agenda</NavLink>
            <NavLink to="/clientes" icon={faUsers} isDirty={isFormDirty}>Clientes</NavLink>
            <NavLink to="/ordens-servico" icon={faWrench} isDirty={isFormDirty}>Ordens de Serviço</NavLink>
            <NavLink to="/orcamentos" icon={faFileInvoiceDollar} isDirty={isFormDirty}>Orçamentos</NavLink>
            <NavLink to="/logs" icon={faHistory} isDirty={isFormDirty}>Log de alterações</NavLink>
            <NavLink to="/painel-controle" icon={faCogs} isDirty={isFormDirty}>Painel de Controle</NavLink>
          </ul>
        </nav>
      </div>
      <main className="sysmtec-main">
        <Outlet context={{ setFormDirty }} />
      </main>
    </div>
  );
};

export default Layout;
