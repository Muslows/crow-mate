import { lobbyHostLabel, mapPoolLabel } from "@/lib/scrim-config";
import type { TeamScrimConfigValues } from "@/lib/scrim-config";
import { teamDisplayName } from "@/lib/team-name";

function Flag({ on, label }: { on: boolean; label: string }) {
  return (
    <p className="flex items-center justify-between gap-3 text-sm">
      <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      <span
        className={
          on
            ? "font-semibold text-emerald-700 dark:text-emerald-400"
            : "font-semibold text-zinc-500 dark:text-zinc-500"
        }
      >
        {on ? "ON" : "OFF"}
      </span>
    </p>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex flex-col gap-0.5 text-sm">
      <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      <span className="font-medium text-zinc-900 dark:text-zinc-100">
        {value.trim() ? value : "Non renseigné"}
      </span>
    </p>
  );
}

export function ScrimStaffExchange({
  title,
  highlight,
  team,
  config,
}: {
  title: string;
  highlight?: boolean;
  team: {
    name: string;
    estimatedSr: number;
    org: { name: string; tag: string } | null;
    parentTeam: { name: string } | null;
  };
  config: TeamScrimConfigValues;
}) {
  return (
    <article
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-orange-300 bg-orange-50 dark:border-orange-500/40 dark:bg-orange-950/20"
          : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
      }`}
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
        {title}
      </p>
      <h3 className="mt-2 text-xl font-semibold uppercase tracking-wide text-zinc-900 dark:text-zinc-50">
        {teamDisplayName(team.name, team.org?.tag)}
      </h3>
      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
        {team.estimatedSr > 0 ? `${team.estimatedSr} SR estimé` : "SR non renseigné"}
      </p>
      {team.org ? (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Structure : {team.org.name} ({team.org.tag})
        </p>
      ) : (
        <p className="mt-1 text-sm text-zinc-500">Pas de structure parente</p>
      )}
      {team.parentTeam ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Club parent : {team.parentTeam.name}
        </p>
      ) : null}
      <div className="mt-4 flex flex-col gap-3 border-t border-zinc-200 pt-3 dark:border-zinc-700">
        <Row label="Discord manager" value={config.discordManager} />
        <Row label="BattleTag contact" value={config.battleTagContact} />
        <Flag on={config.stagger} label="Stagger" />
        <Flag on={config.povStream} label="POV Stream" />
        <Row label="Map pool" value={mapPoolLabel(config.mapPool)} />
        <Row
          label="Hôte du lobby (point de vue de cette équipe)"
          value={lobbyHostLabel(config.lobbyHost)}
        />
      </div>
    </article>
  );
}
