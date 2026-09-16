"use client";

import { useActionState, useState } from "react";
import { createScrimReport } from "@/lib/actions/scrims";
import { IntensityPills } from "@/components/scrims/IntensityPills";
import { OpponentPicker, type OpponentOption } from "@/components/scrims/OpponentPicker";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { emptyActionState, type ActionState } from "@/lib/actions/state";
import { OPPONENT_BEHAVIORS } from "@/lib/fair-play";
import { OW_MAPS } from "@/lib/ow-maps";
import type { ScrimMapOutcome } from "@prisma/client";

type MapDraft = {
  key: string;
  mapName: string;
  outcome: ScrimMapOutcome;
  intensity: number;
};

function emptyMap(key = "map-0"): MapDraft {
  return {
    key,
    mapName: OW_MAPS[0].value,
    outcome: "WIN",
    intensity: 2,
  };
}

export function ScrimReportForm({
  teamId,
  opponents,
}: {
  teamId: string;
  opponents: OpponentOption[];
}) {
  const [maps, setMaps] = useState<MapDraft[]>([emptyMap()]);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createScrimReport,
    emptyActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="teamId" value={teamId} />
      <OpponentPicker teams={opponents} />
      <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
        Date
        <input type="date" name="playedAt" className="hud-input font-mono" />
      </label>
      <div className="flex flex-col gap-3">
        {maps.map((map, index) => (
          <fieldset
            key={map.key}
            className="grid gap-3 border border-cyan-400/20 p-3 sm:grid-cols-[1.4fr_1fr_1.6fr_auto]"
          >
            <legend className="px-1 text-xs uppercase tracking-[0.16em] text-orange-300">
              Map {index + 1}
            </legend>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
              Map
              <select
                name="mapName"
                value={map.mapName}
                onChange={(event) =>
                  setMaps((current) =>
                    current.map((item) =>
                      item.key === map.key
                        ? { ...item, mapName: event.target.value }
                        : item,
                    ),
                  )
                }
                className="hud-input"
              >
                {OW_MAPS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.group} · {option.value}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
              Issue
              <select
                name="outcome"
                value={map.outcome}
                onChange={(event) => {
                  const outcome = event.target.value as ScrimMapOutcome;
                  setMaps((current) =>
                    current.map((item) =>
                      item.key === map.key ? { ...item, outcome } : item,
                    ),
                  );
                }}
                className="hud-input"
              >
                <option value="WIN">Gagné</option>
                <option value="LOSS">Perdu</option>
              </select>
            </label>
            <IntensityPills
              outcome={map.outcome}
              value={map.intensity}
              onChange={(intensity) =>
                setMaps((current) =>
                  current.map((item) =>
                    item.key === map.key ? { ...item, intensity } : item,
                  ),
                )
              }
            />
            <button
              type="button"
              className="hud-btn-ghost self-end"
              disabled={maps.length === 1 || pending}
              onClick={() =>
                setMaps((current) => current.filter((item) => item.key !== map.key))
              }
            >
              Retirer
            </button>
          </fieldset>
        ))}
      </div>
      <button
        type="button"
        className="hud-btn-ghost self-start"
        disabled={pending || maps.length >= 12}
        onClick={() =>
          setMaps((current) => [
            ...current,
            emptyMap(`map-${current.length}-${Date.now()}`),
          ])
        }
      >
        Ajouter une map
      </button>
      <fieldset className="flex flex-col gap-3 border border-cyan-400/20 p-3">
        <legend className="px-1 text-xs uppercase tracking-[0.16em] text-orange-300">
          Évaluation de l&apos;adversaire
        </legend>
        <p className="text-sm text-zinc-400">
          Obligatoire. Sert uniquement à l&apos;index fair-play public de
          l&apos;équipe liée ; le détail du rapport reste privé au staff.
        </p>
        <div className="grid gap-2">
          {OPPONENT_BEHAVIORS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 border border-cyan-400/15 px-3 py-2 text-sm text-zinc-200 has-[:checked]:border-cyan-400/60"
            >
              <input
                type="radio"
                name="opponentBehavior"
                value={option.value}
                required
                className="mt-1"
              />
              <span>
                <span className="font-semibold uppercase tracking-wide">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-500">
                  {option.hint}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {state.message ? (
        <p
          role="status"
          className={`text-sm ${state.ok ? "text-lime-400" : "text-orange-400"}`}
        >
          {state.message}
        </p>
      ) : null}
      <SubmitButton
        pending={pending}
        idleLabel="Enregistrer le scrim"
        pendingLabel="Enregistrement…"
      />
    </form>
  );
}
