"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { EloBandFilter } from "@/components/forms/EloBandFilter";
import { FlagIcon } from "@/components/languages/FlagIcon";
import { PLATFORMS, SPOKEN_LANGUAGES } from "@/lib/constants";
import type { Platform, SpokenLanguage } from "@prisma/client";

function buildSearch(params: {
  query: string;
  platform?: Platform | "";
  language?: SpokenLanguage | "";
  elo?: string;
  sensitivity?: string;
}): string {
  const search = new URLSearchParams();
  if (params.query.trim()) search.set("q", params.query.trim());
  if (params.platform) search.set("platform", params.platform);
  if (params.language) search.set("lang", params.language);
  if (params.elo) search.set("elo", params.elo);
  if (params.sensitivity) search.set("sensitivity", params.sensitivity);
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

export function TeamFilters({
  query = "",
  platform,
  language,
  elo,
  sensitivity,
}: {
  query?: string;
  platform?: Platform | "";
  language?: SpokenLanguage | "";
  elo?: string;
  sensitivity?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
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
            platform,
            language,
            elo,
            sensitivity,
          })}`,
        );
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [draftQuery, query, platform, language, elo, sensitivity, pathname, router]);

  function replaceFacets(next: {
    platform?: Platform | "";
    language?: SpokenLanguage | "";
  }) {
    startTransition(() => {
      router.replace(
        `${pathname}${buildSearch({
          query: draftQuery,
          platform: next.platform ?? platform,
          language: next.language ?? language,
          elo,
          sensitivity,
        })}`,
      );
    });
  }

  return (
    <form className="flex flex-col gap-3" method="get">
      <label className="form-label max-w-xl">
        Rechercher
        <input
          name="q"
          value={draftQuery}
          onChange={(event) => setDraftQuery(event.target.value)}
          placeholder="Nom d’équipe…"
          className="hud-input"
          autoComplete="off"
        />
      </label>
      <details className="rounded-2xl border border-zinc-200 bg-white p-4 transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-900">
        <summary className="cursor-pointer text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Filtres
        </summary>
        <div className="mt-4 flex flex-col gap-4">
          <label className="form-label max-w-xs">
            Plateforme
            <select
              name="platform"
              className="hud-input"
              value={platform ?? ""}
              onChange={(event) =>
                replaceFacets({
                  platform: (event.target.value || "") as Platform | "",
                })
              }
            >
              <option value="">Toutes</option>
              {PLATFORMS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Langue
            </legend>
            <div className="flex flex-wrap gap-2">
              <label
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors duration-200 ${
                  !language
                    ? "border-orange-400 bg-orange-50 text-orange-800 dark:border-orange-300 dark:bg-orange-950/40 dark:text-orange-200"
                    : "border-border text-zinc-700 dark:text-zinc-400"
                }`}
              >
                <input
                  type="radio"
                  name="lang"
                  value=""
                  checked={!language}
                  className="sr-only"
                  onChange={() => replaceFacets({ language: "" })}
                />
                Toutes
              </label>
              {SPOKEN_LANGUAGES.map((item) => {
                const checked = language === item.value;
                return (
                  <label
                    key={item.value}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors duration-200 ${
                      checked
                        ? "border-orange-400 bg-orange-50 text-orange-800 dark:border-orange-300 dark:bg-orange-950/40 dark:text-orange-200"
                        : "border-border text-zinc-700 dark:text-zinc-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="lang"
                      value={item.value}
                      checked={checked}
                      className="sr-only"
                      onChange={() => replaceFacets({ language: item.value })}
                    />
                    <span className="inline-flex items-center gap-2">
                      <FlagIcon language={item.value} size="sm" />
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <EloBandFilter elo={elo} sensitivity={sensitivity} />
          <button type="submit" className="hud-btn self-start" disabled={pending}>
            {pending ? "Application…" : "Appliquer"}
          </button>
        </div>
      </details>
    </form>
  );
}
