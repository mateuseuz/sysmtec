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
<NavLink to="/agenda" icon={faCalendarAlt} isDirty={isFormDirty} setFormDirty={setFormDirty}>Agenda</NavLink>
<NavLink to="/clientes" icon={faUsers} isDirty={isFormDirty} setFormDirty={setFormDirty}>Clientes</NavLink>
<NavLink to="/ordens-servico" icon={faWrench} isDirty={isFormDirty} setFormDirty={setFormDirty}>Ordens de Serviço</NavLink>
<NavLink to="/orcamentos" icon={faFileInvoiceDollar} isDirty={isFormDirty} setFormDirty={setFormDirty}>Orçamentos</NavLink>
<NavLink to="/logs" icon={faHistory} isDirty={isFormDirty} setFormDirty={setFormDirty}>Log de alterações</NavLink>
<NavLink to="/painel-controle" icon={faCogs} isDirty={isFormDirty} setFormDirty={setFormDirty}>Painel de Controle</NavLink>
          </ul>
        </nav>
      </div>
      <main className="sysmtec-main">
<Outlet context={{ isFormDirty, setFormDirty }} />
      </main>
    </div>
  );
};

export default Layout;
