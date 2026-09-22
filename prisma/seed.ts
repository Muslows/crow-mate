import { hashPassword } from "better-auth/crypto";
import {
  type OfficialScrimSlot,
  type PlayerRole,
  type Prisma,
  type UserRole,
} from "@prisma/client";
import { db } from "../lib/db";
import { rankFromSr } from "../lib/rank";
import { matchSlotsFromDays } from "../lib/scrim-slots";
import { isoToUtcDate, weekStartForOffset } from "../lib/week";

const SEED_PASSWORD = "TestPass1!";
const PROVIDER = "credential";

type SeedUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isManager?: boolean;
  isPlayer?: boolean;
  isCoach?: boolean;
  isStaff?: boolean;
  openToCoach?: "OPEN" | "CLOSED";
};

type SeedPlayer = {
  id: string;
  userId: string;
  teamId: string | null;
  name: string;
  battleTag: string;
  role: PlayerRole;
  sr: number;
  heroes: string[];
  experience: string;
  looking?: boolean;
};

function log(step: string, detail?: string) {
  if (detail) {
    console.log(`[seed] ${step} — ${detail}`);
    return;
  }
  console.log(`[seed] ${step}`);
}

type DbClient = Prisma.TransactionClient | typeof db;

async function upsertCredentialUser(
  tx: DbClient,
  user: SeedUser,
  passwordHash: string,
): Promise<string> {
  const existing = await tx.user.findUnique({
    where: { email: user.email },
    select: { id: true },
  });
  const userId = existing?.id ?? user.id;
  await tx.user.upsert({
    where: { email: user.email },
    create: {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: true,
      role: user.role,
      isManager: user.isManager ?? false,
      isPlayer: user.isPlayer ?? true,
      isCoach: user.isCoach ?? false,
      isCaster: false,
      isStaff: user.isStaff ?? false,
      openToCast: "CLOSED",
      openToCoach: user.openToCoach ?? "CLOSED",
    },
    update: {
      name: user.name,
      role: user.role,
      isManager: user.isManager ?? false,
      isPlayer: user.isPlayer ?? true,
      isCoach: user.isCoach ?? false,
      isStaff: user.isStaff ?? false,
      openToCoach: user.openToCoach ?? "CLOSED",
    },
  });

  const account = await tx.account.findFirst({
    where: { userId, providerId: PROVIDER },
    select: { id: true },
  });
  if (account) {
    await tx.account.update({
      where: { id: account.id },
      data: { password: passwordHash, accountId: userId },
    });
    return userId;
  }
  await tx.account.create({
    data: {
      id: `seed_acc_${userId}`,
      accountId: userId,
      providerId: PROVIDER,
      userId,
      password: passwordHash,
    },
  });
  return userId;
}

async function upsertPlayerProfile(
  tx: DbClient,
  player: SeedPlayer,
): Promise<string> {
  const profile = await tx.playerProfile.upsert({
    where: { userId: player.userId },
    create: {
      id: `seed_prof_${player.userId}`,
      userId: player.userId,
      battleTag: player.battleTag,
      sr: player.sr,
      role: player.role,
      favoriteHeroes: player.heroes,
      experience: player.experience,
      recruitmentStatus: player.looking ? "LOOKING" : "NOT_LOOKING",
      languages: ["FR", "EN"],
      displayName: player.name,
      openToPlay: player.looking || !player.teamId ? [player.role] : [],
      battleTagPublic: true,
    },
    update: {
      battleTag: player.battleTag,
      sr: player.sr,
      role: player.role,
      favoriteHeroes: player.heroes,
      experience: player.experience,
      recruitmentStatus: player.looking ? "LOOKING" : "NOT_LOOKING",
      displayName: player.name,
      openToPlay: player.looking || !player.teamId ? [player.role] : [],
      battleTagPublic: true,
    },
  });
  return profile.id;
}

