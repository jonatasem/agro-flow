// Lista fixa com os setores operacionais disponíveis no sistema
export const SETORES = [
  "Agricultura de Precisão",
  "Mecânica",
  "Elétrica",
  "Hidráulica",
  "Geral",
] as const;

// Tipo TypeScript derivado automaticamente dos valores da constante SETORES
export type Setor = (typeof SETORES)[number];