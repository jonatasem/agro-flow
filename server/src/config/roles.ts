/**
 * Lista de cargos com permissão de gestão/supervisão.
 * Qualquer cargo nesta lista pode criar/editar/deletar cadastros.
 */
export const MANAGEMENT_ROLES = ["lider", "gerente", "supervisor", "coa", "admin"];

/**
 * Função rápida para validar se o usuário é superior a Técnico/Auxiliar.
 * Normaliza o texto (caixa baixa e sem espaços) para evitar erros de digitação.
 */
export function isManagement(role?: string): boolean {
  if (!role) return false;
  return MANAGEMENT_ROLES.includes(role.toLowerCase().trim());
}