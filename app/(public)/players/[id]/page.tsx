import { notFound, redirect } from "next/navigation";
import { AffiliatedTeamCard } from "@/components/players/AffiliatedTeamCard";
import { InviteOnProfileButton } from "@/components/invitations/InviteOnProfileButton";
import { OwnerProfileStudio } from "@/components/players/OwnerProfileStudio";
import { PlayerProfileCard } from "@/components/players/PlayerProfileCard";
import { HeroTierList } from "@/components/players/HeroTierList";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { RankBadge } from "@/components/ui/RankBadge";
import {
  labelFor,
  PLAYER_ROLES,
  PLATFORMS,
  ROSTER_STATUSES,
  STRUCTURES,
} from "@/lib/constants";
import { getPublicPlayerById } from "@/lib/data/players";
import { getPendingInvitationsForUser } from "@/lib/data/invitations";
import { getPlayerProfileById } from "@/lib/data/profiles";
import { db } from "@/lib/db";
import { isLookingForTeam } from "@/lib/recruitment";
import { getTeamsForManager } from "@/lib/data/teams";
import {
  canManageTeams,
  getSession,
  sessionCapabilities,
  sessionRole,
} from "@/lib/session";

export default async function PublicPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const profile = await getPlayerProfileById(id);

  if (profile) {
    const isOwner = session?.user.id === profile.userId;
    const manager =
      session && canManageTeams(sessionCapabilities(session)) && !isOwner;
    const teams = manager
      ? await getTeamsForManager(session.user.id, sessionRole(session))
      : [];
    const looking = isLookingForTeam(
      profile.recruitmentStatus,
      profile.user.rosterSlots,
    );
    const pendingInvite =
      manager && teams.length > 0
        ? await db.teamInvitation.findFirst({
            where: {
              inviteeId: profile.userId,
              status: "PENDING",
              teamId: { in: teams.map((team) => team.id) },
            },
          })
        : null;
    const displayTag = profile.battleTag || profile.user.name;

    return (
      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
        {isOwner && session ? (
          <OwnerProfileStudio
            profile={profile}
            invitations={await getPendingInvitationsForUser(session.user.id)}
          />
        ) : (
          <PlayerProfileCard
            profile={profile}
            actions={
              manager && looking ? (
                <InviteOnProfileButton
                  playerId={profile.id}
                  battleTag={displayTag}
                  teams={teams.map((team) => ({ id: team.id, name: team.name }))}
                  alreadyPending={Boolean(pendingInvite)}
                />
              ) : manager && pendingInvite ? (
                <button type="button" disabled className="hud-btn opacity-50">
                  Invitation envoyée
                </button>
              ) : null
            }
          />
        )}
      </main>
    );
  }

  const player = await getPublicPlayerById(id);
  if (!player || !player.team) notFound();

  const linkedProfileId = player.user?.playerProfile?.id;
  if (linkedProfileId) {
    redirect(`/players/${linkedProfileId}`);
  }

  return (
    <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-orange-500/10 to-transparent" />
      <AffiliatedTeamCard team={player.team} />
      <header className="flex flex-col gap-6 border border-cyan-400/20 bg-black/40 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-orange-300">
            Player card · {labelFor(PLATFORMS, player.team.platform)} ·{" "}
            {labelFor(STRUCTURES, player.team.structure)}
          </p>
          <h1 className="mt-3 font-mono text-4xl tracking-wide text-cyan-100 sm:text-5xl">
            {player.battleTag}
          </h1>
          <p className="mt-3 font-mono text-lg text-zinc-400">{player.sr} SR</p>
        </div>
        <RankBadge rank={player.rankDivision} sr={player.sr} />
      </header>
      <section className="grid gap-4 sm:grid-cols-3">
        <Panel>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            Rôle principal
          </p>
          <p className="mt-2 text-xl uppercase">{labelFor(PLAYER_ROLES, player.role)}</p>
        </Panel>
        <Panel>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            Rôle secondaire
          </p>
          <p className="mt-2 text-xl uppercase">
            {player.secondaryRole
              ? labelFor(PLAYER_ROLES, player.secondaryRole)
              : "—"}
          </p>
        </Panel>
        <Panel>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            Statut roster
          </p>
          <div className="mt-2">
            <Badge tone={player.status === "STARTER" ? "orange" : "muted"}>
              {labelFor(ROSTER_STATUSES, player.status)}
            </Badge>
          </div>
        </Panel>
      </section>
      <Panel>
        <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-400">
          Tier list
        </h2>
        <HeroTierList heroes={player.favoriteHeroes} />
      </Panel>
      <Panel>
        <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-400">
          Expérience
        </h2>
        {player.experience.trim() ? (
          <p className="whitespace-pre-wrap text-zinc-200">{player.experience}</p>
        ) : (
          <p className="text-sm text-zinc-400">Aucune expérience publiée.</p>
        )}
      </Panel>
    </main>
  );
}
