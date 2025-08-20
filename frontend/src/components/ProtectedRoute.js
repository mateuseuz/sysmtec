import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  // Lógica simples de verificação de token.
  // Para uma aplicação real, seria ideal decodificar e validar o token aqui.
  if (!token) {
    // Se não houver token, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Se houver token, renderiza o conteúdo da rota protegida
  return <Outlet />;
};

export default ProtectedRoute;
