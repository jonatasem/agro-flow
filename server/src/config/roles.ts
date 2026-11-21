export const MANAGEMENT_ROLES = [
  "lider",
  "gerente",
  "supervisor",
  "coa",
  "admin",
] as const;

export function normalizeRole(role?: string): string {
  if (!role) return "";

  return role
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function isManagement(role?: string): boolean {
  const normalizedRole = normalizeRole(role);
  return (MANAGEMENT_ROLES as readonly string[]).includes(normalizedRole);
}