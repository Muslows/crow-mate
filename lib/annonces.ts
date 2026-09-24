export const ANNONCE_VUES = ["scrims", "lft", "lfp"] as const;

export type AnnonceVue = (typeof ANNONCE_VUES)[number];

export function parseAnnonceVue(value?: string): AnnonceVue {
  if (value === "lft" || value === "recherche") return "lft";
  if (value === "lfp" || value === "postes") return "lfp";
  return "scrims";
}
