export type AffiliationModel = "INDEPENDENT" | "CLUB" | "STRUCTURE";

export type AffiliationInput = {
  orgId?: string | null;
  parentTeamId?: string | null;
  academyCount?: number;
};

export function affiliationModel(team: AffiliationInput): AffiliationModel {
  if (team.orgId) return "STRUCTURE";
  if (team.parentTeamId) return "CLUB";
  if ((team.academyCount ?? 0) > 0) return "CLUB";
  return "INDEPENDENT";
}

export function affiliationLabel(team: {
  orgName?: string | null;
  parentName?: string | null;
  name: string;
  orgId?: string | null;
  parentTeamId?: string | null;
  academyCount?: number;
}): string {
  const model = affiliationModel(team);
  if (model === "STRUCTURE") {
    return `Structure ${team.orgName?.trim() || ""}`.trim();
  }
  if (model === "CLUB") {
    const clubName = team.parentName?.trim() || team.name;
    return `Club ${clubName}`;
  }
  return "Indépendante";
}
