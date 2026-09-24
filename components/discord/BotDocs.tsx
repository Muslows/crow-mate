import type { ReactNode } from "react";
import Link from "next/link";

function Command({ children }: { children: string }) {
  return (
    <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
      {children}
    </code>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-900 dark:bg-orange-950/70 dark:text-orange-100">
        {n}
      </span>
      <div>
        <p className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        <div className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {children}
        </div>
      </div>
    </li>
  );
}

export function BotDocs({
  communityInviteUrl,
  botInviteUrl,
}: {
  communityInviteUrl: string | null;
  botInviteUrl: string | null;
}) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-10">
      <div>
        <p className="section-kicker">Intégration</p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-wide">
          Bot Discord
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Deux usages, un même bot : tes alertes en message privé, et la
          syndication des annonces Crow-mate sur les serveurs communautaires.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="hud-card flex flex-col gap-6 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">
              Pour les joueurs
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Notifications en MP
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Messages reçus, invitations de roster et annulations de scrim
              arrivent directement dans tes messages privés Discord.
            </p>
          </div>
          <ol className="flex flex-col gap-5">
            <Step n={1} title="Rejoindre le serveur d’ancrage">
              Discord n’autorise les MP du bot que s’il existe un serveur en
              commun. Rejoins le Discord officiel Crow-mate, puis autorise les
              messages privés des membres du serveur.
            </Step>
            <Step n={2} title="Associer mon compte">
              Dans tes paramètres, clique sur{" "}
              <strong className="font-semibold text-zinc-800 dark:text-zinc-200">
                Associer mon compte
              </strong>{" "}
              pour lier Discord à Crow-mate. Tu pourras ensuite choisir quelles
              alertes recevoir.
            </Step>
          </ol>
          <div className="mt-auto flex flex-wrap gap-3">
            {communityInviteUrl ? (
              <a href={communityInviteUrl} className="hud-btn">
                Rejoindre le Discord
              </a>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Le lien d’invitation du serveur officiel n’est pas encore
                configuré.
              </p>
            )}
            <Link href="/profile/settings/notifications" className="hud-btn-ghost">
              Associer mon compte
            </Link>
          </div>
        </article>

        <article className="hud-card flex flex-col gap-6 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-800 dark:text-orange-300">
              Pour les admins de serveur
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Syndication d’annonces
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Invite le bot, indique-lui les salons, et les LFS / LFP publiés
              sur Crow-mate apparaissent automatiquement — puis disparaissent
              à l’expiration.
            </p>
          </div>
          <ol className="flex flex-col gap-5">
            <Step n={1} title="Inviter le bot">
              Permission <strong className="font-semibold">Gérer le serveur</strong>.
              Scopes <Command>bot</Command> et{" "}
              <Command>applications.commands</Command>.
            </Step>
            <Step n={2} title="Pointer les salons">
              Dans le serveur, lance les commandes slash :
              <ul className="mt-3 flex flex-col gap-2">
                <li>
                  <Command>/setup-scrim-channel</Command> — recherches de scrim
                </li>
                <li>
                  <Command>/setup-player-channel</Command> — recherches de
                  joueurs
                </li>
                <li>
                  <Command>/setup-team-channel</Command> — recherches d’équipes
                </li>
                <li>
                  <Command>/setup-ringer-channel</Command> — remplaçants
                </li>
              </ul>
            </Step>
          </ol>
          <div className="mt-auto">
            {botInviteUrl ? (
              <a href={botInviteUrl} className="hud-btn">
                Inviter le bot
              </a>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                L’invitation du bot n’est pas encore configurée sur ce
                déploiement.
              </p>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
