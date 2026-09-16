"use client";

import { EloBandFilter } from "@/components/forms/EloBandFilter";
import { PLATFORMS } from "@/lib/constants";
import type { Platform } from "@prisma/client";

export function TeamFilters({
  platform,
  elo,
  sensitivity,
}: {
  platform?: Platform | "";
  elo?: string;
  sensitivity?: string;
}) {
  return (
    <form className="flex flex-col gap-4" method="get">
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
          Plateforme
          <select
            name="platform"
            className="hud-input"
            defaultValue={platform ?? ""}
          >
            <option value="">Toutes</option>
            {PLATFORMS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="hud-btn self-end">
          Filtrer
        </button>
      </div>
      <EloBandFilter elo={elo} sensitivity={sensitivity} />
    </form>
  );
}
