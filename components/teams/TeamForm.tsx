"use client";

import { useActionState, useState } from "react";
import { LanguageSelect } from "@/components/languages/LanguageSelect";
import { FieldError } from "@/components/forms/FieldError";
import { SrField } from "@/components/forms/SrField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { createTeam, updateTeam } from "@/lib/actions/teams";
import {
  emptyActionState,
  firstFieldError,
  type ActionState,
} from "@/lib/actions/state";
import { PLATFORMS, STRUCTURES } from "@/lib/constants";
import type { LegalForm, Platform, SpokenLanguage } from "@prisma/client";

type TeamFormProps = {
  mode: "create" | "edit";
  team?: {
    id: string;
    name: string;
    structure: LegalForm;
    platform: Platform;
    language: SpokenLanguage;
    estimatedSr: number;
  };
};

export function TeamForm({ mode, team }: TeamFormProps) {
  const action = mode === "create" ? createTeam : updateTeam;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    emptyActionState,
  );
  const [affiliationMode, setAffiliationMode] = useState<
    "INDEPENDENT" | "CLUB" | "STRUCTURE"
  >("INDEPENDENT");
  const [leadership, setLeadership] = useState<"MANAGER" | "CAPTAIN">("MANAGER");

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
        Forme juridique
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
      <SrField
        name="estimatedSr"
        label="Niveau estimé"
        defaultValue={team?.estimatedSr ?? 2000}
        error={firstFieldError(state.fieldErrors, "estimatedSr")}
      />
      {mode === "create" ? (
        <fieldset className="flex flex-col gap-3 border border-orange-400/30 bg-orange-500/5 p-4">
          <legend className="px-1 text-sm uppercase tracking-wider text-orange-300">
            Profil de gestion
          </legend>
          <p className="text-sm text-zinc-400">
            Choix obligatoire. Il détermine si tu peux jouer dans ce roster.
          </p>
          <label
            className={`flex cursor-pointer flex-col gap-1 border p-3 ${
              leadership === "MANAGER"
                ? "border-cyan-400/60 bg-cyan-400/5"
                : "border-cyan-400/15"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-100">
              <input
                type="radio"
                name="leadership"
                value="MANAGER"
                checked={leadership === "MANAGER"}
                onChange={() => setLeadership("MANAGER")}
              />
              Manager pur
            </span>
            <span className="pl-6 text-sm text-zinc-400">
              Tu gères l&apos;équipe. Tu ne peux pas être joueur dans ce roster.
            </span>
          </label>
          <label
            className={`flex cursor-pointer flex-col gap-1 border p-3 ${
              leadership === "CAPTAIN"
                ? "border-orange-400/70 bg-orange-500/10"
                : "border-cyan-400/15"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-orange-200">
              <input
                type="radio"
                name="leadership"
                value="CAPTAIN"
                checked={leadership === "CAPTAIN"}
                onChange={() => setLeadership("CAPTAIN")}
              />
              Capitaine
            </span>
            <span className="pl-6 text-sm text-zinc-400">
              Tu gères l&apos;équipe et tu restes joueur actif dans le roster.
            </span>
          </label>
          <FieldError
            id="team-leadership-error"
            message={firstFieldError(state.fieldErrors, "leadership")}
          />
        </fieldset>
      ) : null}
      {mode === "create" ? (
        <fieldset className="flex flex-col gap-2 border border-cyan-400/20 p-3">
          <legend className="px-1 text-sm uppercase tracking-wider text-zinc-400">
            Modèle d&apos;organisation
          </legend>
          {(
            [
              ["INDEPENDENT", "Indépendante"],
              ["CLUB", "Club / académie (demande par Team ID parent)"],
              ["STRUCTURE", "Structure pro (demande par Structure ID)"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="radio"
                name="affiliationMode"
                value={value}
                checked={affiliationMode === value}
                onChange={() => setAffiliationMode(value)}
              />
              {label}
            </label>
          ))}
          {affiliationMode !== "INDEPENDENT" ? (
            <label className="mt-2 flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
              {affiliationMode === "CLUB"
                ? "Team ID du club parent"
                : "Structure ID"}
              <input name="affiliationId" className="hud-input" />
              <FieldError
                id="team-affiliation-error"
                message={firstFieldError(state.fieldErrors, "affiliationId")}
              />
            </label>
          ) : (
            <input type="hidden" name="affiliationId" value="" />
          )}
        </fieldset>
      ) : null}
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
