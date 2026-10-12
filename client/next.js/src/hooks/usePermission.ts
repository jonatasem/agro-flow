import { useAuth } from "./useAuth";
import {
  normalizeRole,
  ROLE_PERMISSIONS,
  type Permission,
} from "@/utils/permission";

// Verificação de permissões e cargos do utilizador logado.
export function usePermission() {
  const { user } = useAuth();

  // Normaliza o cargo (role) do utilizador
  const role = user?.role ? normalizeRole(user.role) : "";

  // Verifica se o utilizador possui uma permissão específica
  const hasPermission = (permission: Permission): boolean => {
    if (!role) return false;
    const userPermissions = ROLE_PERMISSIONS[role] || [];
    return userPermissions.includes(permission);
  };

  // Verifica se o utilizador possui pelo menos uma das permissões informadas
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  return { hasPermission, hasAnyPermission, role };
}