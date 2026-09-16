import { db } from "@/lib/db";

export async function getDiscoveryPulse() {
  const [playersOpen, teamsRecruiting] = await Promise.all([
    db.playerProfile.count({
      where: { recruitmentStatus: "LOOKING" },
    }),
    db.team.count({
      where: { players: { some: { status: "TRIAL" } } },
    }),
  ]);
  return { playersOpen, teamsRecruiting };
}
