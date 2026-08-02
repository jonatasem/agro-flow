// Importa a biblioteca React para tipagem de componentes.
import React from "react";

// Importa o hook personalizado de autenticação para validar a sessão do usuário.
import { useAuth } from "../hooks/useAuth";

// Importa a página de Login que será exibida caso o usuário não esteja autenticado.
import { Login } from "../pages/Login";

// Define as propriedades aceitas pelo componente de proteção.
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Lista opcional de strings contendo os cargos autorizados.
}

/**
 * Componente de Proteção de Rotas / Telas com Suporte a Nível de Acesso (Roles)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  // Extrai o usuário ativo, o estado de autenticação e o carregamento inicial do hook global useAuth.
  const { user, isAuthenticated, loading } = useAuth();

  // Se o sistema ainda estiver validando o token ou buscando no localStorage, exibe tela de espera.
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-sm animate-pulse">Autenticando sessão...</p>
      </div>
    );
  }

  // Se NÃO estiver autenticado, barra o acesso aos componentes filhos e renderiza a página de Login.
  if (!isAuthenticated) {
    return <Login />;
  }

  // Se a tela exigir cargos específicos e o cargo do usuário atual NÃO estiver contido na lista, barra o acesso.
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-2">
        <p className="text-base font-bold text-red-400">Acesso Negado</p>
        <p className="text-xs text-slate-400">Você não tem permissão para visualizar esta página.</p>
      </div>
    );
  }

  // Se passar por todas as validações de login e cargo, renderiza normalmente os componentes internos protegidos.
  return <>{children}</>;
};
