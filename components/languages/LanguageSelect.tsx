"use client";

import { useState } from "react";
import { FlagIcon } from "@/components/languages/FlagIcon";
import { SPOKEN_LANGUAGES } from "@/lib/constants";
import type { SpokenLanguage } from "@prisma/client";

export function LanguageSelect({
  name = "language",
  defaultValue = "FR",
  label = "Langue officielle",
}: {
  name?: string;
  defaultValue?: SpokenLanguage;
  label?: string;
}) {
  const [value, setValue] = useState<SpokenLanguage>(defaultValue);

  return (
    <label className="flex flex-col gap-1 text-sm font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
      {label}
      <span className="flex items-center gap-3">
        <FlagIcon language={value} size="md" />
        <select
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value as SpokenLanguage)}
          className="hud-input flex-1"
        >
          {SPOKEN_LANGUAGES.map((language) => (
            <option key={language.value} value={language.value}>
              {language.label} ({language.iso.toUpperCase()})
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}
