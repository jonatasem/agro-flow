export const PERMISSIONS = {
  COLLABORATOR_MANAGE: 'collaborator:manage',
  OPERATOR_MANAGE: 'operator:manage',
  EQUIPMENT_CREATE: 'equipment:create',
  EQUIPMENT_VIEW: 'equipment:view',
  WORK_ORDER_CREATE: 'work_order:create',
  WORK_ORDER_EXECUTE: 'work_order:execute',
  METRICS_VIEW: 'metrics:view',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function normalizeRole(role?: string): string {
  if (!role) return '';
  return role
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(PERMISSIONS),
  gerente: Object.values(PERMISSIONS),
  supervisor: Object.values(PERMISSIONS),
  lider: Object.values(PERMISSIONS),
  coa: Object.values(PERMISSIONS),

  tecnico: [
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.WORK_ORDER_EXECUTE,
  ],

  auxiliar: [
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.WORK_ORDER_EXECUTE,
  ],
};

// HELPER ADICIONADO: Valida se uma determinada role possui a permissão requerida
export function hasPermission(role?: string, permission?: Permission): boolean {
  if (!role || !permission) return false;
  const normalized = normalizeRole(role);
  const permissions = ROLE_PERMISSIONS[normalized] || [];
  return permissions.includes(permission);
}