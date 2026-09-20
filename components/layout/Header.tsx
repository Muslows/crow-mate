import Link from "next/link";
import { headers } from "next/headers";
import {
  getSession,
  canManageTeams,
  hasPlayerAccess,
  isAdminRole,
  sessionCapabilities,
} from "@/lib/session";
import { DiscordDmBlockedBanner } from "@/components/account/DiscordDmBlockedBanner";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { AlertsCluster } from "@/components/layout/AlertsCluster";
import { UserMenu } from "@/components/layout/UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getPlayerProfileByUserId } from "@/lib/data/profiles";
import { countUnreadMessages } from "@/lib/data/chat";
import {
  emptyNotificationInbox,
  getNotificationInbox,
} from "@/lib/data/notifications";
import { getAccessibleStructures } from "@/lib/data/structures";
import { getDiscoveryPulse } from "@/lib/data/discovery";
import { syncDanglingManagerRole } from "@/lib/manager-lifecycle";
import { getDiscordAccountLink } from "@/lib/data/discord";
import { publicDisplayName } from "@/lib/privacy";

function Pulse({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[0.6rem] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export async function Header() {
  const pathname = (await headers()).get("x-pathname") ?? "";
  let session = null;
  try {
    session = await getSession();
    if (session) {
      await syncDanglingManagerRole(session.user.id, {
        preserveOnboarding: pathname === "/manage/teams/new",
      });
      session = await getSession();
    }
  } catch (error) {
    console.error("header session", error);
    session = null;
  }
  const caps = session ? sessionCapabilities(session) : null;
  const manager = canManageTeams(caps);
  const player = hasPlayerAccess(caps);
  const admin = isAdminRole(caps);
  let ownProfile = null;
  let accessibleStructures: Awaited<
    ReturnType<typeof getAccessibleStructures>
  > = [];
  let unreadMessages = 0;
  let inbox = emptyNotificationInbox;
  let pulse = { playersOpen: 0, teamsRecruiting: 0 };
  let discordDmBlocked = false;
  try {
    ownProfile = session
      ? await getPlayerProfileByUserId(session.user.id)
      : null;
    accessibleStructures = session
      ? await getAccessibleStructures(session.user.id)
      : [];
    unreadMessages = session
      ? await countUnreadMessages(session.user.id)
      : 0;
    inbox = session
      ? await getNotificationInbox(session.user.id)
      : inbox;
    pulse = await getDiscoveryPulse();
    if (session) {
      const discord = await getDiscordAccountLink(session.user.id);
      discordDmBlocked = Boolean(discord?.discordId && discord.discordDmBlocked);
    }
  } catch (error) {
    console.error("header data", error);
  }
  const playerHref = ownProfile ? `/players/${ownProfile.id}` : "/profile";

  return (
    <header className="sticky top-3 z-40 px-3 sm:px-4">
      <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-2xl border border-border bg-surface/85 px-3 py-2 shadow-sm backdrop-blur-xl sm:px-4">
        <Link href="/" className="flex shrink-0 items-baseline gap-2 px-1">
          <span className="text-sm font-bold text-orange-500 dark:text-orange-400">OW</span>
          <span className="text-lg font-semibold tracking-tight text-foreground">Manager</span>
        </Link>
        <nav
          aria-label="Découvrir"
          className="hidden min-w-0 items-center gap-1 md:flex"
        >
          <Link
            href="/players"
            className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-zinc-100 hover:text-orange-500 dark:hover:bg-zinc-800 dark:hover:text-orange-400"
          >
            Joueurs
            <Pulse count={pulse.playersOpen} />
          </Link>
          <Link
            href="/teams"
            className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-zinc-100 hover:text-orange-500 dark:hover:bg-zinc-800 dark:hover:text-orange-400"
          >
            Équipes
            <Pulse count={pulse.teamsRecruiting} />
          </Link>
          <Link
            href="/scrims"
            className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-zinc-100 hover:text-orange-500 dark:hover:bg-zinc-800 dark:hover:text-orange-400"
          >
            Scrims
          </Link>
        </nav>
        <div className="ml-auto flex min-w-0 items-center gap-2">
          <ThemeToggle />
          {session ? (
            <AlertsCluster
              unreadMessages={unreadMessages}
              inbox={inbox}
            />
          ) : null}
          {session ? (
            <UserMenu
              name={publicDisplayName({
                displayName: ownProfile?.displayName,
                name: session.user.name,
              })}
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
                className="hidden text-sm font-medium text-muted hover:text-orange-500 dark:hover:text-orange-400 sm:inline"
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
      {session && !session.user.emailVerified ? (
        <EmailVerificationBanner email={session.user.email} />
      ) : null}
      {session && discordDmBlocked ? <DiscordDmBlockedBanner /> : null}
      <nav
        aria-label="Découvrir mobile"
        className="mx-auto mt-2 flex max-w-6xl items-center gap-2 md:hidden"
      >
        <Link
          href="/players"
          className="inline-flex flex-1 items-center justify-center rounded-full border border-border bg-surface/90 px-3 py-2 text-sm font-medium text-foreground backdrop-blur"
        >
          Joueurs
          <Pulse count={pulse.playersOpen} />
        </Link>
        <Link
          href="/teams"
          className="inline-flex flex-1 items-center justify-center rounded-full border border-border bg-surface/90 px-3 py-2 text-sm font-medium text-foreground backdrop-blur"
        >
          Équipes
          <Pulse count={pulse.teamsRecruiting} />
        </Link>
        <Link
          href="/scrims"
          className="inline-flex flex-1 items-center justify-center rounded-full border border-border bg-surface/90 px-3 py-2 text-sm font-medium text-foreground backdrop-blur"
        >
          Scrims
        </Link>
      </nav>
    </header>
  );
}
