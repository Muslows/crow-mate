"use client";

import { useActionState } from "react";
import { BattleTagField } from "@/components/forms/BattleTagField";
import { FieldError } from "@/components/forms/FieldError";
import { SrField } from "@/components/forms/SrField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { HeroPicker } from "@/components/players/HeroPicker";
import { createPlayer, updatePlayer } from "@/lib/actions/players";
import {
  emptyActionState,
  firstFieldError,
  type ActionState,
} from "@/lib/actions/state";
import { PLAYER_ROLES, ROSTER_STATUSES } from "@/lib/constants";
import type { PlayerRole, RankDivision, RosterStatus } from "@prisma/client";

type PlayerFormProps = {
  teamId: string;
  player?: {
    id: string;
    battleTag: string;
    role: PlayerRole;
    secondaryRole: PlayerRole | null;
    sr: number;
    rankDivision: RankDivision;
    status: RosterStatus;
    favoriteHeroes: string[];
    experience: string;
  };
};

export function PlayerForm({ teamId, player }: PlayerFormProps) {
  const action = player ? updatePlayer : createPlayer;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    emptyActionState,
  );

  return (
    <form action={formAction} className="grid max-w-xl gap-4 sm:grid-cols-2">
      {player ? <input type="hidden" name="id" value={player.id} /> : null}
      <input type="hidden" name="teamId" value={teamId} />
      <div className="sm:col-span-2">
        <BattleTagField
          defaultValue={player?.battleTag ?? ""}
          serverError={firstFieldError(state.fieldErrors, "battleTag")}
        />
      </div>
      <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
        Rôle principal
        <select
          name="role"
          defaultValue={player?.role ?? "DPS"}
          className="hud-input"
        >
          {PLAYER_ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
        Rôle secondaire
        <select
          name="secondaryRole"
          defaultValue={player?.secondaryRole ?? ""}
          className="hud-input"
        >
          <option value="">Aucun</option>
          {PLAYER_ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        <FieldError
          id="secondary-role-error"
          message={firstFieldError(state.fieldErrors, "secondaryRole")}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
        Statut
        <select
          name="status"
          defaultValue={player?.status ?? "STARTER"}
          className="hud-input"
        >
          {ROSTER_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
      <SrField
        defaultValue={player?.sr ?? 2000}
        error={firstFieldError(state.fieldErrors, "sr")}
      />
      <HeroPicker
        defaultSelected={player?.favoriteHeroes ?? []}
        error={firstFieldError(state.fieldErrors, "favoriteHeroes")}
      />
      <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400 sm:col-span-2">
        Expérience
        <textarea
          name="experience"
          defaultValue={player?.experience ?? ""}
          rows={4}
          className="hud-input min-h-24"
          placeholder="Anciennes équipes, tournois…"
        />
      </label>
      {state.message ? (
        <p
          role="status"
          className={`sm:col-span-2 text-sm ${state.ok ? "text-lime-400" : "text-orange-400"}`}
        >
          {state.message}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <SubmitButton
          pending={pending}
          idleLabel={player ? "Enregistrer" : "Ajouter au roster"}
          pendingLabel={player ? "Enregistrement…" : "Ajout…"}
        />
      </div>
    </form>
  );
}
