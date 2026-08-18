// 1. Constantes com todas as ações/permissões do sistema
export const PERMISSIONS = {
  // Colaboradores e Operadores
  COLLABORATOR_MANAGE: 'collaborator:manage', // Criar, editar, deletar colaboradores
  OPERATOR_MANAGE: 'operator:manage',

  // Equipamentos
  EQUIPMENT_CREATE: 'equipment:create',
  EQUIPMENT_VIEW: 'equipment:view',

  // Ordens de Serviço
  WORK_ORDER_CREATE: 'work_order:create',
  WORK_ORDER_EXECUTE: 'work_order:execute', // Iniciar, pausar, finalizar setores

  // Dashboard / Métricas
  METRICS_VIEW: 'metrics:view',
} as const;

// Tipo derivado das permissões para garatir autocompletação e type-safety no TypeScript
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Normaliza o nome da role enviada pelo backend para caixa baixa e sem acentos.
 * Exemplo: "Líder" -> "lider", "ADMIN" -> "admin"
 */
export function normalizeRole(role?: string): string {
  if (!role) return '';
  return role
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// 2. Matriz de permissões mapeada com as chaves já normalizadas
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(PERMISSIONS),
  gerente: Object.values(PERMISSIONS),
  supervisor: Object.values(PERMISSIONS),
  lider: Object.values(PERMISSIONS),

  tecnico: [
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.WORK_ORDER_EXECUTE,
  ],

  auxiliar: [
    PERMISSIONS.EQUIPMENT_VIEW,
    PERMISSIONS.WORK_ORDER_EXECUTE,
  ],
};