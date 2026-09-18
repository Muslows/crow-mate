import Link from "next/link";

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M10 3a7 7 0 1 1 4.47 12.32l4.1 4.11-1.41 1.41-4.11-4.1A7 7 0 0 1 10 3Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
      />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M7 2h2v2h6V2h2v2h3v16H4V4h3V2Zm11 8H6v8h12v-8Z"
      />
    </svg>
  );
}

function IconCrosshair() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M11 2h2v4h4v2h-4v8h4v2h-4v4h-2v-4H7v-2h4V8H7V6h4V2Zm1 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"
      />
    </svg>
  );
}

const PILLARS = [
  {
    icon: <IconSearch />,
    title: "Recrutement intelligent",
    versus: "vs Discord",
    body: "Profils typés sur les 5 rôles compétitifs, BattleTag masqué par défaut, invitation et chat intégré. Plus de copier-coller de messages dans dix salons.",
  },
  {
    icon: <IconCrosshair />,
    title: "Matchmaking de scrims",
    versus: "vs recherche manuelle",
    body: "Intersections de plannings, tolérance de SR, propositions asynchrones et fair-play post-match. Tu vois qui peut vraiment scrim cette semaine.",
  },
  {
    icon: <IconCalendar />,
    title: "Planning automatisé",
    versus: "vs Excel / sheets",
    body: "Chaque joueur renseigne ses dispos. Le manager obtient une matrice, des suggestions de créneaux et un planning officiel, sans tableur.",
  },
] as const;

export function HomeLanding() {
  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-4 py-12 sm:py-16">
      <section className="fade-up relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-14 shadow-sm sm:px-12">
        <div className="relative max-w-3xl">
          <p className="section-kicker">OW Manager</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Gère ton roster. Recrute. Scrim.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            La plateforme tout-en-un pour la gestion, le recrutement et le
            matchmaking de vos équipes Overwatch.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/players" className="hud-btn">
              Découvrir les joueurs
            </Link>
            <Link href="/manage/teams/new" className="hud-btn-ghost">
              Créer mon roster
            </Link>
          </div>
        </div>
      </section>

      <section className="fade-up-delay-1 flex flex-col gap-6">
        <div>
          <p className="section-kicker">Pourquoi OW Manager</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Sortir de Discord et des tableurs
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article key={pillar.title} className="hud-card flex flex-col gap-3 p-5">
              <div className="flex items-center gap-2 text-orange-400">
                {pillar.icon}
                <span className="text-xs font-medium">{pillar.versus}</span>
              </div>
              <h3 className="text-xl font-semibold tracking-wide">{pillar.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="fade-up-delay-2 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Comparatif Discord / Excel versus OW Manager
          </caption>
          <thead>
            <tr className="border-b border-border bg-zinc-800/50 text-xs text-zinc-500">
              <th className="px-4 py-3 font-semibold">Besoin</th>
              <th className="px-4 py-3 font-semibold">Méthode classique</th>
              <th className="px-4 py-3 font-semibold text-orange-300">
                OW Manager
              </th>
            </tr>
          </thead>
          <tbody className="text-zinc-200">
            <tr className="border-b border-border">
              <td className="px-4 py-3 font-medium">Recruter</td>
              <td className="px-4 py-3 text-zinc-500">
                Annonces Discord, BattleTag en clair, ghosting
              </td>
              <td className="px-4 py-3">
                Fiches rôles, contact, invitations avec acceptation
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="px-4 py-3 font-medium">Organiser la semaine</td>
              <td className="px-4 py-3 text-zinc-500">
                Sheet partagé, messages « dispo ce soir ? »
              </td>
              <td className="px-4 py-3">
                Dispos joueurs + suggestions de scrims automatiques
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">Trouver un adversaire</td>
              <td className="px-4 py-3 text-zinc-500">
                LFM, SR approximatif, pas de suivi fair-play
              </td>
              <td className="px-4 py-3">
                Matchmaking SR + créneaux communs, index de fair-play
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="fade-up-delay-3 flex flex-col items-start gap-4 rounded-2xl border border-orange-800/70 bg-orange-950/40 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Prêt à structurer ton équipe ?
          </h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            Scoute les joueurs, ou crée un roster et invite tes titulaires.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/players" className="hud-btn">
            Découvrir les joueurs
          </Link>
          <Link href="/teams" className="hud-btn-ghost">
            Voir les équipes
          </Link>
        </div>
      </section>
    </main>
  );
}
