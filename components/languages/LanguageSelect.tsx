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
  return (
    <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
      {label}
      <select name={name} defaultValue={defaultValue} className="hud-input">
        {SPOKEN_LANGUAGES.map((language) => (
          <option key={language.value} value={language.value}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}
