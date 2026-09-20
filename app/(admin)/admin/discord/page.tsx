import { Panel } from "@/components/ui/Panel";
import { listDiscordServerConfigs } from "@/lib/data/announcements";
import {
  discordBotInviteUrl,
  discordPublicKey,
  discordServerConfig,
} from "@/lib/discord/config";
import { requireAdminSession } from "@/lib/session";

export default async function AdminDiscordPage() {
  await requireAdminSession();
  const servers = await listDiscordServerConfigs();
  const inviteUrl = discordBotInviteUrl();
  const configured = Boolean(discordServerConfig());
  const interactionsReady = Boolean(discordPublicKey());

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-400">
          Admin
        </p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-wide">
          Bot Discord
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Les administrateurs de chaque serveur clé configurent eux-mêmes les
            salons avec <code>/setup-scrim-channel</code>,{" "}
            <code>/setup-player-channel</code>,{" "}
            <code>/setup-team-channel</code> et{" "}
            <code>/setup-ringer-channel</code>. Cette page ne fait que lister
            l’état.
        </p>
      </div>
      <Panel>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
          Installation autonome
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
          <li>
            Un admin Discord (Gérer le serveur) invite le bot via le lien
            ci-dessous (scopes <code>bot</code> +{" "}
            <code>applications.commands</code>).
          </li>
          <li>
            Sur le serveur, il exécute les commandes{" "}
            <code>/setup-*-channel #salon</code> pour isoler LFS, LFP, LFT et
            ringers.
          </li>
          <li>
            <code>/bot-info</code> ou <code>/help</code> rappelle le cycle de
            vie : publication immédiate, suppression à la fin du créneau.
          </li>
        </ol>
        {configured && inviteUrl ? (
          <a href={inviteUrl} className="hud-btn mt-4 inline-flex w-fit">
            Inviter le bot sur un serveur
          </a>
        ) : (
          <p className="mt-4 text-sm text-orange-800 dark:text-orange-300">
            Secrets Discord manquants sur ce déploiement.
          </p>
        )}
        {!interactionsReady ? (
          <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
            En production, renseigne <code>DISCORD_PUBLIC_KEY</code> et l’URL
            d’interactions{" "}
            <code>/api/discord/interactions</code> dans le portail Discord.
            En local, le process Next démarre aussi le gateway slash.
          </p>
        ) : null}
      </Panel>
      {servers.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Aucun salon LFS n’a encore été enregistré via slash command.
        </p>
      ) : (
        <ul className="grid gap-3">
          {servers.map((server) => (
            <li key={server.guildId}>
              <Panel>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {server.guildName || "Serveur Discord"}
                </p>
                <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  guild {server.guildId}
                </p>
                <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  LFS {server.scrimChannelId || "—"}
                </p>
                <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  LFP {server.playerChannelId || "—"}
                </p>
                <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  LFT {server.teamChannelId || "—"}
                </p>
                <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  Ringers {server.ringerChannelId || "—"}
                </p>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  Mis à jour le{" "}
                  {server.updatedAt.toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                    timeZone: "Europe/Paris",
                  })}
                </p>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
