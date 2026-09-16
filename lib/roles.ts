export type RoleCapabilities = {
  role?: string | null;
  isManager?: boolean | null;
  isPlayer?: boolean | null;
  isCoach?: boolean | null;
  isCaster?: boolean | null;
  isStaff?: boolean | null;
  openToCast?: string | null;
  openToCoach?: string | null;
  /** Rempli côté serveur via `isAdmin(user.id)` — ne pas lire l'env dans le client. */
  isAdmin?: boolean | null;
};

function asCapabilities(
  value: RoleCapabilities | string | null | undefined,
): RoleCapabilities {
  if (typeof value === "string") return { role: value };
  return value ?? {};
}

export function canManageTeams(
  value: RoleCapabilities | string | null | undefined,
): boolean {
  const caps = asCapabilities(value);
  if (caps.isAdmin) return true;
  if (caps.role === "ADMIN") return true;
  if (typeof caps.isManager === "boolean") return caps.isManager;
  return caps.role === "MANAGER";
}

export function hasPlayerAccess(
  value: RoleCapabilities | string | null | undefined,
): boolean {
  const caps = asCapabilities(value);
  if (typeof caps.isPlayer === "boolean") return caps.isPlayer;
  return caps.role === "PLAYER";
}

export function hasCoachAccess(
  value: RoleCapabilities | string | null | undefined,
): boolean {
  const caps = asCapabilities(value);
  if (caps.isCoach) return true;
  if (caps.openToCoach === "OPEN") return true;
  return caps.role === "COACH";
}

export function hasOfficialCoachRole(
  value: RoleCapabilities | string | null | undefined,
): boolean {
  const caps = asCapabilities(value);
  return Boolean(caps.isCoach) || caps.role === "COACH";
}

export function hasCasterAccess(
  value: RoleCapabilities | string | null | undefined,
): boolean {
  const caps = asCapabilities(value);
  if (caps.isCaster) return true;
  if (caps.openToCast === "OPEN") return true;
  return caps.role === "CASTER";
}

export function hasStaffAccess(
  value: RoleCapabilities | string | null | undefined,
): boolean {
  const caps = asCapabilities(value);
  if (caps.isStaff) return true;
  return caps.role === "STAFF";
}

/** Recruteur : manager d'équipe ou staff structure autorisé. */
export function canStartRecruitmentChat(
  value: RoleCapabilities | string | null | undefined,
): boolean {
  const caps = asCapabilities(value);
  if (caps.isAdmin || caps.role === "ADMIN") return true;
  return canManageTeams(caps) || hasStaffAccess(caps);
}

/** Candidat contactable : joueur ou coach. */
export function canBeRecruited(
  value: RoleCapabilities | string | null | undefined,
): boolean {
  const caps = asCapabilities(value);
  return hasPlayerAccess(caps) || hasCoachAccess(caps);
}

/** @deprecated Use hasPlayerAccess — kept for existing imports. */
export function isPlayerRole(
  value: RoleCapabilities | string | null | undefined,
): boolean {
  return hasPlayerAccess(value);
}

export function isAdminRole(
  value: RoleCapabilities | string | null | undefined,
): boolean {
  const caps = asCapabilities(value);
  if (caps.isAdmin) return true;
  return caps.role === "ADMIN";
}

export function homePathForRole(
  value: RoleCapabilities | string | null | undefined,
): string {
  const caps = asCapabilities(value);
  if (caps.isAdmin || caps.role === "ADMIN") return "/admin";
  const manager = canManageTeams(value);
  const staff = hasStaffAccess(value);
  const player = hasPlayerAccess(value);
  if (manager) return "/manage";
  if (staff) return "/org";
  if (player || hasCoachAccess(value) || hasCasterAccess(value)) return "/profile";
  return "/";
}