async function upsertRosterPlayer(
  tx: DbClient,
  player: SeedPlayer,
): Promise<void> {
  await tx.player.upsert({
    where: { id: player.id },
    create: {
      id: player.id,
      battleTag: player.battleTag,
      role: player.role,
      sr: player.sr,
      rankDivision: rankFromSr(player.sr),
      status: "STARTER",
      favoriteHeroes: player.heroes,
      experience: player.experience,
      teamId: player.teamId,
      userId: player.userId,
    },
    update: {
      battleTag: player.battleTag,
      role: player.role,
      sr: player.sr,
      rankDivision: rankFromSr(player.sr),
      status: "STARTER",
      favoriteHeroes: player.heroes,
      experience: player.experience,
      teamId: player.teamId,
      userId: player.userId,
    },
  });
}

const EMPTY_OFFICIAL: Record<
  "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
  OfficialScrimSlot
> = {
  monday: "NONE",
  tuesday: "NONE",
  wednesday: "NONE",
  thursday: "NONE",
  friday: "NONE",
  saturday: "NONE",
  sunday: "NONE",
};

const EMPTY_SLOT_WEEK: Record<
  "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
  string[]
> = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

type WeekDays = keyof typeof EMPTY_OFFICIAL;

async function wipeAppData(tx: DbClient) {
  log("Reset", "truncate de toutes les tables applicatives");
  await tx.$executeRawUnsafe(`
    TRUNCATE TABLE
      "ChatMessage",
      "Conversation",
      "Report",
      "ScrimMapResult",
      "Scrim",
      "ScrimProposal",
      "WeeklyAvailability",
      "OfficialSchedule",
      "TeamTimeSlot",
      "TeamInvitation",
      "StructureInvitation",
      "ClubInvitation",
      "TeamPermission",
      "TeamCoach",
      "TeamMembership",
      "TeamSeat",
      "StructureStaff",
      "Player",
      "PlayerProfile",
      "CasterProfile",
      "Team",
      "Structure",
      "session",
      "account",
      "verification",
      "user"
    RESTART IDENTITY CASCADE
  `);
}

function officialWeek(
  slots: Partial<Record<WeekDays, OfficialScrimSlot>>,
): Record<WeekDays, OfficialScrimSlot> {
  return { ...EMPTY_OFFICIAL, ...slots };
}

function playerWeek(
  ids: { s20: string; s21: string },
  picks: Partial<Record<WeekDays, "20" | "21" | "both">>,
): Record<WeekDays, string[]> {
  const next = { ...EMPTY_SLOT_WEEK };
  for (const [day, pick] of Object.entries(picks) as [WeekDays, "20" | "21" | "both"][]) {
    next[day] =
      pick === "both" ? [ids.s20, ids.s21] : pick === "20" ? [ids.s20] : [ids.s21];
  }
  return next;
}

function toAvailabilityPayload(days: Record<WeekDays, string[]>) {
  return {
    mondaySlots: days.monday,
    tuesdaySlots: days.tuesday,
    wednesdaySlots: days.wednesday,
    thursdaySlots: days.thursday,
    fridaySlots: days.friday,
    saturdaySlots: days.saturday,
    sundaySlots: days.sunday,
  };
}

