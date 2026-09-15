"use client";

import { useId, useState } from "react";
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
        className="text-sm uppercase tracking-wider text-zinc-400"
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
              className={`border px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] transition ${
                active
                  ? "border-orange-400/80 bg-orange-400/15 text-orange-200"
                  : "border-cyan-400/25 text-zinc-400 hover:border-cyan-300/60 hover:text-cyan-200"
              }`}
            >
              {language.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
