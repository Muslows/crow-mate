"use client";

import { useActionState } from "react";
import { FieldError } from "@/components/forms/FieldError";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { updateMembershipRoles } from "@/lib/actions/players";
import {
  emptyActionState,
  firstFieldError,
  type ActionState,
} from "@/lib/actions/state";
import { PLAYER_ROLES, TEAM_ORG_ROLES } from "@/lib/constants";
import type { PlayerRole, TeamOrgRole } from "@prisma/client";

export function MembershipRolesForm({
  teamId,
  membershipId,
  playerRole,
  orgRoles,
}: {
  teamId: string;
  membershipId: string;
  playerRole: PlayerRole | null;
  orgRoles: TeamOrgRole[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateMembershipRoles,
    emptyActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="membershipId" value={membershipId} />
      <input type="hidden" name="teamId" value={teamId} />
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Rôle in-game
        <select
          name="playerRole"
          defaultValue={playerRole ?? ""}
          className="hud-input"
        >
          <option value="">Aucun (staff uniquement)</option>
          {PLAYER_ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        <FieldError
          id="player-role-error"
          message={firstFieldError(state.fieldErrors, "playerRole")}
        />
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Rôles organisationnels
        </legend>
        {TEAM_ORG_ROLES.map((role) => (
          <label
            key={role.value}
            className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200"
          >
            <input
              type="checkbox"
              name="orgRoles"
              value={role.value}
              defaultChecked={orgRoles.includes(role.value)}
              className="h-4 w-4 accent-orange-600 dark:accent-orange-400"
            />
            {role.label}
          </label>
        ))}
      </fieldset>
      {state.message ? (
        <p
          role="status"
          className={`text-sm ${state.ok ? "text-emerald-700 dark:text-lime-400" : "text-orange-600 dark:text-orange-400"}`}
        >
          {state.message}
        </p>
      ) : null}
      <SubmitButton
        pending={pending}
        idleLabel="Enregistrer les rôles"
        pendingLabel="Enregistrement…"
      />
    </form>
  );
}
