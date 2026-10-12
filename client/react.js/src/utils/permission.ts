// 1. Dicionário de Permissões do Sistema
export const PERMISSIONS = {
  COLLABORATOR_MANAGE: 'collaborator:manage',
  OPERATOR_MANAGE: 'operator:manage',
  EQUIPMENT_CREATE: 'equipment:create',
  EQUIPMENT_VIEW: 'equipment:view',
  WORK_ORDER_CREATE: 'work_order:create',
  WORK_ORDER_EXECUTE: 'work_order:execute',
  METRICS_VIEW: 'metrics:view',
} as const;

// Tipo TypeScript derivado automaticamente dos valores de PERMISSIONS
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Lista com todas as permissões do sistema (usada para funções de gestão)
const ALL_PERMISSIONS = Object.values(PERMISSIONS);

// 2. Mapeamento de Permissões por Cargo (Role)
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // Cargos com acesso total ao sistema
  admin: ALL_PERMISSIONS,
  gerente: ALL_PERMISSIONS,
  supervisor: ALL_PERMISSIONS,
  lider: ALL_PERMISSIONS,
  coa: ALL_PERMISSIONS,

  // Cargos operacionais com acesso restrito
  tecnico: [
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.WORK_ORDER_EXECUTE,
  ],

  auxiliar: [
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.WORK_ORDER_EXECUTE,
  ],
};

// 3. Funções Auxiliares

/**
 * Normaliza a string do cargo (remove acentos, espaços extras e converte para minúsculas)
 */
export function normalizeRole(role?: string): string {
  if (!role) return '';

  return role
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Valida se um cargo possui uma permissão específica
 */
export function hasPermission(role?: string, permission?: Permission): boolean {
  if (!role || !permission) return false;

  const normalizedRole = normalizeRole(role);
  const userPermissions = ROLE_PERMISSIONS[normalizedRole] || [];

  return userPermissions.includes(permission);
}