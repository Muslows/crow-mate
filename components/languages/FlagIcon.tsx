"use client";

import { useEffect, useState } from "react";
import type { SpokenLanguage } from "@prisma/client";
import {
  languageFlagSrc,
  languageFlagSvg,
  languageIso,
  languageLabel,
} from "@/lib/languages";

export function FlagIcon({
  language,
  size = "md",
}: {
  language: SpokenLanguage;
  size?: "sm" | "md" | "lg";
}) {
  const pixels = size === "lg" ? 48 : size === "sm" ? 20 : 28;
  const iso = languageIso(language);
  const label = languageLabel(language);
  const svgSrc = languageFlagSvg(language);
  const pngSrc = languageFlagSrc(language, pixels * 2);
  const [src, setSrc] = useState(svgSrc);

  useEffect(() => {
    setSrc(svgSrc);
  }, [svgSrc]);

  return (
    // Native img: flagcdn SVG with PNG fallback — reliable on Windows vs emoji.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Drapeau ${label}`}
      width={pixels}
      height={Math.round(pixels * 0.75)}
      className="inline-block shrink-0 border border-cyan-400/20 object-cover"
      loading="lazy"
      decoding="async"
      data-iso={iso}
      onError={() => {
        if (src !== pngSrc) setSrc(pngSrc);
      }}
    />
  );
}
