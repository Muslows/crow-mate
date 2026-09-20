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

function IconBell() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M12 3a6 6 0 0 1 6 6v3.2l1.6 2.4A1 1 0 0 1 18.8 16H5.2a1 1 0 0 1-.8-1.4L6 12.2V9a6 6 0 0 1 6-6Zm0 16a3 3 0 0 0 2.8-2H9.2A3 3 0 0 0 12 19Z"
      />
    </svg>
  );
}

const PILLARS = [
  {
    icon: <IconCrosshair />,
    title: "Matchmaking intelligent",
    versus: "vs LFM approximatif",
    body: "Filtres par tranche d’Élo et intersections réelles de plannings. Tu proposes un scrim uniquement aux équipes qui peuvent vraiment jouer le créneau.",
  },
  {
    icon: <IconCalendar />,
    title: "Scrims validés centralisés",
    versus: "vs fils Discord",
    body: "Une fois le match accepté, les configs de salon s’échangent automatiquement : Discord, hôte, stagger et map pool, dans un espace unique.",
  },
  {
    icon: <IconSearch />,
    title: "Postes à pourvoir",
    versus: "vs copier-coller LFP",
    body: "Les rôles recherchés s’affichent dans le trombinoscope du roster. Un clic ouvre le chat avec le manager, message d’intérêt déjà rédigé.",
  },
  {
    icon: <IconBell />,
    title: "Bot Discord officiel",
    versus: "vs pings manuels",
    body: "Notifications instantanées en MP et publication automatique sur les salons communautaires configurés. LFS et LFP s’effacent à l’expiration ou au retrait.",
  },
] as const;

export function HomeLanding() {
  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-4 py-12 sm:py-16">
      <section className="fade-up relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-14 shadow-sm sm:px-12">
        <div className="relative max-w-3xl">
          <p className="section-kicker">OW Manager</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
            Gère ton roster. Recrute. Scrim.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
            La plateforme compétitive Overwatch : matchmaking par Élo et
            plannings, scrims validés avec configs de salon, recrutement par
            postes ouverts, et bot Discord pour les MP comme les salons clés.
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
            Quatre piliers, zéro tableur
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((pillar) => (
            <article key={pillar.title} className="hud-card flex flex-col gap-3 p-5">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                {pillar.icon}
                <span className="text-xs font-medium">{pillar.versus}</span>
              </div>
              <h3 className="text-xl font-semibold tracking-wide">{pillar.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {pillar.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="fade-up-delay-2 overflow-x-auto rounded-2xl border border-zinc-200 bg-white transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Comparatif Discord / Excel versus OW Manager
          </caption>
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <th className="px-4 py-3 font-semibold">Besoin</th>
              <th className="px-4 py-3 font-semibold">Méthode classique</th>
              <th className="px-4 py-3 font-semibold text-orange-800 dark:text-orange-300">
                OW Manager
              </th>
            </tr>
          </thead>
          <tbody className="text-zinc-800 dark:text-zinc-200">
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <td className="px-4 py-3 font-medium">Recruter</td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                LFP Discord, BattleTag en clair, ghosting
              </td>
              <td className="px-4 py-3">
                Postes à pourvoir dans le roster, chat prérempli, anti-spam
              </td>
            </tr>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <td className="px-4 py-3 font-medium">Organiser la semaine</td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                Sheet partagé, messages « dispo ce soir ? »
              </td>
              <td className="px-4 py-3">
                Dispos joueurs, suggestions auto, planning officiel
              </td>
            </tr>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <td className="px-4 py-3 font-medium">Trouver un adversaire</td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                LFS, SR approximatif, configs en MP
              </td>
              <td className="px-4 py-3">
                Matchmaking Élo + créneaux communs, configs après validation
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">Alerter l’équipe</td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                Pings manuels, messages oubliés
              </td>
              <td className="px-4 py-3">
                Bot Discord : MP joueurs et salons communautaires
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="fade-up-delay-3 flex flex-col items-start gap-4 rounded-2xl border border-orange-200 bg-orange-50 px-6 py-8 transition-colors duration-200 dark:border-orange-800/70 dark:bg-orange-950/40 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Prêt à structurer ton équipe ?
          </h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            Ouvre un poste, publie un LFS, ou invite tes titulaires. Le bot
            relais, le roster affiche, le planning recoupe.
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
