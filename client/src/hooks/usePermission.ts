import { useAuth } from './useAuth';
import { normalizeRole, ROLE_PERMISSIONS, type Permission } from '../utils/permission';

export function usePermission() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user?.role) return false;

    const normalizedRole = normalizeRole(user.role);
    const userPermissions = ROLE_PERMISSIONS[normalizedRole] || [];

    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  return { hasPermission, hasAnyPermission };
}