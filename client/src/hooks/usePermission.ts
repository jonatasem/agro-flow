import { useAuth } from './useAuth';
import { normalizeRole, ROLE_PERMISSIONS, type Permission } from '../utils/permission';

export function usePermission() {
  const { user } = useAuth();

  const role = user?.role ? normalizeRole(user.role) : '';

  const hasPermission = (permission: Permission): boolean => {
    if (!role) return false;
    const userPermissions = ROLE_PERMISSIONS[role] || [];
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  return { hasPermission, hasAnyPermission, role };
}