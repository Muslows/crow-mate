import { db } from "@/lib/db";
import { publicDisplayName } from "@/lib/privacy";

export async function getReportsForAdmin() {
  return db.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      targetType: true,
      reason: true,
      details: true,
      createdAt: true,
      reporter: {
        select: {
          id: true,
          name: true,
          playerProfile: { select: { displayName: true } },
        },
      },
      targetUser: {
        select: {
          id: true,
          name: true,
          playerProfile: { select: { id: true, displayName: true } },
        },
      },
      team: { select: { id: true, name: true } },
    },
  });
}

export function reportTargetLabel(report: {
  targetType: "PLAYER" | "TEAM";
  targetUser: {
    name: string;
    playerProfile: { displayName: string } | null;
  } | null;
  team: { name: string } | null;
}): string {
  if (report.targetType === "TEAM") {
    return report.team?.name ?? "Équipe supprimée";
  }
  if (!report.targetUser) return "Joueur introuvable";
  return publicDisplayName({
    displayName: report.targetUser.playerProfile?.displayName,
    name: report.targetUser.name,
  });
}
