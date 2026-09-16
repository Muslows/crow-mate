import { db } from "@/lib/db";

export async function getStructuresForAdmin() {
  return db.structure.findMany({
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { teams: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStructureById(id: string) {
  return db.structure.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      teams: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          platform: true,
          estimatedSr: true,
          manager: { select: { name: true } },
        },
      },
    },
  });
}

export async function getOwnedStructures(userId: string) {
  return db.structure.findMany({
    where: { ownerId: userId },
    include: {
      teams: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          platform: true,
          estimatedSr: true,
          manager: { select: { name: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getOwnedStructure(
  structureId: string,
  userId: string,
  isAdmin: boolean,
) {
  return db.structure.findFirst({
    where: isAdmin
      ? { id: structureId }
      : { id: structureId, ownerId: userId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      invitations: {
        where: { status: "PENDING" },
        select: {
          id: true,
          createdAt: true,
          requestedByTeam: true,
          team: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      staff: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      teams: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          platform: true,
          estimatedSr: true,
          managerId: true,
          manager: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function getStructureWorkspace(
  structureId: string,
  userId: string,
  isAdmin: boolean,
) {
  const owned = await getOwnedStructure(structureId, userId, isAdmin);
  if (owned) return { structure: owned, canManage: true as const };

  const staff = await db.structureStaff.findFirst({
    where: { structureId, userId },
    select: { role: true },
  });
  if (!staff) return null;

  const structure = await getOwnedStructure(structureId, userId, true);
  if (!structure) return null;
  return { structure, canManage: false as const, staffRole: staff.role };
}

export async function getAccessibleStructures(userId: string) {
  const [owned, staff] = await Promise.all([
    getOwnedStructures(userId),
    db.structureStaff.findMany({
      where: { userId },
      select: {
        role: true,
        structure: {
          include: {
            teams: {
              orderBy: { name: "asc" },
              select: {
                id: true,
                name: true,
                platform: true,
                estimatedSr: true,
                manager: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  const byId = new Map(owned.map((item) => [item.id, { ...item, staffRole: null as string | null }]));
  for (const row of staff) {
    if (!byId.has(row.structure.id)) {
      byId.set(row.structure.id, { ...row.structure, staffRole: row.role });
    }
  }
  return [...byId.values()];
}

export async function getPendingStructureRequestsForOwner(userId: string) {
  return db.structureInvitation.findMany({
    where: {
      status: "PENDING",
      requestedByTeam: true,
      structure: { ownerId: userId },
    },
    include: {
      structure: { select: { id: true, name: true, tag: true } },
      team: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingClubInvitesForManager(userId: string) {
  return db.clubInvitation.findMany({
    where: {
      status: "PENDING",
      parentTeam: { managerId: userId },
    },
    include: {
      parentTeam: { select: { id: true, name: true } },
      childTeam: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingStructureInvitesForManager(userId: string) {
  return db.structureInvitation.findMany({
    where: {
      status: "PENDING",
      requestedByTeam: false,
      team: { managerId: userId },
    },
    include: {
      structure: { select: { id: true, name: true, tag: true } },
      team: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function countPendingStructureInvitesForManager(userId: string) {
  return db.structureInvitation.count({
    where: {
      status: "PENDING",
      team: { managerId: userId },
    },
  });
}

export async function searchAttachableTeams(query: string, orgId: string) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  return db.team.findMany({
    where: {
      OR: [
        { id: trimmed },
        { name: { contains: trimmed, mode: "insensitive" } },
      ],
      NOT: { orgId },
    },
    select: {
      id: true,
      name: true,
      platform: true,
      org: { select: { tag: true } },
    },
    take: 12,
    orderBy: { name: "asc" },
  });
}

export async function listUsersForOwnerPicker() {
  return db.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
    take: 200,
  });
}
