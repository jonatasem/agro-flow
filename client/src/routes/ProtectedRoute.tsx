import React from "react";
import { Navigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { usePermission } from "../hooks/usePermission";
import { type Permission } from "../utils/permission";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  allowedRoles?: string[]; // Mantido para retrocompatibilidade caso necessário
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  allowedRoles,
}) => {
  const { isAuthenticated, loading } = useAuth();
  const { hasPermission, role } = usePermission();

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

  // Validação por Permissão Granular (Recomendado)
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <UnauthorizedScreen />;
  }

  // Validação Legada por Role (Fallback)
  if (allowedRoles && role) {
    const allowedNormalized = allowedRoles.map((r) => r.toLowerCase().trim());
    if (!allowedNormalized.includes(role)) {
      return <UnauthorizedScreen />;
    }
  }

  return <>{children}</>;
};

const UnauthorizedScreen = () => (
  <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4 text-center px-4">
    <div>
      <p className="text-lg font-bold text-red-400">Acesso Negado</p>
      <p className="text-xs text-slate-400 mt-1">
        Você não tem permissão para visualizar esta página.
      </p>
    </div>
    <Link
      to="/dashboard"
      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-md transition-colors"
    >
      Voltar ao Dashboard
    </Link>
  </div>
);