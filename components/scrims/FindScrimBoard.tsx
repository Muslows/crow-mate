"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchScrimMatches } from "@/lib/actions/matchmaking";
import { ScrimMatchList } from "@/components/scrims/ScrimMatchList";
import { SrToleranceFilter } from "@/components/scrims/SrToleranceFilter";
import { srBand, type MatchSlotKey } from "@/lib/scrim-slots";
import type { ScrimMatchCandidate } from "@/lib/data/scrim-match";

type MatchResult = {
  estimatedSr: number;
  band: { min: number; max: number };
  ourSlots: MatchSlotKey[];
  matches: ScrimMatchCandidate[];
};

export function FindScrimBoard({
  teamId,
  weekStartDate,
  initialTolerance,
  initialResult,
}: {
  teamId: string;
  weekStartDate: string;
  initialTolerance: number;
  initialResult: MatchResult;
}) {
  const router = useRouter();
  const [tolerance, setTolerance] = useState(initialTolerance);
  const [result, setResult] = useState(initialResult);
  const [pending, setPending] = useState(false);
  const skipFirstFetch = useRef(true);
  const liveBand = srBand(initialResult.estimatedSr, tolerance);

  useEffect(() => {
    const params = new URLSearchParams();
    if (tolerance !== 200) params.set("tol", String(tolerance));
    const query = params.toString();
    router.replace(
      `/manage/teams/${teamId}/find${query ? `?${query}` : ""}`,
      { scroll: false },
    );

    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }

    let cancelled = false;
    const handle = window.setTimeout(async () => {
      setPending(true);
      try {
        const next = await searchScrimMatches({
          teamId,
          weekStartIso: weekStartDate,
          tolerance,
        });
        if (!cancelled) setResult(next);
      } finally {
        if (!cancelled) setPending(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [tolerance, teamId, weekStartDate, router]);

  return (
    <div className="flex flex-col gap-6">
      <SrToleranceFilter
        tolerance={tolerance}
        estimatedSr={initialResult.estimatedSr}
        min={liveBand.min}
        max={liveBand.max}
        pending={pending}
        onToleranceChange={setTolerance}
      />
      {result.ourSlots.length === 0 ? (
        <p className="text-sm text-orange-300">
          Valide au moins un créneau Scrim 20h ou 21h sur le planning officiel
          pour lancer la recherche.
        </p>
      ) : null}
      <div className={pending ? "opacity-60" : undefined}>
        <ScrimMatchList
          fromTeamId={teamId}
          weekStartDate={weekStartDate}
          matches={result.matches}
        />
      </div>
    </div>
  );
}
