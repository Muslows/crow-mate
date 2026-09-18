"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { EloBandFilter } from "@/components/forms/EloBandFilter";
import { FlagIcon } from "@/components/languages/FlagIcon";
import { OPEN_PLAY_ROLES, SPOKEN_LANGUAGES } from "@/lib/constants";
import type { SpokenLanguage } from "@prisma/client";
import type { OpenPlayRole } from "@/lib/data/filters";

function buildSearch(params: {
  query: string;
  elo?: string;
  sensitivity?: string;
  languages: SpokenLanguage[];
  openRoles: OpenPlayRole[];
}): string {
  const search = new URLSearchParams();
  const trimmed = params.query.trim();
  if (trimmed) search.set("q", trimmed);
  if (params.elo !== undefined && params.elo !== "") {
    search.set("elo", params.elo);
  }
  if (params.sensitivity !== undefined && params.sensitivity !== "") {
    search.set("sensitivity", params.sensitivity);
  }
  for (const language of params.languages) {
    search.append("lang", language);
  }
  for (const role of params.openRoles) {
    search.append("open", role);
  }
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

export function PlayerSearchFilters({
  query = "",
  elo,
  sensitivity,
  languages = [],
  openRoles = [],
}: {
  query?: string;
  elo?: string;
  sensitivity?: string;
  languages?: SpokenLanguage[];
  openRoles?: OpenPlayRole[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [draftQuery, setDraftQuery] = useState(query);
  const [draftElo, setDraftElo] = useState(elo ?? "");
  const [draftSensitivity, setDraftSensitivity] = useState(sensitivity ?? "");

  useEffect(() => {
    setDraftQuery(query);
  }, [query]);

  useEffect(() => {
    setDraftElo(elo ?? "");
    setDraftSensitivity(sensitivity ?? "");
  }, [elo, sensitivity]);

  useEffect(() => {
    const sameQuery = draftQuery.trim() === query.trim();
    const sameElo = (draftElo || "") === (elo ?? "");
    const sameSensitivity = (draftSensitivity || "") === (sensitivity ?? "");
    if (sameQuery && sameElo && sameSensitivity) return;
    const timer = window.setTimeout(() => {
      startTransition(() => {
        router.replace(
          `${pathname}${buildSearch({
            query: draftQuery,
            elo: draftElo || undefined,
            sensitivity: draftSensitivity || undefined,
            languages,
            openRoles,
          })}`,
        );
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [
    draftQuery,
    draftElo,
    draftSensitivity,
    query,
    elo,
    sensitivity,
    languages,
    openRoles,
    pathname,
    router,
  ]);

  function replaceFacets(next: {
    languages?: SpokenLanguage[];
    openRoles?: OpenPlayRole[];
  }) {
    startTransition(() => {
      router.replace(
        `${pathname}${buildSearch({
          query: draftQuery,
          elo: draftElo || undefined,
          sensitivity: draftSensitivity || undefined,
          languages: next.languages ?? languages,
          openRoles: next.openRoles ?? openRoles,
        })}`,
      );
    });
  }

  function toggleValue<T extends string>(list: T[], value: T, checked: boolean): T[] {
    return checked ? [...list, value] : list.filter((item) => item !== value);
  }

  return (
    <form className="flex flex-col gap-3" method="get">
      <label className="form-label max-w-xl">
        Rechercher
        <input
          name="q"
          value={draftQuery}
          onChange={(event) => setDraftQuery(event.target.value)}
          placeholder="Pseudo…"
          className="hud-input"
          autoComplete="off"
        />
      </label>
      <details className="rounded-2xl border border-zinc-200 bg-white p-4 transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-900">
        <summary className="cursor-pointer text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Filtres
        </summary>
        <div className="mt-4 flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Open to Play
        </legend>
        <div className="flex flex-wrap gap-2">
          {OPEN_PLAY_ROLES.map((role) => {
            const checked = openRoles.includes(role.value);
            return (
              <label
                key={role.value}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors duration-200 ${
                  checked
                    ? "border-orange-400 bg-orange-50 text-orange-800 dark:border-orange-300 dark:bg-orange-950/40 dark:text-orange-200"
                    : "border-border text-zinc-700 dark:text-zinc-400"
                }`}
              >
                <input
                  type="checkbox"
                  name="open"
                  value={role.value}
                  checked={checked}
                  className="sr-only"
                  onChange={(event) =>
                    replaceFacets({
                      openRoles: toggleValue(
                        openRoles,
                        role.value,
                        event.target.checked,
                      ),
                    })
                  }
                />
                {role.label}
              </label>
            );
          })}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Langues
        </legend>
        <div className="flex flex-wrap gap-2">
          {SPOKEN_LANGUAGES.map((language) => {
            const checked = languages.includes(language.value);
            return (
              <label
                key={language.value}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors duration-200 ${
                  checked
                    ? "border-orange-400 bg-orange-50 text-orange-800 dark:border-orange-300 dark:bg-orange-950/40 dark:text-orange-200"
                    : "border-border text-zinc-700 dark:text-zinc-400"
                }`}
              >
                <input
                  type="checkbox"
                  name="lang"
                  value={language.value}
                  checked={checked}
                  className="sr-only"
                  onChange={(event) =>
                    replaceFacets({
                      languages: toggleValue(
                        languages,
                        language.value,
                        event.target.checked,
                      ),
                    })
                  }
                />
                <span className="inline-flex items-center gap-2">
                  <FlagIcon language={language.value} size="sm" />
                  {language.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <EloBandFilter
        elo={elo}
        sensitivity={sensitivity}
        onChange={(next) => {
          setDraftElo(String(next.elo));
          setDraftSensitivity(String(next.sensitivity));
        }}
      />
      <button type="submit" className="hud-btn self-start">
        Appliquer
      </button>
        </div>
      </details>
    </form>
  );
}
