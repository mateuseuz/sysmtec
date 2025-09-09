import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // Se não houver usuário ou o usuário não for admin (id 1), redireciona
  if (!usuario || usuario.id_usuario !== 1) {
    // Pode redirecionar para a página inicial ou uma página de "acesso negado"
    return <Navigate to="/agenda" replace />;
  }

  // Se for admin, renderiza o conteúdo da rota aninhada
  return <Outlet />;
};

export default AdminRoute;
