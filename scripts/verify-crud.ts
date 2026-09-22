import { rosterStatusSchema } from "../lib/validations/player";
import { playerProfileSchema } from "../lib/validations/profile";
import { createTeamSchema, teamSchema } from "../lib/validations/team";
import { rankFromSr, snapSr, eloSearchBand } from "../lib/rank";
import { canManageTeams, canStartRecruitmentChat, hasCoachAccess, hasCasterAccess, hasPlayerAccess, hasStaffAccess, homePathForRole, isAdminRole } from "../lib/roles";
import { publicDisplayName, isBattleTagVisible } from "../lib/privacy";
import { casterProfileSchema, openTeamConversationSchema, sendChatMessageSchema } from "../lib/validations/chat";
import { reportSchema } from "../lib/validations/report";
import { structureSchema, structureTagSchema } from "../lib/validations/structure";
import { weeklyAvailabilitySchema, officialScheduleSchema } from "../lib/validations/availability";
import { scrimReportSchema } from "../lib/validations/scrim";
import {
  averageIntensity,
  intensityCaption,
} from "../lib/scrim-intensity";
import { generateScrimSummary } from "../lib/scrim-summary";
import { buildFairPlayIndex } from "../lib/fair-play";
import { commonMatchSlots, matchSlotsFromDays, srBand } from "../lib/scrim-slots";
import { affiliationModel } from "../lib/affiliation";
import { calculateScrimSuggestion } from "../lib/scrim-suggestion";
import {
  allowedWeekStarts,
  isMondayIso,
  parseWeekOffset,
  weekSnapshot,
  weekStartForOffset,
} from "../lib/week";

