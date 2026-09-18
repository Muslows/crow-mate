import Link from "next/link";
import type { TeamLeadership } from "@prisma/client";
import { publicDisplayName } from "@/lib/privacy";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const LEADERSHIP_LABEL: Record<TeamLeadership, string> = {
  MANAGER: "Manager",
  CAPTAIN: "Capitaine",
};

export function TeamManagerCard({
  leadership,
  manager,
}: {
  leadership: TeamLeadership;
  manager: {
    name: string;
    image: string | null;
    playerProfile: { id: string; displayName: string | null } | null;
  };
}) {
  const displayName = publicDisplayName({
    displayName: manager.playerProfile?.displayName,
    name: manager.name,
  });
  const profileId = manager.playerProfile?.id;
  const roleLabel = LEADERSHIP_LABEL[leadership];

  const body = (
    <div className="flex items-center gap-3">
      {manager.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={manager.image}
          alt=""
          className="h-12 w-12 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-950/40 text-sm font-semibold text-orange-200"
        >
          {initials(displayName) || "OW"}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-500">{roleLabel}</p>
        <p className="truncate font-semibold text-foreground">{displayName}</p>
      </div>
    </div>
  );

  if (!profileId) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-4">
        {body}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <Link
        href={`/players/${profileId}`}
        className="block rounded-xl outline-offset-4 transition hover:bg-zinc-800/50"
      >
        {body}
        <p className="mt-2 text-xs text-zinc-500">Voir le profil public</p>
      </Link>
    </section>
  );
}
