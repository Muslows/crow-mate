import type { PlayerRole } from "@prisma/client";
import { labelFor, PLAYER_ROLES } from "@/lib/constants";

const ROLE_TONE: Record<PlayerRole, string> = {
  TANK: "border-sky-800 bg-sky-950/50 text-sky-200",
  DPS_HITSCAN: "border-orange-800/70 bg-orange-950/40 text-orange-200",
  DPS_FLEX: "border-amber-800 bg-amber-950/50 text-amber-200",
  MAIN_SUPPORT: "border-lime-800 bg-lime-950/50 text-lime-200",
  FLEX_SUPPORT: "border-emerald-800 bg-emerald-950/50 text-emerald-200",
};

function RoleGlyph({ role }: { role: PlayerRole }) {
  if (role === "TANK") {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <path
          fill="currentColor"
          d="M8 1.5 14 4v4.2c0 3.3-2.5 5.6-6 6.8-3.5-1.2-6-3.5-6-6.8V4l6-2.5Z"
        />
      </svg>
    );
  }
  if (role === "DPS_HITSCAN") {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <circle cx="8" cy="8" r="2" fill="currentColor" />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          d="M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3"
        />
      </svg>
    );
  }
  if (role === "DPS_FLEX") {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <path
          fill="currentColor"
          d="M8 2 14 8 8 14 2 8 8 2Zm0 3.2L5.2 8 8 10.8 10.8 8 8 5.2Z"
        />
      </svg>
    );
  }
  if (role === "MAIN_SUPPORT") {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <path fill="currentColor" d="M7 1h2v5h5v2H9v7H7V8H2V6h5V1Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
      <path
        fill="currentColor"
        d="M8 1.8c1.4 1.6 3.7 2.6 6 2.7-.2 3.7-2.2 7-6 8.7-3.8-1.7-5.8-5-6-8.7 2.3-.1 4.6-1.1 6-2.7Z"
      />
    </svg>
  );
}

export function RoleBadge({
  role,
  compact = false,
}: {
  role: PlayerRole;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${ROLE_TONE[role]}`}
    >
      <RoleGlyph role={role} />
      {compact ? role.replaceAll("_", " ") : labelFor(PLAYER_ROLES, role)}
    </span>
  );
}
