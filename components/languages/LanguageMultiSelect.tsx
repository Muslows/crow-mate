"use client";

import { useId, useState } from "react";
import { FlagIcon } from "@/components/languages/FlagIcon";
import { SPOKEN_LANGUAGES } from "@/lib/constants";
import type { SpokenLanguage } from "@prisma/client";

export function LanguageMultiSelect({
  name = "languages",
  defaultValues = [],
  legend = "Langues parlées",
}: {
  name?: string;
  defaultValues?: SpokenLanguage[];
  legend?: string;
}) {
  const legendId = useId();
  const [selected, setSelected] = useState<SpokenLanguage[]>(defaultValues);

  function toggle(value: SpokenLanguage) {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  return (
    <fieldset className="flex flex-col gap-2" aria-labelledby={legendId}>
      <legend
        id={legendId}
        className="text-sm font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
      >
        {legend}
      </legend>
      {selected.map((language) => (
        <input key={language} type="hidden" name={name} value={language} />
      ))}
      <div className="flex flex-wrap gap-2">
        {SPOKEN_LANGUAGES.map((language) => {
          const active = selected.includes(language.value);
          return (
            <button
              key={language.value}
              type="button"
              onClick={() => toggle(language.value)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] transition-colors duration-200 ${
                active
                  ? "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-400/80 dark:bg-orange-400/15 dark:text-orange-200"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-orange-300 hover:text-orange-800 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-400 dark:hover:border-cyan-300/60 dark:hover:text-cyan-200"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <FlagIcon language={language.value} size="sm" />
                {language.label}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
