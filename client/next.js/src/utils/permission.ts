// Dicionário de Permissões do Sistema
export const PERMISSIONS = {
  COLLABORATOR_MANAGE: 'collaborator:manage',
  OPERATOR_MANAGE: 'operator:manage',
  EQUIPMENT_CREATE: 'equipment:create',
  EQUIPMENT_VIEW: 'equipment:view',
  WORK_ORDER_CREATE: 'work_order:create',
  WORK_ORDER_EXECUTE: 'work_order:execute',
  METRICS_VIEW: 'metrics:view',
} as const;

// Tipo TypeScript derivado automaticamente das chaves e valores de PERMISSIONS
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Lista com todas as permissões do sistema
const ALL_PERMISSIONS = Object.values(PERMISSIONS);

// Mapeamento de Permissões por Cargo
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // Cargos com acesso total e irrestrito ao sistema
  admin: ALL_PERMISSIONS,
  gerente: ALL_PERMISSIONS,
  supervisor: ALL_PERMISSIONS,
  lider: ALL_PERMISSIONS,
  coa: ALL_PERMISSIONS,

  // Cargos operacionais com acesso restrito a visualização e execução
  tecnico: [
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.WORK_ORDER_EXECUTE,
  ],

  auxiliar: [
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.WORK_ORDER_EXECUTE,
  ],
};

// Funções Auxiliares

// Normaliza a string do cargo (remove acentos, espaços extras e converte para letras minúsculas).
export function normalizeRole(role?: string): string {
  if (!role) return '';

  return role
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Valida se um determinado cargo possui permissão para executar uma ação específica.
export function hasPermission(role?: string, permission?: Permission): boolean {
  if (!role || !permission) return false;

  const normalizedRole = normalizeRole(role);
  const userPermissions = ROLE_PERMISSIONS[normalizedRole] || [];

  return userPermissions.includes(permission);
}