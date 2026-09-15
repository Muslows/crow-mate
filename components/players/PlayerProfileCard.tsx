import type { ReactNode } from "react";
import { AffiliatedTeamCard } from "@/components/players/AffiliatedTeamCard";
import { CopyPlayerIdButton } from "@/components/players/CopyPlayerIdButton";
import { LanguageBadges } from "@/components/languages/LanguageBadges";
import { HeroTierList } from "@/components/players/HeroTierList";
import { Panel } from "@/components/ui/Panel";
import { RankBadge } from "@/components/ui/RankBadge";
import { labelFor, PLAYER_ROLES } from "@/lib/constants";
import { rankFromSr } from "@/lib/rank";
import type { PlayerRole, RecruitmentStatus, SpokenLanguage } from "@prisma/client";
import type { RosterAffiliation } from "@/lib/recruitment";
import { affiliatedRoster, recruitmentLabel } from "@/lib/recruitment";

export type ProfileCardData = {
  id: string;
  battleTag: string;
  sr: number;
  primaryRole: PlayerRole;
  secondaryRole: PlayerRole | null;
  favoriteHeroes: string[];
  experience: string;
  recruitmentStatus: RecruitmentStatus;
  languages: SpokenLanguage[];
  user: { name: string; rosterSlots?: RosterAffiliation[] };
};

export function PlayerProfileCard({
  profile,
  actions,
  showCopyId = false,
}: {
  profile: ProfileCardData;
  actions?: ReactNode;
  showCopyId?: boolean;
}) {
  const displayTag = profile.battleTag || profile.user.name;
  const teams = affiliatedRoster(profile.user.rosterSlots ?? []);

  return (
    <div className="relative flex flex-col gap-8">
      <div className="pointer-events-none absolute inset-x-0 -top-4 h-48 bg-gradient-to-b from-orange-500/10 to-transparent" />
      <header className="flex flex-col gap-6 border border-cyan-400/20 bg-black/40 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-orange-300">
            Player card · ID {profile.id}
          </p>
          <h1 className="mt-3 font-mono text-4xl tracking-wide text-cyan-100 sm:text-5xl">
            {displayTag}
          </h1>
          <p className="mt-2 text-zinc-400">{profile.user.name}</p>
          <p className="mt-3 font-mono text-lg text-zinc-400">{profile.sr} SR</p>
          <p className="mt-2 text-sm uppercase tracking-[0.16em] text-orange-300">
            {recruitmentLabel(
              profile.recruitmentStatus,
              profile.user.rosterSlots ?? [],
            )}
          </p>
          <div className="mt-3">
            <LanguageBadges languages={profile.languages} />
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <RankBadge sr={profile.sr} rank={rankFromSr(profile.sr)} />
          {actions}
        </div>
      </header>
      {teams.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm uppercase tracking-[0.16em] text-cyan-400">
            Équipe
          </h2>
          {teams.map((slot) => (
            <AffiliatedTeamCard key={slot.id} team={slot.team} />
          ))}
        </section>
      ) : null}
      <section className="grid gap-4 sm:grid-cols-2">
        <Panel>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            Rôle principal
          </p>
          <p className="mt-2 text-xl uppercase">
            {labelFor(PLAYER_ROLES, profile.primaryRole)}
          </p>
        </Panel>
        <Panel>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            Rôle secondaire
          </p>
          <p className="mt-2 text-xl uppercase">
            {profile.secondaryRole
              ? labelFor(PLAYER_ROLES, profile.secondaryRole)
              : "—"}
          </p>
        </Panel>
      </section>
      <Panel>
        <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-400">
          Tier list
        </h2>
        <HeroTierList heroes={profile.favoriteHeroes} />
      </Panel>
      <Panel>
        <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-400">
          Expérience
        </h2>
        {profile.experience.trim() ? (
          <p className="whitespace-pre-wrap text-zinc-200">{profile.experience}</p>
        ) : (
          <p className="text-sm text-zinc-400">Aucune expérience publiée.</p>
        )}
      </Panel>
      <p className="mt-2 inline-flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-500">
        Player ID{" "}
        <span className="text-cyan-400">{profile.id}</span>
        {showCopyId ? <CopyPlayerIdButton playerId={profile.id} /> : null}
      </p>
    </div>
  );
}
