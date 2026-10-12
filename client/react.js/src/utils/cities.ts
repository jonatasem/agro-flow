export const CITIES = [
  "Lucélia - SP",
  "Adamantina - SP",
  "Salmourão - SP",
  "Dracena - SP",
] as const;

export type City = (typeof CITIES)[number];