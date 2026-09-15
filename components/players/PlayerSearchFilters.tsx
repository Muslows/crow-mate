"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SrRangeFilter } from "@/components/forms/SrRangeFilter";
import { SPOKEN_LANGUAGES } from "@/lib/constants";
import type { SpokenLanguage } from "@prisma/client";

function buildSearch(params: {
  query: string;
  eloMin?: string;
  eloMax?: string;
  languages: SpokenLanguage[];
}): string {
  const search = new URLSearchParams();
  const trimmed = params.query.trim();
  if (trimmed) search.set("q", trimmed);
  if (params.eloMin) search.set("eloMin", params.eloMin);
  if (params.eloMax) search.set("eloMax", params.eloMax);
  for (const language of params.languages) {
    search.append("lang", language);
  }
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

export function PlayerSearchFilters({
  query = "",
  eloMin,
  eloMax,
  languages = [],
}: {
  query?: string;
  eloMin?: string;
  eloMax?: string;
  languages?: SpokenLanguage[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [draftQuery, setDraftQuery] = useState(query);

  useEffect(() => {
    setDraftQuery(query);
  }, [query]);

  useEffect(() => {
    if (draftQuery.trim() === query.trim()) return;
    const timer = window.setTimeout(() => {
      startTransition(() => {
        router.replace(
          `${pathname}${buildSearch({
            query: draftQuery,
            eloMin,
            eloMax,
            languages,
          })}`,
        );
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [draftQuery, query, eloMin, eloMax, languages, pathname, router]);

  function toggleLanguage(value: SpokenLanguage, checked: boolean) {
    const next = checked
      ? [...languages, value]
      : languages.filter((item) => item !== value);
    startTransition(() => {
      router.replace(
        `${pathname}${buildSearch({
          query: draftQuery,
          eloMin,
          eloMax,
          languages: next,
        })}`,
      );
    });
  }

  return (
    <form className="flex flex-col gap-4" method="get">
      <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        Pseudo / BattleTag
        <input
          name="q"
          value={draftQuery}
          onChange={(event) => setDraftQuery(event.target.value)}
          placeholder="Rechercher un joueur…"
          className="hud-input max-w-md font-mono"
          autoComplete="off"
        />
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs uppercase tracking-[0.16em] text-zinc-400">
          Langues
        </legend>
        <div className="flex flex-wrap gap-2">
          {SPOKEN_LANGUAGES.map((language) => {
            const checked = languages.includes(language.value);
            return (
              <label
                key={language.value}
                className={`cursor-pointer border px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] ${
                  checked
                    ? "border-orange-400/80 bg-orange-400/15 text-orange-200"
                    : "border-cyan-400/25 text-zinc-400"
                }`}
              >
                <input
                  type="checkbox"
                  name="lang"
                  value={language.value}
                  checked={checked}
                  className="sr-only"
                  onChange={(event) =>
                    toggleLanguage(language.value, event.target.checked)
                  }
                />
                {language.label}
              </label>
            );
          })}
        </div>
      </fieldset>
      <SrRangeFilter eloMin={eloMin} eloMax={eloMax} />
      <button type="submit" className="hud-btn self-start">
        Filtrer
      </button>
    </form>
  );
}
