import Link from "next/link";
import { headers } from "next/headers";
import {
  getSession,
  canManageTeams,
  hasPlayerAccess,
  isAdminRole,
  sessionCapabilities,
} from "@/lib/session";
import { AlertsCluster } from "@/components/layout/AlertsCluster";
import { UserMenu } from "@/components/layout/UserMenu";
import { getPlayerProfileByUserId } from "@/lib/data/profiles";
import { countUnreadMessages } from "@/lib/data/chat";
import { getAccessibleStructures } from "@/lib/data/structures";
import { getDiscoveryPulse } from "@/lib/data/discovery";
import { syncDanglingManagerRole } from "@/lib/manager-lifecycle";

function Pulse({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-lime-400/90 px-1 text-[0.6rem] font-bold text-black">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export async function Header() {
  const pathname = (await headers()).get("x-pathname") ?? "";
  let session = await getSession();
  if (session) {
    await syncDanglingManagerRole(session.user.id, {
      preserveOnboarding: pathname === "/manage/teams/new",
    });
    session = await getSession();
  }
  const caps = session ? sessionCapabilities(session) : null;
  const manager = canManageTeams(caps);
  const player = hasPlayerAccess(caps);
  const admin = isAdminRole(caps);
  const ownProfile = session
    ? await getPlayerProfileByUserId(session.user.id)
    : null;
  const playerHref = ownProfile ? `/players/${ownProfile.id}` : "/profile";
  const accessibleStructures = session
    ? await getAccessibleStructures(session.user.id)
    : [];
  const unreadMessages = session
    ? await countUnreadMessages(session.user.id)
    : 0;
  const inboxHref = manager
    ? "/manage#scrim-proposals"
    : `${playerHref}#invitations`;
  const pulse = await getDiscoveryPulse();

  return (
    <header className="sticky top-3 z-50 isolate px-3 sm:px-4">
      <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-2xl border border-white/10 bg-[#0b0f19]/75 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-4">
        <Link href="/" className="flex shrink-0 items-baseline gap-2 px-1">
          <span className="text-[0.65rem] font-bold tracking-[0.28em] text-cyan-400">
            OW
          </span>
          <span className="text-lg font-bold uppercase tracking-[0.16em]">
            Manager
          </span>
        </Link>
        <nav
          aria-label="Découvrir"
          className="hidden min-w-0 items-center gap-1 md:flex"
        >
          <Link
            href="/players"
            className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300 transition hover:bg-white/5 hover:text-orange-200"
          >
            Découvrir les joueurs
            <Pulse count={pulse.playersOpen} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300 transition hover:bg-white/5 hover:text-orange-200"
          >
            Découvrir les équipes
            <Pulse count={pulse.teamsRecruiting} />
          </Link>
        </nav>
        <div className="ml-auto flex min-w-0 items-center gap-2">
          {session ? (
            <AlertsCluster
              userId={session.user.id}
              unreadMessages={unreadMessages}
              inboxHref={inboxHref}
            />
          ) : null}
          {session ? (
            <UserMenu
              name={session.user.name}
              player={player}
              manager={manager}
              admin={admin}
              org={accessibleStructures.length > 0}
              playerHref={playerHref}
            />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300 hover:text-orange-200 sm:inline"
              >
                Connexion
              </Link>
              <Link href="/register" className="hud-btn">
                Rejoindre
              </Link>
            </div>
          )}
        </div>
      </div>
      <nav
        aria-label="Découvrir mobile"
        className="mx-auto mt-2 flex max-w-6xl items-center gap-2 md:hidden"
      >
        <Link
          href="/players"
          className="inline-flex flex-1 items-center justify-center rounded-full border border-white/10 bg-[#0b0f19]/70 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-zinc-300 backdrop-blur"
        >
          Joueurs
          <Pulse count={pulse.playersOpen} />
        </Link>
        <Link
          href="/"
          className="inline-flex flex-1 items-center justify-center rounded-full border border-white/10 bg-[#0b0f19]/70 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-zinc-300 backdrop-blur"
        >
          Équipes
          <Pulse count={pulse.teamsRecruiting} />
        </Link>
      </nav>
    </header>
  );
}
