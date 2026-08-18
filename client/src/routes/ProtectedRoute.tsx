import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { normalizeRole } from "../utils/permission"

interface ProtectedRouteProps {
  children: React.ReactElement; 
  allowedRoles?: string[]; 
}

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
    return <Navigate to="/login" replace />;
  }

  // Normalização para evitar problemas de maiúsculas/minúsculas e acentuação
  if (allowedRoles && user?.role) {
    const userRoleNormalized = normalizeRole(user.role);
    const allowedNormalized = allowedRoles.map((role) => normalizeRole(role));

    if (!allowedNormalized.includes(userRoleNormalized)) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-2">
          <p className="text-base font-bold text-red-400">Acesso Negado</p>
          <p className="text-xs text-slate-400">Você não tem permissão para visualizar esta página.</p>
        </div>
      );
    }
  }

  return children;
};