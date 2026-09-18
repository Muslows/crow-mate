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
      <legend className="text-sm font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
        Open to Play
      </legend>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Coche un ou plusieurs rôles compétitifs pour lesquels tu recherches une
        équipe.
      </p>
      <div className="flex flex-col gap-2">
        {PLAYER_ROLES.map((role) => (
          <label
            key={role.value}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 transition-colors duration-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <input
              type="checkbox"
              name={name}
              value={role.value}
              defaultChecked={selected.includes(role.value)}
              className="h-4 w-4 shrink-0 accent-orange-600 dark:accent-orange-400"
            />
            {role.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
