"use client";

import { useActionState } from "react";
import { FieldError } from "@/components/forms/FieldError";
import { SubmitButton } from "@/components/forms/SubmitButton";
import {
  emptyActionState,
  firstFieldError,
  type ActionState,
} from "@/lib/actions/state";
import { updateTeamScrimConfig } from "@/lib/actions/teams";
import { SCRIM_LOBBY_HOSTS, SCRIM_MAP_POOLS } from "@/lib/constants";
import type { TeamScrimConfigValues } from "@/lib/scrim-config";
import { emptyScrimConfig } from "@/lib/scrim-config";

function SwitchRow({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-300 bg-white px-3 py-3 dark:border-zinc-700 dark:bg-zinc-900">
      <span>
        <span className="block text-sm font-medium text-zinc-800 dark:text-zinc-100">
          {label}
        </span>
        <span className="block text-xs text-zinc-600 dark:text-zinc-400">{hint}</span>
      </span>
      <input
        type="checkbox"
        name={name}
        value="on"
        defaultChecked={defaultChecked}
        className="h-5 w-5 shrink-0 accent-orange-600 dark:accent-orange-400"
      />
    </label>
  );
}

function ScrimConfigFields({
  config,
  state,
}: {
  config?: TeamScrimConfigValues | null;
  state: ActionState;
}) {
  const values = config ?? emptyScrimConfig;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Ces réglages sont échangés avec le staff adverse uniquement une fois le
        scrim accepté.
      </p>
      <label className="form-label">
        Discord manager
        <input
          name="discordManager"
          defaultValue={values.discordManager}
          maxLength={80}
          placeholder="manager#1234 ou discord.gg/…"
          className="hud-input"
          aria-describedby="team-discord-error"
        />
        <FieldError
          id="team-discord-error"
          message={firstFieldError(state.fieldErrors, "discordManager")}
        />
      </label>
      <label className="form-label">
        BattleTag contact
        <input
          name="battleTagContact"
          defaultValue={values.battleTagContact}
          maxLength={32}
          placeholder="Player#1234"
          className="hud-input"
          aria-describedby="team-scrim-tag-error"
        />
        <FieldError
          id="team-scrim-tag-error"
          message={firstFieldError(state.fieldErrors, "battleTagContact")}
        />
      </label>
      <SwitchRow
        name="stagger"
        label="Stagger"
        hint="Rappel anti-anti-jeu / regroupement"
        defaultChecked={values.stagger}
      />
      <SwitchRow
        name="povStream"
        label="POV Stream"
        hint="Autorisation de diffuser la vue joueur"
        defaultChecked={values.povStream}
      />
      <label className="form-label">
        Map pool
        <select name="mapPool" defaultValue={values.mapPool} className="hud-input">
          {SCRIM_MAP_POOLS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError
          id="team-mappool-error"
          message={firstFieldError(state.fieldErrors, "mapPool")}
        />
      </label>
      <label className="form-label">
        Hôte du lobby
        <select
          name="lobbyHost"
          defaultValue={values.lobbyHost}
          className="hud-input"
        >
          {SCRIM_LOBBY_HOSTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError
          id="team-host-error"
          message={firstFieldError(state.fieldErrors, "lobbyHost")}
        />
      </label>
    </div>
  );
}

export function TeamScrimConfigForm({
  teamId,
  config,
}: {
  teamId: string;
  config: TeamScrimConfigValues;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateTeamScrimConfig,
    emptyActionState,
  );

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <input type="hidden" name="teamId" value={teamId} />
      <ScrimConfigFields config={config} state={state} />
      {state.message ? (
        <p
          role="status"
          className={
            state.ok
              ? "text-sm text-emerald-700 dark:text-emerald-400"
              : "text-sm text-orange-700 dark:text-orange-400"
          }
        >
          {state.message}
        </p>
      ) : null}
      <SubmitButton
        pending={pending}
        idleLabel="Enregistrer la configuration"
        pendingLabel="Enregistrement…"
      />
    </form>
  );
}
