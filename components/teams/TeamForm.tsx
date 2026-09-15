"use client";

import { useActionState } from "react";
import { LanguageSelect } from "@/components/languages/LanguageSelect";
import { FieldError } from "@/components/forms/FieldError";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { createTeam, updateTeam } from "@/lib/actions/teams";
import {
  emptyActionState,
  firstFieldError,
  type ActionState,
} from "@/lib/actions/state";
import { PLATFORMS, STRUCTURES } from "@/lib/constants";
import type { Platform, SpokenLanguage, Structure } from "@prisma/client";

type TeamFormProps = {
  mode: "create" | "edit";
  team?: {
    id: string;
    name: string;
    structure: Structure;
    platform: Platform;
    language: SpokenLanguage;
  };
};

export function TeamForm({ mode, team }: TeamFormProps) {
  const action = mode === "create" ? createTeam : updateTeam;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    emptyActionState,
  );

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {mode === "edit" && team ? (
        <input type="hidden" name="id" value={team.id} />
      ) : null}
      <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
        Nom de l&apos;équipe
        <input
          name="name"
          defaultValue={team?.name}
          required
          minLength={2}
          className="hud-input"
          aria-invalid={Boolean(firstFieldError(state.fieldErrors, "name"))}
          aria-describedby="team-name-error"
        />
        <FieldError
          id="team-name-error"
          message={firstFieldError(state.fieldErrors, "name")}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
        Structure
        <select
          name="structure"
          defaultValue={team?.structure ?? "CLUB"}
          className="hud-input"
        >
          {STRUCTURES.map((structure) => (
            <option key={structure.value} value={structure.value}>
              {structure.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
        Plateforme
        <select
          name="platform"
          defaultValue={team?.platform ?? "PC"}
          className="hud-input"
        >
          {PLATFORMS.map((platform) => (
            <option key={platform.value} value={platform.value}>
              {platform.label}
            </option>
          ))}
        </select>
      </label>
      <LanguageSelect defaultValue={team?.language ?? "FR"} />
      {state.message ? (
        <p
          role="status"
          className={state.ok ? "text-sm text-lime-400" : "text-sm text-orange-400"}
        >
          {state.message}
        </p>
      ) : null}
      <SubmitButton
        pending={pending}
        idleLabel={mode === "create" ? "Créer l'équipe" : "Enregistrer"}
        pendingLabel={mode === "create" ? "Création…" : "Enregistrement…"}
      />
    </form>
  );
}
