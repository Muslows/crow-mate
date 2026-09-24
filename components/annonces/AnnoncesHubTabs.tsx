import Link from "next/link";
import type { AnnonceVue } from "@/lib/annonces";

const TABS: { vue: AnnonceVue; label: string; hint: string }[] = [
  {
    vue: "scrims",
    label: "Recherche de Scrims (LFS)",
    hint: "Matchs d’équipes — LFS EU PC 3k…",
  },
  {
    vue: "lft",
    label: "Recherche d’Équipes (LFT)",
    hint: "Joueurs qui cherchent un roster",
  },
  {
    vue: "lfp",
    label: "Recherche de Joueurs (LFP)",
    hint: "Postes ouverts par les managers",
  },
];

export function AnnoncesHubTabs({ current }: { current: AnnonceVue }) {
  return (
    <nav
      aria-label="Type d’annonce"
      className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
    >
      {TABS.map((tab) => {
        const active = tab.vue === current;
        return (
          <Link
            key={tab.vue}
            href={`/annonces?vue=${tab.vue}`}
            aria-current={active ? "page" : undefined}
            className={`rounded-2xl border px-4 py-3 transition ${
              active
                ? "border-orange-400 bg-orange-50 text-zinc-900 dark:border-orange-500/70 dark:bg-orange-950/50 dark:text-zinc-50"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-300 hover:bg-violet-50/70 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-300 dark:hover:border-violet-500/50 dark:hover:bg-violet-950/30"
            }`}
          >
            <span className="block text-sm font-semibold">{tab.label}</span>
            <span className="mt-0.5 block text-xs text-zinc-600 dark:text-zinc-400">
              {tab.hint}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
