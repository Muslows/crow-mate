export const PLATFORMS = [
  { value: "PC", label: "PC" },
  { value: "CONSOLE", label: "Console" },
  { value: "MIXED", label: "Mixte" },
] as const;

export const STAFF_ROLES = [
  { value: "COACH", label: "Coach" },
  { value: "ASSISTANT_COACH", label: "Assistant coach" },
  { value: "ANALYST", label: "Analyste" },
] as const;

export const STRUCTURES = [
  { value: "CLUB", label: "Club" },
  { value: "ASSOCIATION", label: "Association" },
] as const;

export const PLAYER_ROLES = [
  { value: "TANK", label: "Tank" },
  { value: "DPS_HITSCAN", label: "DPS Hitscan" },
  { value: "DPS_FLEX", label: "DPS Flex" },
  { value: "MAIN_SUPPORT", label: "Main Support" },
  { value: "FLEX_SUPPORT", label: "Flex Support" },
] as const;

export const OPEN_PLAY_ROLES = PLAYER_ROLES;

export const RANK_DIVISIONS = [
  { value: "UNRANKED", label: "Unranked" },
  { value: "BRONZE", label: "Bronze" },
  { value: "SILVER", label: "Silver" },
  { value: "GOLD", label: "Gold" },
  { value: "PLATINUM", label: "Platine" },
  { value: "EMERALD", label: "Émeraude" },
  { value: "DIAMOND", label: "Diamant" },
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

export const REPORT_REASONS = [
  { value: "TOXIC", label: "Toxique en jeu" },
  { value: "FAKE_PROFILE", label: "Faux profil" },
  { value: "WRONG_BATTLETAG", label: "BattleTag incorrect" },
  { value: "OTHER", label: "Autre" },
] as const;

export const SCRIM_MAP_POOLS = [
  { value: "OFFICIEL", label: "Officiel" },
  { value: "ALTERNATIVE", label: "Alternative" },
  { value: "LOOSERPICK", label: "Loser pick" },
  { value: "CUSTOM", label: "Custom" },
] as const;

export const SCRIM_LOBBY_HOSTS = [
  { value: "NOUS_UNIQUEMENT", label: "Nous uniquement" },
  { value: "PREFERENCE_NOUS", label: "Préférence nous" },
  { value: "PEU_IMPORTE", label: "Peu importe" },
  { value: "PREFERENCE_VOUS", label: "Préférence vous" },
  { value: "VOUS_UNIQUEMENT", label: "Vous uniquement" },
] as const;

export const SCRIM_CANCELLATION_REASONS = [
  { value: "ROSTER_UNAVAILABLE", label: "Imprévu de roster" },
  { value: "TECHNICAL_ISSUE", label: "Problème technique" },
  { value: "SCHEDULE_ERROR", label: "Erreur d’horaire" },
  { value: "OTHER", label: "Autre" },
] as const;

export const SPOKEN_LANGUAGES = [
  { value: "FR", label: "Français", iso: "fr" },
  { value: "EN", label: "Anglais", iso: "us" },
  { value: "DE", label: "Allemand", iso: "de" },
  { value: "ES", label: "Espagnol", iso: "es" },
  { value: "IT", label: "Italien", iso: "it" },
  { value: "PT", label: "Portugais", iso: "pt" },
  { value: "PL", label: "Polonais", iso: "pl" },
  { value: "RU", label: "Russe", iso: "ru" },
  { value: "KO", label: "Coréen", iso: "kr" },
  { value: "JA", label: "Japonais", iso: "jp" },
  { value: "ZH", label: "Chinois", iso: "cn" },
  { value: "NL", label: "Néerlandais", iso: "nl" },
  { value: "SV", label: "Suédois", iso: "se" },
  { value: "TR", label: "Turc", iso: "tr" },
  { value: "AR", label: "Arabe", iso: "sa" },
] as const;

export { OW_HEROES, OW_HERO_NAMES, findHero } from "@/lib/ow-heroes";

export function labelFor<T extends string>(
  items: readonly { value: T; label: string }[],
  value: T,
): string {
  return items.find((item) => item.value === value)?.label ?? value;
}
