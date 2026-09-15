import type { RecruitmentStatus, SpokenLanguage } from "@prisma/client";

export type RosterAffiliation = {
  id: string;
  team: { id: string; name: string; language?: SpokenLanguage } | null;
};

export function affiliatedRoster(
  roster: RosterAffiliation[],
): { id: string; team: { id: string; name: string; language?: SpokenLanguage } }[] {
  return roster.flatMap((slot) =>
    slot.team ? [{ id: slot.id, team: slot.team }] : [],
  );
}

export function isLookingForTeam(
  recruitmentStatus: RecruitmentStatus,
  roster: RosterAffiliation[],
): boolean {
  return affiliatedRoster(roster).length === 0 && recruitmentStatus === "LOOKING";
}

export function recruitmentLabel(
  recruitmentStatus: RecruitmentStatus,
  roster: RosterAffiliation[],
): string {
  const teams = affiliatedRoster(roster);
  if (teams.length > 0) {
    return "En équipe";
  }
  return recruitmentStatus === "LOOKING"
    ? "Recherche d'équipe"
    : "Ne recherche pas";
}
