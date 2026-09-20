import type { PlayerRole, RosterStatus, TeamFormat } from "@prisma/client";

export const STANDARD_ROSTER_CAP = 5;
export const STANDARD_LINEUP_SIZE = 5;

export const TEAM_FORMATS = [
  {
    value: "STANDARD_5V5" as const,
    label: "5v5 Standard",
    hint: "Roster principal limité à 5 joueurs, un par rôle de base.",
  },
  {
    value: "CUSTOM" as const,
    label: "Format libre",
    hint: "Idéal pour les structures et clubs. Recrutez un nombre illimité de joueurs, remplaçants et membres du staff, sans restriction de rôles.",
  },
] as const;

type RosterSlot = {
  id?: string;
  role: PlayerRole;
  status: RosterStatus;
};

export function lineupSizeForFormat(
  format: TeamFormat,
  rosterCount: number,
): number {
  if (format === "CUSTOM") {
    return Math.max(2, Math.min(STANDARD_LINEUP_SIZE, rosterCount || 2));
  }
  return STANDARD_LINEUP_SIZE;
}

export function standardRosterViolation(
  format: TeamFormat,
  players: RosterSlot[],
  incoming?: RosterSlot,
): string | null {
  if (format !== "STANDARD_5V5") return null;
  const next = incoming
    ? [
        ...players.filter((player) => player.id && player.id !== incoming.id),
        incoming,
      ]
    : players;
  if (next.length > STANDARD_ROSTER_CAP) {
    return `Le format 5v5 Standard est limité à ${STANDARD_ROSTER_CAP} joueurs. Passe l’équipe en Custom pour élargir le roster.`;
  }
  const starters = next.filter((player) => player.status === "STARTER");
  if (starters.length > STANDARD_ROSTER_CAP) {
    return "Le roster principal 5v5 est limité à 5 titulaires.";
  }
  const taken = new Set<PlayerRole>();
  for (const starter of starters) {
    if (taken.has(starter.role)) {
      return "En 5v5 Standard, un seul titulaire par rôle de base.";
    }
    taken.add(starter.role);
  }
  return null;
}
