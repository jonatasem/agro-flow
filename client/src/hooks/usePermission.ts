// Hooks da aplicação
import { useAuth } from "./useAuth";

// Utilitários e Tipos de permissão
import {
  normalizeRole,
  ROLE_PERMISSIONS,
  type Permission,
} from "../utils/permission";

// Hook customizado para verificação de permissões do usuário logado
export function usePermission() {
  const { user } = useAuth();

  // Normalização do papel (role) do usuário
  const role = user?.role ? normalizeRole(user.role) : "";

  // Verifica se o usuário possui uma permissão específica
  const hasPermission = (permission: Permission): boolean => {
    if (!role) return false;
    const userPermissions = ROLE_PERMISSIONS[role] || [];
    return userPermissions.includes(permission);
  };

  // Verifica se o usuário possui ao menos uma das permissões informadas
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  return { hasPermission, hasAnyPermission, role };
}