export const SETORES = [
  "Agricultura de Precisão",
  "Mecânica",
  "Elétrica",
  "Hidráulica",
  "Geral",
] as const;

export type Setor = (typeof SETORES)[number];