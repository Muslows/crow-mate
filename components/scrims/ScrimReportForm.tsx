"use client";

import { useActionState, useState } from "react";
import { createScrimReport } from "@/lib/actions/scrims";
import { IntensityPills } from "@/components/scrims/IntensityPills";
import { MapPickerModal } from "@/components/scrims/MapPickerModal";
import { OpponentPicker, type OpponentOption } from "@/components/scrims/OpponentPicker";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { emptyActionState, type ActionState } from "@/lib/actions/state";
import { OPPONENT_BEHAVIORS } from "@/lib/fair-play";
import { OW_MAPS, mapScreenshotUrl } from "@/lib/ow-maps";
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
  const [pickerKey, setPickerKey] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createScrimReport,
    emptyActionState,
  );
  const picking = maps.find((item) => item.key === pickerKey);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <input type="hidden" name="teamId" value={teamId} />
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">1. Adversaire</h2>
        <OpponentPicker teams={opponents} />
        <label className="form-label max-w-xs">
          Date
          <input type="date" name="playedAt" className="hud-input" />
        </label>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">2. Maps</h2>
        <div className="flex flex-col gap-3">
          {maps.map((map, index) => (
            <fieldset
              key={map.key}
              className="grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-[1.2fr_1fr_1.4fr_auto]"
            >
              <legend className="px-1 text-sm font-medium text-zinc-400">
                Map {index + 1}
              </legend>
              <input type="hidden" name="mapName" value={map.mapName} />
              <button
                type="button"
                onClick={() => setPickerKey(map.key)}
                className="overflow-hidden rounded-xl border border-border text-left"
              >
                <span className="relative block h-20 bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mapScreenshotUrl(map.mapName)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-surface/50 px-2 py-1 text-xs font-medium text-white">
                    {map.mapName}
                  </span>
                </span>
              </button>
              <label className="form-label">
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
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">3. Intensité & fair-play</h2>
        <fieldset className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
          <legend className="px-1 text-sm font-medium text-zinc-400">
            Évaluation de l&apos;adversaire
          </legend>
          <p className="text-sm text-zinc-500">
            Obligatoire. Sert à l&apos;index fair-play public ; le détail du
            rapport reste privé au staff.
          </p>
          <div className="grid gap-2">
            {OPPONENT_BEHAVIORS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-border px-3 py-2 text-sm text-zinc-200 has-[:checked]:border-orange-300 has-[:checked]:bg-orange-950/40"
              >
                <input
                  type="radio"
                  name="opponentBehavior"
                  value={option.value}
                  required
                  className="mt-1"
                />
                <span>
                  <span className="font-semibold">{option.label}</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">
                    {option.hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>
      {state.message ? (
        <p
          role="status"
          className={`text-sm ${state.ok ? "text-emerald-700" : "text-orange-400"}`}
        >
          {state.message}
        </p>
      ) : null}
      <SubmitButton
        pending={pending}
        idleLabel="Enregistrer le scrim"
        pendingLabel="Enregistrement…"
      />
      <MapPickerModal
        open={Boolean(picking)}
        value={picking?.mapName ?? OW_MAPS[0].value}
        onClose={() => setPickerKey(null)}
        onSelect={(mapName) => {
          if (!pickerKey) return;
          setMaps((current) =>
            current.map((item) =>
              item.key === pickerKey ? { ...item, mapName } : item,
            ),
          );
        }}
      />
    </form>
  );
}
