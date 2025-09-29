import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavLink from './NavLink';
import Chat from './Chat'; // Importar o Chat
import { faCalendarAlt, faUsers, faWrench, faFileInvoiceDollar, faCogs } from '@fortawesome/free-solid-svg-icons';
import '../styles/Clientes.css';

const Layout = () => {
  const [isFormDirty, setFormDirty] = useState(false);
  const usuario = JSON.parse(localStorage.getItem('usuario'));

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
            {/* Corrigido para usar o perfil do usuário */}
            {usuario && usuario.perfil === 'admin' && (
              <NavLink to="/painel-controle" icon={faCogs} isDirty={isFormDirty} setFormDirty={setFormDirty}>Painel de Controle</NavLink>
            )}
          </ul>
        </nav>
      </div>
      <main className="sysmtec-main">
        <Outlet context={{ isFormDirty, setFormDirty }} />
      </main>
      <Chat /> {/* Adiciona o chat ao layout */}
    </div>
  );
};

export default Layout;
