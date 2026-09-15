export type RoleCapabilities = {
  role?: string | null;
  isManager?: boolean | null;
  isPlayer?: boolean | null;
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

/** @deprecated Use hasPlayerAccess — kept for existing imports. */
export function isPlayerRole(
  value: RoleCapabilities | string | null | undefined,
): boolean {
  return hasPlayerAccess(value);
}

export function homePathForRole(
  value: RoleCapabilities | string | null | undefined,
): string {
  const manager = canManageTeams(value);
  const player = hasPlayerAccess(value);
  if (manager) return "/manage";
  if (player) return "/profile";
  return "/";
}
