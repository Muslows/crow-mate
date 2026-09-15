import Link from "next/link";
import { labelFor, PLATFORMS, STRUCTURES } from "@/lib/constants";
import type { Platform, SpokenLanguage, Structure } from "@prisma/client";
import { LanguageBadges } from "@/components/languages/LanguageBadges";
import { Panel } from "@/components/ui/Panel";

type TeamCardProps = {
  id: string;
  name: string;
  platform: Platform;
  structure: Structure;
  language: SpokenLanguage;
  averageSr: number | null;
};

export function TeamCard({
  id,
  name,
  platform,
  structure,
  language,
  averageSr,
}: TeamCardProps) {
  return (
    <Link href={`/teams/${id}`} className="block">
      <Panel className="h-full transition hover:border-orange-400/50">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-400">
          {labelFor(PLATFORMS, platform)}
        </p>
        <h2 className="mt-2 text-xl font-semibold uppercase tracking-wide">{name}</h2>
        <p className="mt-2 text-sm text-zinc-400">
          {labelFor(STRUCTURES, structure)} ·{" "}
          {averageSr === null ? "SR à définir" : `${averageSr} SR`}
        </p>
        <div className="mt-3">
          <LanguageBadges languages={[language]} tone="orange" />
        </div>
      </Panel>
    </Link>
  );
}
