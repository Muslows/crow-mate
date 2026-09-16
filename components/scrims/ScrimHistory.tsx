import { Panel } from "@/components/ui/Panel";
import { DeleteScrimButton } from "@/components/scrims/DeleteScrimButton";
import { ScrimOpponentEditor } from "@/components/scrims/ScrimOpponentEditor";
import { ScrimPerformanceSummary } from "@/components/scrims/ScrimPerformanceSummary";
import type { OpponentOption } from "@/components/scrims/OpponentPicker";
import type { TeamScrim } from "@/lib/data/scrims";
import { BEHAVIOR_LABELS } from "@/lib/fair-play";
import {
  averageIntensity,
  intensityCaption,
  mapRecordLine,
  opponentDisplayName,
} from "@/lib/scrim-intensity";

export function ScrimHistory({
  teamId,
  scrims,
  opponents,
}: {
  teamId: string;
  scrims: TeamScrim[];
  opponents: OpponentOption[];
}) {
  if (scrims.length === 0) {
    return (
      <p className="text-sm text-zinc-400">Aucun scrim enregistré pour le moment.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {scrims.map((scrim) => {
        const wins = scrim.maps.filter((map) => map.outcome === "WIN").length;
        const losses = scrim.maps.length - wins;
        const avg = averageIntensity(scrim.maps.map((map) => map.intensity));
        const name = opponentDisplayName({
          linkedName: scrim.opponentTeam?.name,
          linkedTag: scrim.opponentTeam?.org?.tag,
          nameInput: scrim.opponentNameInput,
        });
        return (
          <li key={scrim.id}>
            <Panel>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-cyan-400">
                    {scrim.playedAt.toISOString().slice(0, 10)} · vs
                  </p>
                  <h3 className="mt-1 text-xl uppercase">{name}</h3>
                  <p className="mt-1 font-mono text-sm text-zinc-400">
                    {mapRecordLine({ wins, losses })}
                    {avg ? ` · intensité moy. ${avg}` : ""}
                    {scrim.opponentSrInput != null
                      ? ` · SR adverse ${scrim.opponentSrInput}`
                      : ""}{" "}
                    · {BEHAVIOR_LABELS[scrim.opponentBehavior]} · saisi par{" "}
                    {scrim.createdBy.name}
                    {scrim.opponentTeamId ? " · liée" : " · texte libre"}
                  </p>
                </div>
                <DeleteScrimButton scrimId={scrim.id} />
              </div>
              <div className="mt-3">
                <ScrimOpponentEditor
                  scrimId={scrim.id}
                  teamId={teamId}
                  opponents={opponents}
                  defaultTeamId={scrim.opponentTeamId ?? ""}
                  defaultName={scrim.opponentNameInput}
                  defaultSr={scrim.opponentSrInput}
                />
              </div>
              <ScrimPerformanceSummary maps={scrim.maps} />
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {scrim.maps.map((map) => (
                  <li
                    key={map.id}
                    className={`border px-3 py-2 font-mono text-xs ${
                      map.outcome === "WIN"
                        ? "border-lime-400/40 text-lime-200"
                        : "border-red-400/40 text-red-200"
                    }`}
                  >
                    {map.mapName} · {map.outcome === "WIN" ? "Gagné" : "Perdu"} ·{" "}
                    {intensityCaption(map.outcome, map.intensity)}
                  </li>
                ))}
              </ul>
            </Panel>
          </li>
        );
      })}
    </ul>
  );
}
