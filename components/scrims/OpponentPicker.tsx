"use client";

import { useMemo, useState } from "react";
import { teamDisplayName } from "@/lib/team-name";

export type OpponentOption = {
  id: string;
  name: string;
  org?: { tag: string } | null;
};

export function OpponentPicker({
  teams,
  defaultTeamId = "",
  defaultName = "",
  defaultSr,
}: {
  teams: OpponentOption[];
  defaultTeamId?: string;
  defaultName?: string;
  defaultSr?: number | null;
}) {
  const defaultLabel = useMemo(() => {
    const selected = teams.find((team) => team.id === defaultTeamId);
    if (selected) return teamDisplayName(selected.name, selected.org?.tag);
    return defaultName;
  }, [teams, defaultTeamId, defaultName]);

  const [query, setQuery] = useState(defaultLabel);
  const [selectedId, setSelectedId] = useState(defaultTeamId);
  const [open, setOpen] = useState(false);

  const matches = teams
    .filter((team) =>
      teamDisplayName(team.name, team.org?.tag)
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    .slice(0, 8);

  function choose(team: OpponentOption) {
    setSelectedId(team.id);
    setQuery(teamDisplayName(team.name, team.org?.tag));
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex flex-col gap-1">
        <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
          Équipe adverse
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedId("");
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Rechercher ou saisir un nom…"
            className="hud-input"
            autoComplete="off"
          />
        </label>
        <input type="hidden" name="opponentTeamId" value={selectedId} />
        <input
          type="hidden"
          name="opponentNameInput"
          value={selectedId ? "" : query}
        />
        {open && query.trim() ? (
          <ul className="absolute top-full z-20 mt-1 max-h-56 w-full overflow-y-auto border border-cyan-400/30 bg-[#070b12]">
            {matches.map((team) => (
              <li key={team.id}>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left font-mono text-sm text-zinc-200 hover:bg-cyan-400/10"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(team)}
                >
                  {teamDisplayName(team.name, team.org?.tag)}
                </button>
              </li>
            ))}
            {matches.length === 0 ? (
              <li className="px-3 py-2 text-xs text-zinc-500">
                Aucune équipe plateforme. Le nom saisi sera enregistré en texte
                libre.
              </li>
            ) : (
              <li className="px-3 py-2 text-[0.65rem] uppercase tracking-[0.14em] text-zinc-500">
                Ou laisse le texte libre si l&apos;équipe n&apos;est pas sur la
                plateforme.
              </li>
            )}
          </ul>
        ) : null}
      </div>
      {!selectedId && query.trim().length >= 2 ? (
        <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
          SR de l&apos;équipe adverse
          <input
            type="number"
            name="opponentSrInput"
            defaultValue={defaultSr ?? ""}
            min={0}
            max={5000}
            placeholder="Optionnel · niveau estimé au moment du match"
            className="hud-input font-mono"
          />
        </label>
      ) : null}
    </div>
  );
}
