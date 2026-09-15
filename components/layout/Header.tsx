import Link from "next/link";
import {
  getSession,
  canManageTeams,
  hasPlayerAccess,
  sessionCapabilities,
} from "@/lib/session";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { WorkspaceSwitch } from "@/components/layout/WorkspaceSwitch";
import { getPlayerProfileByUserId } from "@/lib/data/profiles";

export async function Header() {
  const session = await getSession();
  const caps = session ? sessionCapabilities(session) : null;
  const manager = canManageTeams(caps);
  const player = hasPlayerAccess(caps);
  const ownProfile = session
    ? await getPlayerProfileByUserId(session.user.id)
    : null;
  const playerHref = ownProfile ? `/players/${ownProfile.id}` : "/profile";

  return (
    <header className="border-b border-cyan-400/20 bg-black/50 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-mono text-[0.65rem] tracking-[0.28em] text-cyan-400">
            OW
          </span>
          <span className="text-lg font-semibold uppercase tracking-[0.18em]">
            Manager
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-wider">
          <Link href="/" className="text-zinc-300 hover:text-orange-300">
            Scouting
          </Link>
          <Link href="/players" className="text-zinc-300 hover:text-orange-300">
            Joueurs
          </Link>
          {session ? (
            <WorkspaceSwitch
              manager={manager}
              player={player}
              playerHref={playerHref}
            />
          ) : null}
          {session && !player ? (
            <Link href="/profile" className="text-zinc-500 hover:text-cyan-300">
              + Profil
            </Link>
          ) : null}
          {session && player ? (
            <NotificationBell
              userId={session.user.id}
              href={`${playerHref}#invitations`}
            />
          ) : null}
          {session && !manager ? (
            <Link href="/manage" className="text-zinc-500 hover:text-orange-300">
              + Roster
            </Link>
          ) : null}
          {session ? (
            <>
              <span className="hidden font-mono text-xs text-cyan-400 sm:inline">
                {session.user.name}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-zinc-300 hover:text-orange-300">
                Connexion
              </Link>
              <Link href="/register" className="hud-btn">
                Rejoindre
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
