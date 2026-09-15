export const PLATFORMS = [
  { value: "PC", label: "PC" },
  { value: "CONSOLE", label: "Console" },
  { value: "MIXED", label: "Mixte" },
] as const;

export const STRUCTURES = [
  { value: "CLUB", label: "Club" },
  { value: "ASSOCIATION", label: "Association" },
] as const;

export const PLAYER_ROLES = [
  { value: "TANK", label: "Tank" },
  { value: "DPS", label: "DPS" },
  { value: "SUPPORT", label: "Support" },
] as const;

export const RANK_DIVISIONS = [
  { value: "UNRANKED", label: "Unranked" },
  { value: "BRONZE", label: "Bronze" },
  { value: "SILVER", label: "Silver" },
  { value: "GOLD", label: "Gold" },
  { value: "PLATINUM", label: "Platinum" },
  { value: "DIAMOND", label: "Diamond" },
  { value: "MASTER", label: "Master" },
  { value: "GRANDMASTER", label: "Grandmaster" },
  { value: "CHAMPION", label: "Champion" },
] as const;

export const ROSTER_STATUSES = [
  { value: "STARTER", label: "Titulaire" },
  { value: "SUBSTITUTE", label: "Remplaçant" },
  { value: "TRIAL", label: "À l'essai" },
] as const;

export const RECRUITMENT_STATUSES = [
  { value: "LOOKING", label: "Recherche d'équipe" },
  { value: "NOT_LOOKING", label: "Ne recherche pas" },
] as const;

export const SPOKEN_LANGUAGES = [
  { value: "FR", label: "Français" },
  { value: "EN", label: "Anglais" },
  { value: "DE", label: "Allemand" },
  { value: "ES", label: "Espagnol" },
  { value: "IT", label: "Italien" },
  { value: "PT", label: "Portugais" },
  { value: "PL", label: "Polonais" },
  { value: "RU", label: "Russe" },
  { value: "KO", label: "Coréen" },
  { value: "JA", label: "Japonais" },
  { value: "ZH", label: "Chinois" },
  { value: "NL", label: "Néerlandais" },
  { value: "SV", label: "Suédois" },
  { value: "TR", label: "Turc" },
  { value: "AR", label: "Arabe" },
] as const;

export { OW_HEROES, OW_HERO_NAMES, findHero } from "@/lib/ow-heroes";

export function labelFor<T extends string>(
  items: readonly { value: T; label: string }[],
  value: T,
): string {
  return items.find((item) => item.value === value)?.label ?? value;
}
