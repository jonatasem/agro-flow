export const CITIES = [
  "Lucélia - SP",
  "Adamantina - SP",
  "Salmourão - SP",
  "Dracena - SP",
] as const;

// Tipo TypeScript derivado automaticamente dos valores da constante CITIES
export type City = (typeof CITIES)[number];