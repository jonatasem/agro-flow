import React from "react";
import { useAuth } from "../hooks/useAuth";
import { LoginPage } from "../pages/Login/LoginPage";

interface ProtectedRouteProps {
  children: React.ReactElement; 
  allowedRoles?: string[]; 
}

/**
 * Componente de Proteção de Rotas / Telas com Suporte a Nível de Acesso (Roles)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-sm animate-pulse">Autenticando sessão...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-2">
        <p className="text-base font-bold text-red-400">Acesso Negado</p>
        <p className="text-xs text-slate-400">Você não tem permissão para visualizar esta página.</p>
      </div>
    );
  }

  return children;
};
