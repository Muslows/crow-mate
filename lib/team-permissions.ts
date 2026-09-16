export const TEAM_GRANT_ROLES = [
  "COACH",
  "ASSISTANT_COACH",
  "CAPTAIN",
] as const;

export type TeamGrantRole = (typeof TEAM_GRANT_ROLES)[number];

export const TEAM_PERMISSION_FLAGS = [
  "canEditOfficialSchedule",
  "canRecordScrim",
  "canProposeScrim",
] as const;

export type TeamPermissionFlag = (typeof TEAM_PERMISSION_FLAGS)[number];

export type TeamPermissionMatrix = Record<TeamPermissionFlag, boolean>;

export const GRANT_ROLE_LABELS: Record<TeamGrantRole, string> = {
  COACH: "Coach",
  ASSISTANT_COACH: "Assistant coach",
  CAPTAIN: "Capitaine",
};

export const PERMISSION_FLAG_LABELS: Record<TeamPermissionFlag, string> = {
  canEditOfficialSchedule: "Modifier le planning officiel",
  canRecordScrim: "Ajouter / valider un rapport de scrim",
  canProposeScrim: "Proposer un scrim à une équipe adverse",
};

export const DEFAULT_GRANTS: Record<TeamGrantRole, TeamPermissionMatrix> = {
  COACH: {
    canEditOfficialSchedule: true,
    canRecordScrim: true,
    canProposeScrim: false,
  },
  ASSISTANT_COACH: {
    canEditOfficialSchedule: false,
    canRecordScrim: false,
    canProposeScrim: false,
  },
  CAPTAIN: {
    canEditOfficialSchedule: false,
    canRecordScrim: true,
    canProposeScrim: true,
  },
};
