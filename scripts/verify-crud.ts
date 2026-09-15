import { playerSchema } from "../lib/validations/player";
import { playerProfileSchema } from "../lib/validations/profile";
import { teamSchema } from "../lib/validations/team";
import { rankFromSr, snapSr } from "../lib/rank";
import { canManageTeams, hasPlayerAccess, homePathForRole } from "../lib/roles";

function main() {
  const badSr = playerSchema.safeParse({
    battleTag: "Genji#1234",
    role: "DPS",
    secondaryRole: "",
    sr: "abc",
    status: "STARTER",
    teamId: "team_1",
    favoriteHeroes: [],
    experience: "",
  });
  if (badSr.success) {
    throw new Error("Expected non-numeric SR to fail validation");
  }

  const goodPlayer = playerSchema.safeParse({
    battleTag: "Genji#1234",
    role: "DPS",
    secondaryRole: "SUPPORT",
    sr: "2050",
    status: "STARTER",
    teamId: "team_1",
    favoriteHeroes: [
      "Genji",
      "Tracer",
      "Sojourn",
      "Reinhardt",
      "Ana",
    ],
    experience: "Contenders",
  });
  if (!goodPlayer.success) {
    throw new Error("Expected valid roster player");
  }

  if (rankFromSr(0) !== "UNRANKED") throw new Error("0 SR should be unranked");
  if (rankFromSr(1200) !== "BRONZE") throw new Error("1200 should be bronze");
  if (rankFromSr(1800) !== "SILVER") throw new Error("1800 should be silver");
  if (rankFromSr(2200) !== "GOLD") throw new Error("2200 should be gold");
  if (rankFromSr(2700) !== "PLATINUM") throw new Error("2700 should be platinum");
  if (rankFromSr(3200) !== "DIAMOND") throw new Error("3200 should be diamond");
  if (rankFromSr(3700) !== "MASTER") throw new Error("3700 should be master");
  if (rankFromSr(4200) !== "GRANDMASTER") throw new Error("4200 should be GM");
  if (rankFromSr(4800) !== "CHAMPION") throw new Error("4800 should be champion");
  if (snapSr(2010) !== 2000) throw new Error("2010 should snap to 2000");
  if (snapSr(2075) !== 2100) throw new Error("2075 should snap to 2100");

  const goodTeam = teamSchema.safeParse({
    name: "Script Titans",
    structure: "CLUB",
    platform: "PC",
    language: "FR",
  });
  if (!goodTeam.success) {
    throw new Error("Expected valid team payload");
  }

  const profile = playerProfileSchema.safeParse({
    battleTag: "Rein#1234",
    sr: "3200",
    primaryRole: "TANK",
    secondaryRole: "SUPPORT",
    favoriteHeroes: ["Reinhardt", "Winston", "Hazard", "Juno", "Kiriko"],
    languages: ["FR", "EN"],
    experience: "Ex-OWL academy",
  });
  if (!profile.success) {
    throw new Error("Expected valid player profile");
  }

  const tooFewHeroes = playerProfileSchema.safeParse({
    battleTag: "Rein#1234",
    sr: "3200",
    primaryRole: "TANK",
    secondaryRole: "SUPPORT",
    favoriteHeroes: ["Reinhardt", "Winston", "Ana"],
    experience: "",
  });
  if (tooFewHeroes.success) {
    throw new Error("Expected fewer than 5 heroes to fail");
  }

  const tooManyTanks = playerProfileSchema.safeParse({
    battleTag: "Rein#1234",
    sr: "3200",
    primaryRole: "TANK",
    secondaryRole: "",
    favoriteHeroes: [
      "Reinhardt",
      "Winston",
      "D.Va",
      "Orisa",
      "Sigma",
      "Zarya",
    ],
    experience: "",
  });
  if (tooManyTanks.success) {
    throw new Error("Expected more than 5 tanks to fail");
  }

  if (!canManageTeams({ role: "PLAYER", isManager: true })) {
    throw new Error("Hybrid player+manager should manage teams");
  }
  if (!hasPlayerAccess({ role: "MANAGER", isPlayer: true })) {
    throw new Error("Hybrid manager+player should access profile");
  }
  if (homePathForRole({ role: "PLAYER", isManager: true, isPlayer: true }) !== "/manage") {
    throw new Error("Hybrid home should prefer manager dashboard");
  }

  console.log("Validation roster + rank + profil + hybrid OK");
}

main();
