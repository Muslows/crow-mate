import type { SpokenLanguage } from "@prisma/client";
import { FlagIcon } from "@/components/languages/FlagIcon";
import { languageLabel } from "@/lib/languages";

export function LanguageBadges({
  languages,
  size = "md",
}: {
  languages: SpokenLanguage[];
  size?: "md" | "lg";
}) {
  if (languages.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {languages.map((language) => (
        <li key={language}>
          <span
            className="inline-flex items-center gap-2 rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 transition-colors duration-200 dark:border-cyan-400/25 dark:bg-black/40"
            title={languageLabel(language)}
          >
            <FlagIcon language={language} size={size === "lg" ? "lg" : "md"} />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-cyan-800 dark:text-zinc-300">
              {languageLabel(language)}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
