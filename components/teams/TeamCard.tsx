import Link from "next/link";
import { labelFor, PLATFORMS, STRUCTURES } from "@/lib/constants";
import type { LegalForm, Platform, SpokenLanguage } from "@prisma/client";
import { AffiliationBadge } from "@/components/teams/AffiliationBadge";
import { LanguageBadges } from "@/components/languages/LanguageBadges";
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
  structure,
  language,
  estimatedSr,
  orgTag,
  orgId,
  orgName,
  parentTeamId,
  parentName,
  academyCount = 0,
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
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400/30 to-cyan-400/20 text-sm font-bold tracking-[0.12em] text-orange-100"
        >
          {initials || "OW"}
        </span>
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cyan-400">
            {labelFor(PLATFORMS, platform)} · {labelFor(STRUCTURES, structure)}
          </p>
          <h2 className="mt-1 truncate text-xl font-bold uppercase tracking-wide">
            {teamDisplayName(name, orgTag)}
          </h2>
        </div>
      </div>
      <div className="mt-3">
        <AffiliationBadge
          name={name}
          orgId={orgId}
          orgName={orgName}
          parentTeamId={parentTeamId}
          parentName={parentName}
          academyCount={academyCount}
        />
      </div>
      <p className="mt-2 text-sm text-zinc-400">
        {estimatedSr <= 0
          ? "Niveau estimé à définir"
          : `Niveau estimé ${estimatedSr} SR`}
      </p>
      <div className="mt-3">
        <LanguageBadges languages={[language]} />
      </div>
      <div className="mt-4">
        <FairPlayBadge index={fairPlay} />
      </div>
    </Link>
  );
}
