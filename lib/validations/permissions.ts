import { z } from "zod";
import { TEAM_GRANT_ROLES } from "@/lib/team-permissions";

export const teamPermissionGrantSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(TEAM_GRANT_ROLES),
  canEditOfficialSchedule: z.boolean(),
  canRecordScrim: z.boolean(),
  canProposeScrim: z.boolean(),
});

export const saveTeamPermissionsSchema = z.object({
  teamId: z.string().min(1, "Équipe requise"),
  grants: z.array(teamPermissionGrantSchema).max(40),
});
