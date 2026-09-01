import React from "react";
import { Navigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { usePermission } from "../hooks/usePermission";
import { type Permission } from "../utils/permission";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  allowedRoles?: string[];
}

// Componente para proteger rotas por autenticação e níveis de permissão
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  allowedRoles,
}) => {
  const { isAuthenticated, loading } = useAuth();
  const { hasPermission, role } = usePermission();

  // Exibe tela simples de carregamento enquanto verifica o token
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-sm animate-pulse">Autenticando sessão...</p>
      </div>
    );
  }

  // Redireciona para a tela de login caso não esteja autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Valida a permissão específica necessária para acessar a página
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <UnauthorizedScreen />;
  }

  // Validação alternativa baseada diretamente nos cargos (fallback)
  if (allowedRoles && role) {
    const allowedNormalized = allowedRoles.map((r) => r.toLowerCase().trim());
    if (!allowedNormalized.includes(role)) {
      return <UnauthorizedScreen />;
    }
  }

  // Renderiza o conteúdo da página caso esteja autorizado
  return <>{children}</>;
};

// Tela de aviso para quando o usuário não tem permissão de acesso
function UnauthorizedScreen() {
  return (
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
}