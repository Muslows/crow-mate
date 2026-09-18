import Link from "next/link";
import { labelFor, PLATFORMS } from "@/lib/constants";
import type { LegalForm, Platform, SpokenLanguage } from "@prisma/client";
import { FairPlayBadge } from "@/components/ui/FairPlayBadge";
import { emptyFairPlayIndex, type FairPlayIndex } from "@/lib/fair-play";
import { teamDisplayName } from "@/lib/team-name";

type TeamCardProps = {
  id: string;
  name: string;
  platform: Platform;
  structure: LegalForm;
  language: SpokenLanguage;
  estimatedSr: number;
  orgTag?: string | null;
  orgId?: string | null;
  orgName?: string | null;
  parentTeamId?: string | null;
  parentName?: string | null;
  academyCount?: number;
  fairPlay?: FairPlayIndex;
};

export function TeamCard({
  id,
  name,
  platform,
  estimatedSr,
  orgTag,
  fairPlay = emptyFairPlayIndex(),
}: TeamCardProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Link href={`/teams/${id}`} className="hud-card hud-card-hover block p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-950/40 text-sm font-semibold text-orange-200">
          {initials || "OW"}
        </span>
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-foreground">
            {teamDisplayName(name, orgTag)}
          </h2>
          <p className="text-sm text-zinc-500">
            {labelFor(PLATFORMS, platform)}
            {estimatedSr > 0 ? ` · ${estimatedSr} SR` : ""}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <FairPlayBadge index={fairPlay} />
      </div>
    </Link>
  );
}