async function main() {
  log("Démarrage du seed QA (base vidée puis rejouée)");
  const passwordHash = await hashPassword(SEED_PASSWORD);

  const users: SeedUser[] = [
    {
      id: "seed_u_eclipse_owner",
      email: "eclipse.owner@ow-manager.local",
      name: "Mira Voss",
      role: "MANAGER",
      isManager: true,
      isPlayer: false,
    },
    {
      id: "seed_u_nova_owner",
      email: "nova.owner@ow-manager.local",
      name: "Kaito Ren",
      role: "MANAGER",
      isManager: true,
      isPlayer: false,
    },
    {
      id: "seed_u_wolves_mgr",
      email: "wolves.manager@ow-manager.local",
      name: "Lina Holt",
      role: "MANAGER",
      isManager: true,
      isPlayer: false,
    },
    {
      id: "seed_u_coach_eclipse",
      email: "coach.eclipse@ow-manager.local",
      name: "Coach Brant",
      role: "COACH",
      isPlayer: false,
      isCoach: true,
      isStaff: true,
    },
    {
      id: "seed_u_coach_nova",
      email: "coach.nova@ow-manager.local",
      name: "Coach Yuna",
      role: "COACH",
      isPlayer: false,
      isCoach: true,
      isStaff: true,
    },
    {
      id: "seed_u_coach_open",
      email: "coach.open@ow-manager.local",
      name: "Coach Idris",
      role: "COACH",
      isPlayer: false,
      isCoach: true,
      openToCoach: "OPEN",
    },
  ];

  const roles: PlayerRole[] = [
    "TANK",
    "DPS_HITSCAN",
    "DPS_FLEX",
    "MAIN_SUPPORT",
    "FLEX_SUPPORT",
  ];

  const rosterBlueprints: {
    teamKey: "prime" | "nova" | "academy" | "wolves";
    teamId: string;
    sr: number;
    players: { nick: string; tag: string; heroes: string[] }[];
  }[] = [
    {
      teamKey: "prime",
      teamId: "seed_team_eclipse_prime",
      sr: 2600,
      players: [
        { nick: "Bastionline", tag: "Bastionline#2187", heroes: ["Reinhardt", "Winston", "Sigma"] },
        { nick: "Ashefall", tag: "Ashefall#4410", heroes: ["Ashe", "Soldier: 76", "Widowmaker"] },
        { nick: "Genjinx", tag: "Genjinx#9021", heroes: ["Genji", "Tracer", "Sojourn"] },
        { nick: "JunoPulse", tag: "JunoPulse#3304", heroes: ["Juno", "Mercy", "Kiriko"] },
        { nick: "LucioWave", tag: "LucioWave#7742", heroes: ["Lúcio", "Kiriko", "Juno"] },
      ],
    },
    {
      teamKey: "nova",
      teamId: "seed_team_nova_core",
      sr: 3200,
      players: [
        { nick: "RamattraX", tag: "RamattraX#1502", heroes: ["Ramattra", "D.Va", "Winston"] },
        { nick: "CassidyLaw", tag: "CassidyLaw#8801", heroes: ["Cassidy", "Ashe", "Sojourn"] },
        { nick: "EchoDrift", tag: "EchoDrift#2199", heroes: ["Echo", "Genji", "Pharah"] },
        { nick: "AnaScope", tag: "AnaScope#6408", heroes: ["Ana", "Baptiste", "Kiriko"] },
        { nick: "KiriFox", tag: "KiriFox#5113", heroes: ["Kiriko", "Juno", "Lúcio"] },
      ],
    },
    {
      teamKey: "academy",
      teamId: "seed_team_eclipse_academy",
      sr: 2400,
      players: [
        { nick: "OrisaWall", tag: "OrisaWall#1024", heroes: ["Orisa", "Reinhardt", "Mauga"] },
        { nick: "SoldierNine", tag: "SoldierNine#7603", heroes: ["Soldier: 76", "Ashe", "Cassidy"] },
        { nick: "ReaperNight", tag: "ReaperNight#4488", heroes: ["Reaper", "Genji", "Venture"] },
        { nick: "MercyLift", tag: "MercyLift#2210", heroes: ["Mercy", "Juno", "Illari"] },
        { nick: "BrigShield", tag: "BrigShield#3901", heroes: ["Brigitte", "Lúcio", "Kiriko"] },
      ],
    },
    {
      teamKey: "wolves",
      teamId: "seed_team_lone_wolves",
      sr: 1800,
      players: [
        { nick: "HogHook", tag: "HogHook#6677", heroes: ["Roadhog", "Zarya", "Junker Queen"] },
        { nick: "WidowLane", tag: "WidowLane#1840", heroes: ["Widowmaker", "Ashe", "Hanzo"] },
        { nick: "Junkspin", tag: "Junkspin#9090", heroes: ["Junkrat", "Pharah", "Torbjörn"] },
        { nick: "BapNade", tag: "BapNade#5551", heroes: ["Baptiste", "Ana", "Illari"] },
        { nick: "ZenOrb", tag: "ZenOrb#4242", heroes: ["Zenyatta", "Lúcio", "Juno"] },
      ],
    },
  ];

  const rosterPlayers: SeedPlayer[] = rosterBlueprints.flatMap((team, teamIndex) =>
    team.players.map((player, index) => ({
      id: `seed_pl_${team.teamKey}_${roles[index]}`,
      userId: `seed_u_${team.teamKey}_${roles[index].toLowerCase()}`,
      teamId: team.teamId,
      name: player.nick,
      battleTag: player.tag,
      role: roles[index]!,
      sr: team.sr + (index - 2) * 25,
      heroes: player.heroes,
      experience: teamIndex === 3 ? "Mixte ranked / tournois campus" : "Circuit scrim EU",
    })),
  );

  const freeAgents: SeedPlayer[] = [
    {
      id: "seed_pl_free_tank",
      userId: "seed_u_free_tank",
      teamId: null,
      name: "QueenRiot",
      battleTag: "QueenRiot#1337",
      role: "TANK",
      sr: 2550,
      heroes: ["Junker Queen", "Winston", "D.Va"],
      experience: "Ex-academy, cherche main roster",
      looking: true,
    },
    {
      id: "seed_pl_free_hitscan",
      userId: "seed_u_free_hitscan",
      teamId: null,
      name: "SojournArc",
      battleTag: "SojournArc#2048",
      role: "DPS_HITSCAN",
      sr: 2700,
      heroes: ["Sojourn", "Ashe", "Cassidy"],
      experience: "Open to play hitscan",
      looking: true,
    },
    {
      id: "seed_pl_free_flex",
      userId: "seed_u_free_flex",
      teamId: null,
      name: "KiriMist",
      battleTag: "KiriMist#7777",
      role: "FLEX_SUPPORT",
      sr: 2450,
      heroes: ["Kiriko", "Juno", "Lúcio"],
      experience: "Disponible en flex support",
      looking: true,
    },
  ];

  const playerUsers: SeedUser[] = [...rosterPlayers, ...freeAgents].map((player) => ({
    id: player.userId,
    email: `${player.userId.replace("seed_u_", "").replaceAll("_", ".")}@ow-manager.local`,
    name: player.name,
    role: "PLAYER",
    isPlayer: true,
  }));

  await db.$transaction(
    async (tx) => {
      await wipeAppData(tx);
      const idMap = new Map<string, string>();
      for (const user of [...users, ...playerUsers]) {
        const actualId = await upsertCredentialUser(tx, user, passwordHash);
        idMap.set(user.id, actualId);
      }
      const uid = (planned: string) => idMap.get(planned) ?? planned;
      log(
        "Utilisateurs",
        `${users.length + playerUsers.length} comptes (mdp ${SEED_PASSWORD})`,
      );

      await tx.structure.upsert({
        where: { tag: "ECL" },
        create: {
          id: "seed_org_eclipse",
          name: "Eclipse Esports",
          tag: "ECL",
          ownerId: uid("seed_u_eclipse_owner"),
        },
        update: {
          name: "Eclipse Esports",
          ownerId: uid("seed_u_eclipse_owner"),
        },
      });
      await tx.structure.upsert({
        where: { tag: "NOVA" },
        create: {
          id: "seed_org_nova",
          name: "Nova Syndicate",
          tag: "NOVA",
          ownerId: uid("seed_u_nova_owner"),
        },
        update: {
          name: "Nova Syndicate",
          ownerId: uid("seed_u_nova_owner"),
        },
      });
      log("Structures", "Eclipse Esports (ECL) + Nova Syndicate (NOVA)");

      const teams: Prisma.TeamUpsertArgs[] = [
        {
          where: { id: "seed_team_eclipse_prime" },
          create: {
            id: "seed_team_eclipse_prime",
            name: "Eclipse Prime",
            structure: "ASSOCIATION",
            platform: "PC",
            language: "FR",
            estimatedSr: 2600,
            managerId: uid("seed_u_eclipse_owner"),
            leadership: "MANAGER",
            orgId: "seed_org_eclipse",
          },
          update: {
            name: "Eclipse Prime",
            estimatedSr: 2600,
            managerId: uid("seed_u_eclipse_owner"),
            orgId: "seed_org_eclipse",
            parentTeamId: null,
          },
        },
        {
          where: { id: "seed_team_nova_core" },
          create: {
            id: "seed_team_nova_core",
            name: "Nova Core",
            structure: "ASSOCIATION",
            platform: "PC",
            language: "EN",
            estimatedSr: 3200,
            managerId: uid("seed_u_nova_owner"),
            leadership: "MANAGER",
            orgId: "seed_org_nova",
          },
          update: {
            name: "Nova Core",
            estimatedSr: 3200,
            managerId: uid("seed_u_nova_owner"),
            orgId: "seed_org_nova",
          },
        },
        {
          where: { id: "seed_team_eclipse_academy" },
          create: {
            id: "seed_team_eclipse_academy",
            name: "Eclipse Academy",
            structure: "CLUB",
            platform: "PC",
            language: "FR",
            estimatedSr: 2400,
            managerId: uid("seed_u_eclipse_owner"),
            leadership: "CAPTAIN",
            parentTeamId: "seed_team_eclipse_prime",
          },
          update: {
            name: "Eclipse Academy",
            estimatedSr: 2400,
            managerId: uid("seed_u_eclipse_owner"),
            parentTeamId: "seed_team_eclipse_prime",
            orgId: null,
          },
        },
        {
          where: { id: "seed_team_lone_wolves" },
          create: {
            id: "seed_team_lone_wolves",
            name: "Lone Wolves",
            structure: "CLUB",
            platform: "PC",
            language: "FR",
            estimatedSr: 1800,
            managerId: uid("seed_u_wolves_mgr"),
            leadership: "MANAGER",
            orgId: null,
            parentTeamId: null,
          },
          update: {
            name: "Lone Wolves",
            estimatedSr: 1800,
            managerId: uid("seed_u_wolves_mgr"),
            orgId: null,
            parentTeamId: null,
          },
        },
      ];

      for (const team of teams) {
        await tx.team.upsert(team);
        const teamId = team.where.id;
        if (!teamId) continue;
        await tx.teamTimeSlot.upsert({
          where: { id: `tts20_${teamId}` },
          create: {
            id: `tts20_${teamId}`,
            teamId,
            label: "20h - 22h",
            startTime: "20:00",
            endTime: "22:00",
            sortOrder: 0,
          },
          update: {},
        });
        await tx.teamTimeSlot.upsert({
          where: { id: `tts21_${teamId}` },
          create: {
            id: `tts21_${teamId}`,
            teamId,
            label: "21h - 23h",
            startTime: "21:00",
            endTime: "23:00",
            sortOrder: 1,
          },
          update: {},
        });
      }
      const managerSeats: { teamId: string; userId: string }[] = [
        { teamId: "seed_team_eclipse_prime", userId: uid("seed_u_eclipse_owner") },
        { teamId: "seed_team_eclipse_academy", userId: uid("seed_u_eclipse_owner") },
        { teamId: "seed_team_nova_core", userId: uid("seed_u_nova_owner") },
        { teamId: "seed_team_lone_wolves", userId: uid("seed_u_wolves_mgr") },
      ];
      for (const seat of managerSeats) {
        await tx.teamSeat.upsert({
          where: {
            teamId_userId: { teamId: seat.teamId, userId: seat.userId },
          },
          create: { teamId: seat.teamId, userId: seat.userId, kind: "PRIMARY" },
          update: { kind: "PRIMARY" },
        });
      }
      log(
        "Équipes",
        "Prime 2600 (ECL), Nova 3200 (NOVA), Academy 2400 (club), Wolves 1800 (indépendante)",
      );

      await tx.structureStaff.upsert({
        where: {
          structureId_userId: {
            structureId: "seed_org_eclipse",
            userId: uid("seed_u_coach_eclipse"),
          },
        },
        create: {
          structureId: "seed_org_eclipse",
          userId: uid("seed_u_coach_eclipse"),
          role: "COACH",
        },
        update: { role: "COACH" },
      });
      await tx.structureStaff.upsert({
        where: {
          structureId_userId: {
            structureId: "seed_org_nova",
            userId: uid("seed_u_coach_nova"),
          },
        },
        create: {
          structureId: "seed_org_nova",
          userId: uid("seed_u_coach_nova"),
          role: "COACH",
        },
        update: { role: "COACH" },
      });

      await tx.teamCoach.upsert({
        where: {
          teamId_userId: {
            teamId: "seed_team_eclipse_prime",
            userId: uid("seed_u_coach_eclipse"),
          },
        },
        create: {
          teamId: "seed_team_eclipse_prime",
          userId: uid("seed_u_coach_eclipse"),
        },
        update: {},
      });
      await tx.teamCoach.upsert({
        where: {
          teamId_userId: {
            teamId: "seed_team_nova_core",
            userId: uid("seed_u_coach_nova"),
          },
        },
        create: {
          teamId: "seed_team_nova_core",
          userId: uid("seed_u_coach_nova"),
        },
        update: {},
      });

      await tx.teamPermission.upsert({
        where: {
          teamId_userId: {
            teamId: "seed_team_eclipse_prime",
            userId: uid("seed_u_coach_eclipse"),
          },
        },
        create: {
          teamId: "seed_team_eclipse_prime",
          userId: uid("seed_u_coach_eclipse"),
          role: "COACH",
          canEditOfficialSchedule: true,
          canRecordScrim: true,
          canProposeScrim: true,
        },
        update: {
          canEditOfficialSchedule: true,
          canRecordScrim: true,
          canProposeScrim: true,
        },
      });
      await tx.teamPermission.upsert({
        where: {
          teamId_userId: {
            teamId: "seed_team_nova_core",
            userId: uid("seed_u_coach_nova"),
          },
        },
        create: {
          teamId: "seed_team_nova_core",
          userId: uid("seed_u_coach_nova"),
          role: "COACH",
          canEditOfficialSchedule: true,
          canRecordScrim: true,
          canProposeScrim: false,
        },
        update: {
          canEditOfficialSchedule: true,
          canRecordScrim: true,
          canProposeScrim: false,
        },
      });
      log("Staff", "2 coachs rattachés + 1 coach open to coach");

      for (const player of [...rosterPlayers, ...freeAgents]) {
        const mapped: SeedPlayer = {
          ...player,
          userId: uid(player.userId),
        };
        await upsertPlayerProfile(tx, mapped);
        await upsertRosterPlayer(tx, mapped);
      }
      log(
        "Joueurs",
        `${rosterPlayers.length} titulaires + ${freeAgents.length} free agents`,
      );

      const weekStarts = [weekStartForOffset(0), weekStartForOffset(1)];

      const officialByTeam: Record<
        string,
        [Record<WeekDays, OfficialScrimSlot>, Record<WeekDays, OfficialScrimSlot>]
      > = {
        seed_team_eclipse_prime: [
          officialWeek({
            tuesday: "SCRIM_21H",
            thursday: "SCRIM_20H",
            sunday: "VOD_REVIEW",
          }),
          officialWeek({
            tuesday: "SCRIM_21H",
            thursday: "SCRIM_20H",
            saturday: "TOURNOI",
          }),
        ],
        seed_team_eclipse_academy: [
          officialWeek({ tuesday: "SCRIM_20H", thursday: "SCRIM_21H" }),
          officialWeek({
            tuesday: "SCRIM_20H",
            thursday: "SCRIM_21H",
            sunday: "VOD_REVIEW",
          }),
        ],
        seed_team_nova_core: [
          officialWeek({
            wednesday: "SCRIM_21H",
            friday: "SCRIM_20H",
            saturday: "TOURNOI",
          }),
          officialWeek({ wednesday: "SCRIM_21H", friday: "SCRIM_20H" }),
        ],
        seed_team_lone_wolves: [
          officialWeek({ wednesday: "SCRIM_20H", saturday: "SCRIM_21H" }),
          officialWeek({
            wednesday: "SCRIM_20H",
            saturday: "SCRIM_21H",
            sunday: "CUSTOM",
          }),
        ],
      };

      for (const [weekIndex, weekStartIso] of weekStarts.entries()) {
        const weekStartDate = isoToUtcDate(weekStartIso);
        for (const [teamId, weeks] of Object.entries(officialByTeam)) {
          const days = weeks[weekIndex]!;
          await tx.officialSchedule.upsert({
            where: { teamId_weekStartDate: { teamId, weekStartDate } },
            create: {
              teamId,
              weekStartDate,
              ...days,
              sundayNote:
                teamId === "seed_team_lone_wolves" && weekIndex === 1
                  ? "Custom interne 21h"
                  : "",
              matchSlots: matchSlotsFromDays(days),
            },
            update: {
              ...days,
              sundayNote:
                teamId === "seed_team_lone_wolves" && weekIndex === 1
                  ? "Custom interne 21h"
                  : "",
              matchSlots: matchSlotsFromDays(days),
            },
          });
        }
      }
      log(
        "Plannings officiels",
        `4 équipes × ${weekStarts.length} semaines (${weekStarts.join(" / ")})`,
      );

      const availabilityByTeam: Record<string, Record<WeekDays, string[]>> = {
        seed_team_eclipse_prime: playerWeek(
          { s20: "tts20_seed_team_eclipse_prime", s21: "tts21_seed_team_eclipse_prime" },
          { tuesday: "21", thursday: "20", sunday: "20" },
        ),
        seed_team_eclipse_academy: playerWeek(
          { s20: "tts20_seed_team_eclipse_academy", s21: "tts21_seed_team_eclipse_academy" },
          { tuesday: "20", thursday: "21" },
        ),
        seed_team_nova_core: playerWeek(
          { s20: "tts20_seed_team_nova_core", s21: "tts21_seed_team_nova_core" },
          { wednesday: "21", friday: "20", saturday: "20" },
        ),
        seed_team_lone_wolves: playerWeek(
          { s20: "tts20_seed_team_lone_wolves", s21: "tts21_seed_team_lone_wolves" },
          { wednesday: "20", saturday: "21" },
        ),
      };

      const freeWeek = playerWeek(
        { s20: "tts20_seed_team_eclipse_prime", s21: "tts21_seed_team_eclipse_prime" },
        { monday: "20", tuesday: "21", thursday: "20" },
      );

      const allSeedPlayers = [...rosterPlayers, ...freeAgents];
      const profiles = await tx.playerProfile.findMany({
        where: {
          userId: { in: allSeedPlayers.map((player) => uid(player.userId)) },
        },
        select: { id: true, userId: true },
      });
      const profileByUserId = new Map(
        profiles.map((profile) => [profile.userId, profile.id]),
      );

      for (const [weekIndex, weekStartIso] of weekStarts.entries()) {
        const weekStartDate = isoToUtcDate(weekStartIso);
        for (const [playerIndex, player] of allSeedPlayers.entries()) {
          const profileId = profileByUserId.get(uid(player.userId));
          if (!profileId) continue;
          const base = player.teamId
            ? availabilityByTeam[player.teamId]!
            : freeWeek;
          const days = { ...base };
          const roleIndex = playerIndex % 5;
          const s20 = player.teamId
            ? `tts20_${player.teamId}`
            : "tts20_seed_team_eclipse_prime";
          if (roleIndex === 2) days.monday = [s20];
          if (roleIndex === 4) days.friday = [];
          if (weekIndex === 1 && roleIndex === 0) days.sunday = [];
          const payload = toAvailabilityPayload(days);
          await tx.weeklyAvailability.upsert({
            where: {
              playerId_weekStartDate: { playerId: profileId, weekStartDate },
            },
            create: { playerId: profileId, weekStartDate, ...payload },
            update: payload,
          });
        }
      }
      log(
        "Disponibilités joueurs",
        `${profiles.length} profils × ${weekStarts.length} semaines`,
      );
    },
    { maxWait: 10_000, timeout: 120_000 },
  );

  console.log("");
  console.log("Comptes de test (mot de passe commun : TestPass1!)");
  for (const user of users) {
    console.log(`  ${user.email.padEnd(36)} ${user.name} (${user.role})`);
  }
  console.log("  … + 23 comptes joueurs *.@ow-manager.local");
  log("Terminé");
}

main()
  .catch((error) => {
    console.error("[seed] Échec", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
