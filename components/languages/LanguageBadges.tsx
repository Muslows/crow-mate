import type { SpokenLanguage } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { languageLabel } from "@/lib/languages";

export function LanguageBadges({
  languages,
  tone = "cyan",
}: {
  languages: SpokenLanguage[];
  tone?: "cyan" | "orange" | "green" | "muted";
}) {
  if (languages.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {languages.map((language) => (
        <li key={language}>
          <Badge tone={tone}>{languageLabel(language)}</Badge>
        </li>
      ))}
    </ul>
  );
}
