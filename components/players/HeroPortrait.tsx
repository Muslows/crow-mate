"use client";

import { useState } from "react";
import { findHero } from "@/lib/ow-heroes";

function initials(name: string): string {
  return name
    .replace(/[^A-Za-z0-9]/g, " ")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function HeroPortrait({
  name,
  size = 80,
}: {
  name: string;
  size?: number;
}) {
  const hero = findHero(name);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  return (
    <span
      className="relative block shrink-0 overflow-hidden border border-border bg-zinc-800"
      style={{ width: size, height: size }}
    >
      {status !== "ready" ? (
        <span className="absolute inset-0 flex items-center justify-center font-mono text-[0.65rem] uppercase tracking-wide">
          {status === "loading" ? (
            <span className="h-full w-full animate-pulse bg-zinc-200" />
          ) : (
            initials(name)
          )}
        </span>
      ) : null}
      {hero && status !== "error" ? (
        // Official Blizzard CDN portraits; native img keeps CLS bounded via fixed box.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hero.portrait}
          alt=""
          width={size}
          height={size}
          className={`h-full w-full object-cover ${status === "ready" ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("error")}
        />
      ) : null}
    </span>
  );
}
