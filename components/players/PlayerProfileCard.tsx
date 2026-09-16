import type { ReactNode } from "react";
import { AffiliatedTeamCard } from "@/components/players/AffiliatedTeamCard";
import { CopyPlayerIdButton } from "@/components/players/CopyPlayerIdButton";
import { LanguageBadges } from "@/components/languages/LanguageBadges";
import { HeroTierList } from "@/components/players/HeroTierList";
import { Panel } from "@/components/ui/Panel";
import { RankBadge } from "@/components/ui/RankBadge";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { rankFromSr } from "@/lib/rank";
import { openPlayBadges } from "@/lib/specialties";
import { labelFor, PLAYER_ROLES } from "@/lib/constants";
import type {
  PlayerRole,
  RecruitmentStatus,
  SpokenLanguage,
} from "@prisma/client";
import { ownerDisplayName, publicDisplayName } from "@/lib/privacy";
import type { RosterAffiliation } from "@/lib/recruitment";
import { affiliatedRoster, recruitmentLabel } from "@/lib/recruitment";

export type ProfileCardData = {
  id: string;
  battleTag: string;
  displayName: string;
  sr: number;
  role: PlayerRole;
  openToPlay: PlayerRole[];
  favoriteHeroes: string[];
  experience: string;
  recruitmentStatus: RecruitmentStatus;
  languages: SpokenLanguage[];
  user: {
    name: string;
    isCoach?: boolean;
    isCaster?: boolean;
    isStaff?: boolean;
    openToCast?: string;
    openToCoach?: string;
    casterProfile?: {
      streamUrl: string;
      vodUrl: string;
      eventsNote: string;
    } | null;
    rosterSlots?: RosterAffiliation[];
  };
};

export function PlayerProfileCard({
  profile,
  actions,
  showCopyId = false,
  revealBattleTag = false,
}: {
  profile: ProfileCardData;
  actions?: ReactNode;
  showCopyId?: boolean;
  revealBattleTag?: boolean;
}) {
  const displayName = revealBattleTag
    ? ownerDisplayName({
        displayName: profile.displayName,
        battleTag: profile.battleTag,
        name: profile.user.name,
      })
    : publicDisplayName({
        displayName: profile.displayName,
        name: profile.user.name,
      });
  const teams = affiliatedRoster(profile.user.rosterSlots ?? []);
  const badges = [
    ...openPlayBadges(profile.openToPlay),
    profile.user.isCoach ? "Coach officiel" : null,
    profile.user.openToCoach === "OPEN" && !profile.user.isCoach
      ? "Open to Coach"
      : null,
    profile.user.isCaster || profile.user.openToCast === "OPEN"
      ? "Open to Cast"
      : null,
    profile.user.isStaff ? "Staff" : null,
  ].filter((value): value is string => Boolean(value));

  return (
    <div className="relative z-0 flex flex-col gap-8">
      <div className="pointer-events-none absolute inset-x-0 -top-4 z-0 h-48 bg-gradient-to-b from-orange-500/10 to-transparent" />
      <header className="hud-card flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-orange-300">
            Player card · ID {profile.id}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-wide text-cyan-100 sm:text-5xl">
            {displayName}
          </h1>
          <div className="mt-3">
            <RoleBadge role={profile.role} />
          </div>
          {badges.length > 0 ? (
            <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-orange-300">
              {badges.join(" · ")}
            </p>
          ) : null}
          {revealBattleTag ? (
            <p className="mt-2 font-mono text-sm text-cyan-400">
              {profile.battleTag || "BattleTag non renseigné"}
            </p>
          ) : null}
          <p className="mt-1 text-zinc-400">{profile.user.name}</p>
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
            Rôle roster
          </p>
          <p className="mt-2 text-xl uppercase">
            {labelFor(PLAYER_ROLES, profile.role)}
          </p>
        </Panel>
        <Panel>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            Open to Play
          </p>
          <p className="mt-2 text-xl uppercase">
            {openPlayBadges(profile.openToPlay).join(" · ") || "—"}
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
      {profile.user.isCaster ? (
        <Panel>
          <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-400">
            Caster
          </h2>
          {profile.user.casterProfile?.streamUrl ||
          profile.user.casterProfile?.vodUrl ||
          profile.user.casterProfile?.eventsNote.trim() ? (
            <div className="flex flex-col gap-2 text-sm text-zinc-200">
              {profile.user.casterProfile.streamUrl ? (
                <a
                  href={profile.user.casterProfile.streamUrl}
                  className="text-orange-300 hover:text-orange-200"
                  target="_blank"
                  rel="noreferrer"
                >
                  Stream
                </a>
              ) : null}
              {profile.user.casterProfile.vodUrl ? (
                <a
                  href={profile.user.casterProfile.vodUrl}
                  className="text-orange-300 hover:text-orange-200"
                  target="_blank"
                  rel="noreferrer"
                >
                  VOD
                </a>
              ) : null}
              {profile.user.casterProfile.eventsNote.trim() ? (
                <p className="whitespace-pre-wrap text-zinc-300">
                  {profile.user.casterProfile.eventsNote}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">
              Aucun lien de diffusion pour le moment.
            </p>
          )}
        </Panel>
      ) : null}
      <p className="mt-2 inline-flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-500">
        Player ID{" "}
        <span className="text-cyan-400">{profile.id}</span>
        {showCopyId ? <CopyPlayerIdButton playerId={profile.id} /> : null}
      </p>
    </div>
  );
}
