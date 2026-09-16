import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function syncDanglingManagerRole(
  userId: string,
  options: { preserveOnboarding?: boolean } = {},
): Promise<{ demoted: boolean }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      isManager: true,
      isPlayer: true,
      _count: { select: { teams: true, teamSeats: true } },
    },
  });

  if (!user) return { demoted: false };
  if (isAdmin(user.id) || user.role === "ADMIN") return { demoted: false };
  if (!user.isManager && user.role !== "MANAGER") return { demoted: false };
  if (user._count.teams > 0 || user._count.teamSeats > 0) {
    return { demoted: false };
  }
  if (options.preserveOnboarding) return { demoted: false };

  await db.user.update({
    where: { id: user.id },
    data: {
      isManager: false,
      role: "PLAYER",
      isPlayer: true,
    },
  });

  const profile = await db.playerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) {
    await db.playerProfile.create({
      data: {
        userId: user.id,
        sr: 0,
        role: "TANK",
        favoriteHeroes: [],
        experience: "",
      },
    });
  }

  return { demoted: true };
}
