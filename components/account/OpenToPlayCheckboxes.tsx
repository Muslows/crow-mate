"use client";

import { PLAYER_ROLES } from "@/lib/constants";
import type { PlayerRole } from "@prisma/client";

export function OpenToPlayCheckboxes({
  name = "openToPlay",
  selected,
}: {
  name?: string;
  selected: readonly PlayerRole[];
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm uppercase tracking-wider text-zinc-400">
        Open to Play
      </legend>
      <p className="text-sm text-zinc-500">
        Coche un ou plusieurs rôles compétitifs pour lesquels tu recherches une
        équipe.
      </p>
      <div className="flex flex-col gap-2">
        {PLAYER_ROLES.map((role) => (
          <label
            key={role.value}
            className="flex cursor-pointer items-center gap-3 border border-cyan-400/20 px-3 py-2 text-sm text-zinc-200"
          >
            <input
              type="checkbox"
              name={name}
              value={role.value}
              defaultChecked={selected.includes(role.value)}
            />
            {role.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
