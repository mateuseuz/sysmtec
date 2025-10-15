import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // Se não houver usuário ou o perfil do usuário não for 'admin', redireciona
  if (!usuario || usuario.perfil !== 'admin') {
    // Redireciona para uma página padrão (como agenda) se não for admin
    return <Navigate to="/agenda" replace />;
  }

  // Se for admin, renderiza o conteúdo da rota aninhada
  return <Outlet />;
};

export default AdminRoute;
