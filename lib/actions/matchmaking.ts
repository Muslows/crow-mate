"use server";

import { canProposeTeamScrim } from "@/lib/access";
import { findScrimMatches } from "@/lib/data/scrim-match";
import { isValidTolerance } from "@/lib/scrim-slots";
import { requireAuthSession } from "@/lib/session";

export async function searchScrimMatches(input: {
  teamId: string;
  weekStartIso: string;
  tolerance: number;
}) {
  const session = await requireAuthSession();
  const allowed = await canProposeTeamScrim(input.teamId, session.user.id);
  if (!allowed) {
    return {
      estimatedSr: 0,
      band: { min: 0, max: 0 },
      ourSlots: [],
      matches: [],
    };
  }

  const tolerance = isValidTolerance(input.tolerance) ? input.tolerance : 200;
  return findScrimMatches({
    teamId: input.teamId,
    weekStartIso: input.weekStartIso,
    tolerance,
  });
}