function main() {
  const badSr = rosterStatusSchema.safeParse({
    status: "STARTER",
    teamId: "",
  });
  if (badSr.success) {
    throw new Error("Expected missing team to fail roster status validation");
  }

  const goodPlayer = rosterStatusSchema.safeParse({
    status: "STARTER",
    teamId: "team_1",
  });
  if (!goodPlayer.success) {
    throw new Error("Expected valid roster player");
  }

  if (rankFromSr(0) !== "BRONZE") throw new Error("0 SR should be bronze");
  if (rankFromSr(999) !== "BRONZE") throw new Error("999 should be bronze");
  if (rankFromSr(1000) !== "SILVER") throw new Error("1000 should be silver");
  if (rankFromSr(1499) !== "SILVER") throw new Error("1499 should be silver");
  if (rankFromSr(1500) !== "GOLD") throw new Error("1500 should be gold");
  if (rankFromSr(2000) !== "PLATINUM") throw new Error("2000 should be platinum");
  if (rankFromSr(2500) !== "EMERALD") throw new Error("2500 should be emerald");
  if (rankFromSr(3000) !== "DIAMOND") throw new Error("3000 should be diamond");
  if (rankFromSr(3500) !== "MASTER") throw new Error("3500 should be master");
  if (rankFromSr(4000) !== "GRANDMASTER") throw new Error("4000 should be GM");
  if (rankFromSr(4500) !== "CHAMPION") throw new Error("4500 should be champion");
  if (rankFromSr(5000) !== "CHAMPION") throw new Error("5000 should be champion");
  if (snapSr(2010) !== 2000) throw new Error("2010 should snap to 2000");
  if (snapSr(2075) !== 2100) throw new Error("2075 should snap to 2100");

  const teamPayload = {
    name: "Script Titans",
    structure: "CLUB",
    platform: "PC",
    language: "FR",
    estimatedSr: "2000",
    format: "STANDARD_5V5",
    affiliationMode: "INDEPENDENT",
    affiliationId: "",
  };
  const goodTeam = teamSchema.safeParse(teamPayload);
  if (!goodTeam.success) {
    throw new Error("Expected valid team payload");
  }
  const captainTeam = createTeamSchema.safeParse({
    ...teamPayload,
    leadership: "CAPTAIN",
  });
  if (!captainTeam.success) {
    throw new Error("Expected valid captain team payload");
  }
  const customTeam = teamSchema.safeParse({
    ...teamPayload,
    format: "CUSTOM",
  });
  if (!customTeam.success) {
    throw new Error("Expected valid custom team payload");
  }
  const missingLeadership = createTeamSchema.safeParse(teamPayload);
  if (missingLeadership.success) {
    throw new Error("Team creation must require leadership");
  }

  const band = eloSearchBand(2000, 100);
  if (band.min !== 1900 || band.max !== 2100) {
    throw new Error("2000 ± 100 should be 1900–2100");
  }

  const profile = playerProfileSchema.safeParse({
    battleTag: "Rein#1234",
    sr: "3200",
    scrimEloTank: "3200",
    scrimEloDps: "3000",
    scrimEloSupport: "2800",
    biography: "Main tank scrim EU",
    openToPlay: ["TANK", "FLEX_SUPPORT"],
    favoriteHeroes: ["Reinhardt", "Winston", "Hazard", "Juno", "Kiriko"],
    languages: ["FR", "EN"],
    displayName: "Striker",
    experience: "Ex-OWL academy",
  });
  if (!profile.success) {
    throw new Error("Expected valid player profile");
  }
  const emptyTier = playerProfileSchema.safeParse({
    battleTag: "Cass#1234",
    sr: "3200",
    scrimEloTank: "0",
    scrimEloDps: "3200",
    scrimEloSupport: "0",
    openToPlay: ["DPS_HITSCAN"],
    favoriteHeroes: [],
    experience: "",
  });
  if (!emptyTier.success) {
    throw new Error("Expected empty hero tier list to pass");
  }
  const singleHero = playerProfileSchema.safeParse({
    battleTag: "Cass#1234",
    sr: "3200",
    scrimEloTank: "0",
    scrimEloDps: "3200",
    scrimEloSupport: "0",
    openToPlay: ["DPS_HITSCAN"],
    favoriteHeroes: ["Cassidy"],
    experience: "",
  });
  if (!singleHero.success) {
    throw new Error("Expected a single-hero tier list to pass");
  }
  const unknownRole = playerProfileSchema.safeParse({
    battleTag: "Cass#1234",
    sr: "3200",
    scrimEloTank: "0",
    scrimEloDps: "3200",
    scrimEloSupport: "0",
    openToPlay: ["DPS"],
    favoriteHeroes: [],
    experience: "",
  });
  if (unknownRole.success) {
    throw new Error("Expected legacy DPS role to fail");
  }

  const tag = structureTagSchema.safeParse("vit");
  if (!tag.success || tag.data !== "VIT") {
    throw new Error("Tag should uppercase to 2–5 letters");
  }
  const badTag = structureTagSchema.safeParse("V");
  if (badTag.success) throw new Error("1-letter tag should fail");
  const goodOrg = structureSchema.safeParse({
    name: "Team Vitality",
    tag: "vit",
    ownerId: "user_1",
  });
  if (!goodOrg.success) throw new Error("Expected valid structure payload");

  if (!canManageTeams({ role: "PLAYER", isManager: true })) {
    throw new Error("Hybrid player+manager should manage teams");
  }
  if (!hasPlayerAccess({ role: "MANAGER", isPlayer: true })) {
    throw new Error("Hybrid manager+player should access profile");
  }
  if (homePathForRole({ role: "PLAYER", isManager: true, isPlayer: true }) !== "/manage") {
    throw new Error("Hybrid home should prefer manager dashboard");
  }
  if (!isAdminRole({ isAdmin: true, role: "PLAYER" })) {
    throw new Error("Env admin flag should grant admin");
  }
  if (homePathForRole({ isAdmin: true, isPlayer: true }) !== "/admin") {
    throw new Error("Env admin home should be /admin");
  }
  if (homePathForRole({ role: "PLAYER", isPlayer: true }) !== "/profile") {
    throw new Error("Default player home should be /profile");
  }
  if (!hasCoachAccess({ isCoach: true, role: "PLAYER" })) {
    throw new Error("isCoach flag should grant coach access");
  }
  if (!hasCoachAccess({ openToCoach: "OPEN", role: "PLAYER" })) {
    throw new Error("Open to Coach should surface coach availability");
  }
  if (!hasCasterAccess({ isCaster: true })) {
    throw new Error("isCaster flag should grant caster access");
  }
  if (!hasCasterAccess({ openToCast: "OPEN" })) {
    throw new Error("Open to Cast should grant caster access");
  }
  if (!hasStaffAccess({ role: "STAFF" })) {
    throw new Error("STAFF role should grant staff access");
  }
  if (!canStartRecruitmentChat({ isManager: true })) {
    throw new Error("Manager should start recruitment chat");
  }
  if (canStartRecruitmentChat({ isPlayer: true, isCoach: true })) {
    throw new Error("Coach-only should not open recruiter threads");
  }
  if (publicDisplayName({ displayName: "", name: "Loic" }) !== "Loic") {
    throw new Error("Public handle should ignore empty display name");
  }
  const chatOk = sendChatMessageSchema.safeParse({
    conversationId: "c1",
    body: "Dispo 20h toute la semaine",
  });
  if (!chatOk.success) throw new Error("Expected valid chat message");
  const chatEmpty = sendChatMessageSchema.safeParse({
    conversationId: "c1",
    body: "   ",
  });
  if (chatEmpty.success) throw new Error("Blank chat message should fail");
  const casterOk = casterProfileSchema.safeParse({
    streamUrl: "https://twitch.tv/demo",
    vodUrl: "",
    eventsNote: "OWL 2026",
  });
  if (!casterOk.success) throw new Error("Expected valid caster profile");
  const teamChat = openTeamConversationSchema.safeParse({ teamId: "team_1" });
  if (!teamChat.success) throw new Error("Expected valid team conversation payload");
  const reportOk = reportSchema.safeParse({
    targetType: "PLAYER",
    targetId: "profile_1",
    reason: "TOXIC",
    details: "",
  });
  if (!reportOk.success) throw new Error("Expected valid report");
  const reportBad = reportSchema.safeParse({
    targetType: "PLAYER",
    targetId: "profile_1",
    reason: "SPAM",
    details: "",
  });
  if (reportBad.success) throw new Error("Unknown report reason should fail");

  const weekOk = weeklyAvailabilitySchema.safeParse({
    weekStartDate: "2026-09-14",
    mondaySlots: ["slot-20"],
    tuesdaySlots: ["slot-21"],
    wednesdaySlots: [],
    thursdaySlots: [],
    fridaySlots: ["slot-20", "slot-21"],
    saturdaySlots: [],
    sundaySlots: ["slot-21"],
  });
  if (!weekOk.success) throw new Error("Expected valid weekly availability");
  const weekBad = weeklyAvailabilitySchema.safeParse({
    weekStartDate: "not-a-date",
    mondaySlots: ["slot-20"],
  });
  if (weekBad.success) throw new Error("Unknown availability state should fail");
  if (!isMondayIso("2026-09-14")) throw new Error("2026-09-14 is a Monday");
  if (isMondayIso("2026-09-15")) throw new Error("2026-09-15 is not a Monday");

  const sundayParis = new Date("2026-09-20T12:00:00.000Z");
  const sundaySnap = weekSnapshot(sundayParis);
  if (!sundaySnap.isSunday) throw new Error("20 Sep 2026 should be Sunday in Paris");
  if (parseWeekOffset(undefined, sundayParis) !== 1) {
    throw new Error("Sunday should default to next week");
  }
  const mondayParis = new Date("2026-09-21T10:00:00.000Z");
  if (parseWeekOffset(undefined, mondayParis) !== 0) {
    throw new Error("Monday should default to current week");
  }
  const [current, next] = allowedWeekStarts(mondayParis);
  if (current !== "2026-09-21" || next !== "2026-09-28") {
    throw new Error(`Unexpected week bounds ${current} ${next}`);
  }
  if (weekStartForOffset(1, mondayParis) !== "2026-09-28") {
    throw new Error("N+1 should be 2026-09-28");
  }

  const slots20 = [{ id: "s20", label: "20h - 22h" }, { id: "s21", label: "21h - 23h" }];
  const five20 = calculateScrimSuggestion(Array(5).fill(["s20"]), slots20);
  if (five20.kind !== "RECOMMENDED") throw new Error("5x 20h should recommend");
  const five21 = calculateScrimSuggestion(Array(5).fill(["s21"]), slots20);
  if (five21.kind !== "RECOMMENDED" || five21.bestSlotId !== "s21") {
    throw new Error("5x 21h should recommend 21h");
  }
  const mix21 = calculateScrimSuggestion(
    [["s20"], ["s20"], ["s21"], ["s21"], ["s21"]],
    slots20,
  );
  if (mix21.bestSlotId !== "s21") throw new Error("3 at 21h should win the count");
  const needSub = calculateScrimSuggestion(
    [["s20"], ["s21"], ["s21"], ["s21"], []],
    slots20,
  );
  if (needSub.kind !== "NEED_SUB") throw new Error("3 available should need a sub");
  const cancelled = calculateScrimSuggestion([["s20"], ["s21"], []], slots20);
  if (cancelled.kind !== "NO_SCRIM") throw new Error("2 available should cancel");
  const six20beats21 = calculateScrimSuggestion(
    [...Array(6).fill(["s20"]), ["s21"]],
    slots20,
  );
  if (six20beats21.bestSlotId !== "s20") {
    throw new Error("6 at 20h should prefer 20h over 21h");
  }
  const customTrio = calculateScrimSuggestion(Array(3).fill(["s20"]), slots20, {
    lineupSize: 3,
  });
  if (customTrio.kind !== "RECOMMENDED") {
    throw new Error("Custom 3-stack at 20h should recommend");
  }

  const officialOk = officialScheduleSchema.safeParse({
    teamId: "team_1",
    weekStartDate: "2026-09-14",
    monday: "SCRIM_20H",
    tuesday: "SCRIM_21H",
    wednesday: "VOD_REVIEW",
    thursday: "TOURNOI",
    friday: "NONE",
    saturday: "NONE",
    sunday: "NONE",
  });
  if (!officialOk.success) throw new Error("Expected valid official schedule");
  const customMissing = officialScheduleSchema.safeParse({
    teamId: "team_1",
    weekStartDate: "2026-09-14",
    monday: "CUSTOM",
    tuesday: "NONE",
    wednesday: "NONE",
    thursday: "NONE",
    friday: "NONE",
    saturday: "NONE",
    sunday: "NONE",
    mondayNote: "",
  });
  if (customMissing.success) {
    throw new Error("CUSTOM without label should fail");
  }
  const customOk = officialScheduleSchema.safeParse({
    teamId: "team_1",
    weekStartDate: "2026-09-14",
    monday: "CUSTOM",
    tuesday: "NONE",
    wednesday: "NONE",
    thursday: "NONE",
    friday: "NONE",
    saturday: "NONE",
    sunday: "NONE",
    mondayNote: "Review OWL",
  });
  if (!customOk.success) throw new Error("Expected CUSTOM with label to pass");
  const customTooLong = officialScheduleSchema.safeParse({
    teamId: "team_1",
    weekStartDate: "2026-09-14",
    monday: "CUSTOM",
    tuesday: "NONE",
    wednesday: "NONE",
    thursday: "NONE",
    friday: "NONE",
    saturday: "NONE",
    sunday: "NONE",
    mondayNote: "x".repeat(51),
  });
  if (customTooLong.success) {
    throw new Error("Custom label over 50 chars should fail");
  }

  if (affiliationModel({ orgId: "s1" }) !== "STRUCTURE") {
    throw new Error("orgId should map to STRUCTURE");
  }
  if (affiliationModel({ parentTeamId: "t1" }) !== "CLUB") {
    throw new Error("parentTeamId should map to CLUB");
  }
  if (affiliationModel({ academyCount: 2 }) !== "CLUB") {
    throw new Error("academy parent should map to CLUB");
  }
  if (affiliationModel({}) !== "INDEPENDENT") {
    throw new Error("empty affiliation should be independent");
  }

  if (
    isBattleTagVisible({
      battleTagPublic: false,
      viewerId: "manager",
      ownerUserId: "player",
    })
  ) {
    throw new Error("Private BattleTag must stay hidden from third parties");
  }
  if (
    !isBattleTagVisible({
      battleTagPublic: true,
      viewerId: null,
      ownerUserId: "player",
    })
  ) {
    throw new Error("Public BattleTag must be visible to everyone");
  }

  const scrimOk = scrimReportSchema.safeParse({
    teamId: "team_1",
    opponentNameInput: "Team Liquid",
    opponentSrInput: "3200",
    opponentBehavior: "COURTOIS",
    playedAt: "2026-09-16",
    maps: [
      { mapName: "Ilios", outcome: "WIN", intensity: 1 },
      { mapName: "King's Row", outcome: "LOSS", intensity: 3 },
    ],
  });
  if (!scrimOk.success) throw new Error("Expected valid scrim report");
  const scrimLinked = scrimReportSchema.safeParse({
    teamId: "team_1",
    opponentTeamId: "team_2",
    opponentBehavior: "BON",
    maps: [{ mapName: "Ilios", outcome: "WIN", intensity: 2 }],
  });
  if (!scrimLinked.success) throw new Error("Expected linked opponent scrim");
  const scrimBadNote = scrimReportSchema.safeParse({
    teamId: "team_1",
    opponentNameInput: "Team Liquid",
    opponentBehavior: "BON",
    maps: [{ mapName: "Ilios", outcome: "WIN", intensity: 5 }],
  });
  if (scrimBadNote.success) {
    throw new Error("Intensity 5 should fail");
  }
  const scrimNoOpponent = scrimReportSchema.safeParse({
    teamId: "team_1",
    opponentBehavior: "BON",
    maps: [{ mapName: "Ilios", outcome: "WIN", intensity: 2 }],
  });
  if (scrimNoOpponent.success) {
    throw new Error("Scrim without opponent should fail");
  }
  const scrimNoBehavior = scrimReportSchema.safeParse({
    teamId: "team_1",
    opponentNameInput: "Team Liquid",
    maps: [{ mapName: "Ilios", outcome: "WIN", intensity: 2 }],
  });
  if (scrimNoBehavior.success) {
    throw new Error("Scrim without opponent behavior should fail");
  }
  if (intensityCaption("WIN", 1) !== "Victoire écrasante") {
    throw new Error("WIN 1 caption");
  }
  if (intensityCaption("LOSS", 3) !== "Défaite serrée") {
    throw new Error("LOSS 3 caption");
  }
  if (averageIntensity([1, 3]) !== 2) {
    throw new Error("Average intensity should be 2");
  }
  const crushing = generateScrimSummary([
    { outcome: "WIN", intensity: 1 },
    { outcome: "WIN", intensity: 1 },
    { outcome: "WIN", intensity: 1 },
  ]);
  if (crushing?.kind !== "CRUSHING_WIN") {
    throw new Error("Three crushing wins should summarize as crushing");
  }
  const closeLoss = generateScrimSummary([
    { outcome: "LOSS", intensity: 3 },
    { outcome: "LOSS", intensity: 3 },
    { outcome: "LOSS", intensity: 3 },
  ]);
  if (closeLoss?.kind !== "CLOSE_LOSS") {
    throw new Error("Three close losses should summarize as close loss");
  }
  const fair = buildFairPlayIndex({
    COURTOIS: 2,
    BON: 0,
    PEU_AGREABLE: 0,
    TOXIQUE_OU_TROLL: 0,
  });
  if (fair.trend !== "COURTOIS" || fair.average !== 4) {
    throw new Error("Two courtois ratings should yield courtois index");
  }
  const slots = matchSlotsFromDays({
    monday: "SCRIM_21H",
    tuesday: "NONE",
    wednesday: "SCRIM_20H",
    thursday: "VOD_REVIEW",
    friday: "NONE",
    saturday: "NONE",
    sunday: "NONE",
  });
  if (slots.join(",") !== "monday:1260-1380,wednesday:1200-1320") {
    throw new Error("Match slots should keep 20h/21h official windows");
  }
  const overlap = commonMatchSlots(slots, ["monday:21", "friday:20"]);
  if (overlap.join(",") !== "monday:1260-1380") {
    throw new Error("Common slots intersection failed");
  }
  const srMatchBand = srBand(2500, 200);
  if (srMatchBand.min !== 2300 || srMatchBand.max !== 2700) {
    throw new Error("SR band 2500±200 should be 2300-2700");
  }

  console.log("Validation roster + rank + profil + hybrid + planning OK");
}

main();
