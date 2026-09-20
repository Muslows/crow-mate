import { DiscordDmSetupCard } from "@/components/account/DiscordDmSetupCard";
import { Panel } from "@/components/ui/Panel";
import Link from "next/link";
import { getDiscordAccountLink } from "@/lib/data/discord";
import {
  discordCommunityInviteUrl,
  discordOAuthRedirectUri,
  discordGuildOAuthRedirectUri,
  discordServerConfig,
} from "@/lib/discord/config";
import { requireAuthSession } from "@/lib/session";

const statusMessages: Record<
  string,
  { tone: "ok" | "warn" | "err"; text: string }
> = {
  linked: {
    tone: "ok",
    text: "Compte Discord associé. Les alertes arriveront en message privé.",
  },
  cancelled: {
    tone: "warn",
    text: "Tu as refusé l’autorisation Discord. Relance « Associer mon compte Discord » si tu veux recevoir les alertes en MP.",
  },
  invalid_state: {
    tone: "err",
    text: "L’association doit partir du bouton dans cette page, pas du lien copié dans le portail Discord. Reconnecte-toi si besoin, puis reclique sur « Associer mon compte Discord ».",
  },
  oauth_error: {
    tone: "err",
    text: "Discord a refusé l’échange du code (souvent un Client Secret invalide). Vérifie OAuth2 → Client Secret dans le portail, redémarre le serveur, puis réessaie le bouton.",
  },
  already_linked: {
    tone: "err",
    text: "Ce compte Discord est déjà associé à un autre profil.",
  },
  unconfigured: {
    tone: "warn",
    text: "L’intégration Discord n’est pas configurée : vérifie le Client ID (Application ID, 17–20 chiffres) et le redirect enregistré dans le portail.",
  },
};

const statusToneClass: Record<"ok" | "warn" | "err", string> = {
  ok: "border-cyan-200 bg-cyan-50 text-cyan-900 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-100",
  warn: "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-100",
  err: "border-red-300 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100",
};

export default async function NotificationSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ discord?: string }>;
}) {
  const session = await requireAuthSession();
  const [account, query] = await Promise.all([
    getDiscordAccountLink(session.user.id),
    searchParams,
  ]);
  const status = query.discord ? statusMessages[query.discord] : null;
  const botConfigured = Boolean(discordServerConfig());
  const inviteUrl = discordCommunityInviteUrl();
  const username =
    account?.discordUsername.trim() || account?.discord.trim() || "Discord";

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Notifications (Bot)
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Deux étapes suffisent : rejoindre le Discord officiel, puis associer
          ton compte. Le bot t’écrit ensuite en MP. Les types d’alertes se
          règlent dans{" "}
          <Link
            href="/profile/settings/discord-bot"
            className="font-medium underline underline-offset-2"
          >
            Configuration Bot Discord
          </Link>
          .
        </p>
      </div>
      {!botConfigured ? (
        <Panel>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
            Configuration développeur (une seule fois)
          </h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
            <li>
              Crée une application sur{" "}
              <a
                href="https://discord.com/developers/applications"
                className="underline decoration-zinc-400 underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                Discord Developer Portal
              </a>
              . Le bot doit déjà être présent sur le Discord officiel.
            </li>
            <li>
              Onglet OAuth2 : copie le <strong>Application ID</strong> (pas le
              token bot, pas le bot user ID). Scope utilisateur{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
                identify
              </code>{" "}
              uniquement. Pas de scope <code>bot</code>, pas de permissions.
            </li>
            <li>
              Redirects :{" "}
              <code className="break-all rounded bg-zinc-100 px-1 dark:bg-zinc-800">
                {discordOAuthRedirectUri()}
              </code>{" "}
              (association compte) et{" "}
              <code className="break-all rounded bg-zinc-100 px-1 dark:bg-zinc-800">
                {discordGuildOAuthRedirectUri()}
              </code>{" "}
              (installation du bot ; les salons se configurent avec
              /setup-scrim-channel, /setup-player-channel,
              /setup-team-channel, /setup-ringer-channel).
            </li>
            <li>
              Ajoute dans <code>.env</code> / Vercel :{" "}
              <code>DISCORD_CLIENT_ID</code>, <code>DISCORD_CLIENT_SECRET</code>,{" "}
              <code>DISCORD_BOT_TOKEN</code>,{" "}
              <code>DISCORD_OAUTH_STATE_SECRET</code>,{" "}
              <code>DISCORD_COMMUNITY_INVITE_URL</code>, <code>CRON_SECRET</code>.
            </li>
            <li>Redémarre le serveur. Les deux boutons apparaissent alors.</li>
          </ol>
        </Panel>
      ) : null}
      {status ? (
        <p
          role="status"
          className={`rounded-xl border p-3 text-sm ${statusToneClass[status.tone]}`}
        >
          {status.text}
        </p>
      ) : null}
      <DiscordDmSetupCard
        configured={botConfigured}
        inviteUrl={inviteUrl}
        linked={
          account?.discordId
            ? { username, dmBlocked: account.discordDmBlocked }
            : null
        }
      />
    </>
  );
}
