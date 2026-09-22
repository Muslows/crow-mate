import type { ReactNode } from "react";
import { AffiliatedTeamCard } from "@/components/players/AffiliatedTeamCard";
import { CopyPlayerIdButton } from "@/components/players/CopyPlayerIdButton";
import { LanguageBadges } from "@/components/languages/LanguageBadges";
import { HeroTierList } from "@/components/players/HeroTierList";
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
  biography?: string;
  scrimEloTank?: number;
  scrimEloDps?: number;
  scrimEloSupport?: number;
  officialRankTank?: string;
  officialRankDps?: string;
  officialRankSupport?: string;
  recruitmentStatus: RecruitmentStatus;
  languages: SpokenLanguage[];
  user: {
    name: string;
    discord?: string;
    isDiscordPublic?: boolean;
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

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function PlayerProfileCard({
  profile,
  actions,
  showCopyId = false,
  revealBattleTag = false,
  revealDiscord = false,
}: {
  profile: ProfileCardData;
  actions?: ReactNode;
  showCopyId?: boolean;
  revealBattleTag?: boolean;
  revealDiscord?: boolean;
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
  const bio = recruitmentLabel(
    profile.recruitmentStatus,
    profile.user.rosterSlots ?? [],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
        <div className="h-28 bg-gradient-to-r from-zinc-200 via-orange-100 to-zinc-100 transition-colors duration-200 dark:from-zinc-800 dark:via-orange-950/40 dark:to-zinc-900 sm:h-36" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-surface bg-orange-100 text-xl font-bold text-orange-800 shadow-sm transition-colors duration-200 dark:border-zinc-900 dark:bg-orange-950/40 dark:text-orange-200 sm:h-24 sm:w-24">
                {initials(displayName) || "OW"}
              </span>
              <div className="pb-1">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {displayName}
                </h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                {profile.biography?.trim() ? (
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {profile.biography.trim()}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{bio}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:pb-1">
              <RankBadge sr={profile.sr} rank={rankFromSr(profile.sr)} />
              {actions}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4">
          <section className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Niveau officiel
            </p>
            <p className="mt-1 text-lg font-semibold">{profile.sr} SR</p>
            {(profile.officialRankTank ||
              profile.officialRankDps ||
              profile.officialRankSupport) && (
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {profile.officialRankTank
                  ? `Tank ${profile.officialRankTank}`
                  : null}
                {profile.officialRankTank && (profile.officialRankDps || profile.officialRankSupport)
                  ? " · "
                  : null}
                {profile.officialRankDps
                  ? `DPS ${profile.officialRankDps}`
                  : null}
                {profile.officialRankDps && profile.officialRankSupport ? " · " : null}
                {profile.officialRankSupport
                  ? `Support ${profile.officialRankSupport}`
                  : null}
              </p>
            )}
            {(profile.scrimEloTank ||
              profile.scrimEloDps ||
              profile.scrimEloSupport) ? (
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                Élo scrim · Tank {profile.scrimEloTank ?? 0} · DPS{" "}
                {profile.scrimEloDps ?? 0} · Support {profile.scrimEloSupport ?? 0}
              </p>
            ) : null}
            <div className="mt-3">
              <RoleBadge role={profile.role} />
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {labelFor(PLAYER_ROLES, profile.role)}
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Open to play</p>
            <p className="mt-2 text-sm text-zinc-800 dark:text-zinc-200">
              {openPlayBadges(profile.openToPlay).join(" · ") || "—"}
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Langues</p>
            <div className="mt-2">
              <LanguageBadges languages={profile.languages} />
            </div>
          </section>
          {revealBattleTag ? (
            <section className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">BattleTag</p>
              <p className="mt-1 font-mono text-sm">
                {profile.battleTag || "Non renseigné"}
              </p>
            </section>
          ) : null}
          {revealDiscord && profile.user.discord ? (
            <section className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Discord
              </p>
              <p className="mt-1 font-mono text-sm">{profile.user.discord}</p>
            </section>
          ) : null}
          <p className="inline-flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            ID{" "}
            <span className="font-mono text-zinc-800 dark:text-zinc-300">{profile.id}</span>
            {showCopyId ? <CopyPlayerIdButton playerId={profile.id} /> : null}
          </p>
        </aside>

        <div className="flex flex-col gap-4">
          {teams.length > 0 ? (
            <section className="flex flex-col gap-2">
              {teams.map((slot) => (
                <AffiliatedTeamCard key={slot.id} team={slot.team} />
              ))}
            </section>
          ) : null}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-foreground">Tier list</h2>
            <div className="mt-3">
              <HeroTierList heroes={profile.favoriteHeroes} />
            </div>
          </section>
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-foreground">Expérience</h2>
            {profile.experience.trim() ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-300">
                {profile.experience}
              </p>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">
                Aucune expérience publiée.
              </p>
            )}
          </section>
          {profile.user.isCaster ? (
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold text-foreground">Caster</h2>
              {profile.user.casterProfile?.streamUrl ||
              profile.user.casterProfile?.vodUrl ||
              profile.user.casterProfile?.eventsNote.trim() ? (
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  {profile.user.casterProfile.streamUrl ? (
                    <a
                      href={profile.user.casterProfile.streamUrl}
                      className="text-orange-700 hover:underline dark:text-orange-400"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Stream
                    </a>
                  ) : null}
                  {profile.user.casterProfile.vodUrl ? (
                    <a
                      href={profile.user.casterProfile.vodUrl}
                      className="text-orange-700 hover:underline dark:text-orange-400"
                      target="_blank"
                      rel="noreferrer"
                    >
                      VOD
                    </a>
                  ) : null}
                  {profile.user.casterProfile.eventsNote.trim() ? (
                    <p className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-300">
                      {profile.user.casterProfile.eventsNote}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-sm text-zinc-500">
                  Aucun lien de diffusion pour le moment.
                </p>
              )}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
