import type { SpokenLanguage } from "@prisma/client";
import { SPOKEN_LANGUAGES, labelFor } from "@/lib/constants";

const languageValues = new Set<string>(
  SPOKEN_LANGUAGES.map((item) => item.value),
);

export function isSpokenLanguage(value: string): value is SpokenLanguage {
  return languageValues.has(value);
}

export function parseLanguageParams(
  value?: string | string[],
): SpokenLanguage[] {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  const unique = new Set<SpokenLanguage>();
  for (const item of raw) {
    if (isSpokenLanguage(item)) unique.add(item);
  }
  return [...unique];
}

export function parseSpokenLanguageParam(
  value?: string,
): SpokenLanguage | undefined {
  if (!value) return undefined;
  return isSpokenLanguage(value) ? value : undefined;
}

export function parseQueryParam(value?: string): string | undefined {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return undefined;
  return trimmed.slice(0, 64);
}

export function languageLabel(value: SpokenLanguage): string {
  return labelFor(SPOKEN_LANGUAGES, value);
}

export function languageIso(value: SpokenLanguage): string {
  return SPOKEN_LANGUAGES.find((item) => item.value === value)?.iso ?? "un";
}

export function languageFlagSrc(value: SpokenLanguage, width = 40): string {
  const iso = languageIso(value);
  return `https://flagcdn.com/w${width}/${iso}.png`;
}

export function languageFlagSvg(value: SpokenLanguage): string {
  return `https://flagcdn.com/${languageIso(value)}.svg`;
}
