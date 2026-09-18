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
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      {mode === "edit" && team ? (
        <input type="hidden" name="id" value={team.id} />
      ) : null}
      <details className="rounded-2xl border border-border bg-surface p-4" open>
        <summary className="cursor-pointer text-base font-semibold">Identité</summary>
        <div className="mt-4 flex flex-col gap-4">
      <label className="form-label">
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
      <label className="form-label">
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
      <label className="form-label">
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
        </div>
      </details>
      <details className="rounded-2xl border border-border bg-surface p-4" open>
        <summary className="cursor-pointer text-base font-semibold">Compétitif</summary>
        <div className="mt-4">
      <SrField
        name="estimatedSr"
        label="Niveau estimé"
        defaultValue={team?.estimatedSr ?? 2000}
        error={firstFieldError(state.fieldErrors, "estimatedSr")}
      />
        </div>
      </details>
      {mode === "create" ? (
        <details className="rounded-2xl border border-border bg-surface p-4" open>
        <summary className="cursor-pointer text-base font-semibold">Recrutement</summary>
        <div className="mt-4 flex flex-col gap-4">
        <fieldset className="flex flex-col gap-3 rounded-xl border border-border p-4">
          <legend className="px-1 text-sm font-medium text-zinc-300">
            Profil de gestion
          </legend>
          <p className="text-sm text-zinc-500">
            Choix obligatoire. Il détermine si tu peux jouer dans ce roster.
          </p>
          <label
            className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3 ${
              leadership === "MANAGER"
                ? "border-orange-300 bg-orange-950/40"
                : "border-border"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <input
                type="radio"
                name="leadership"
                value="MANAGER"
                checked={leadership === "MANAGER"}
                onChange={() => setLeadership("MANAGER")}
              />
              Manager pur
            </span>
            <span className="pl-6 text-sm text-zinc-500">
              Tu gères l&apos;équipe. Tu ne peux pas être joueur dans ce roster.
            </span>
          </label>
          <label
            className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3 ${
              leadership === "CAPTAIN"
                ? "border-orange-300 bg-orange-950/40"
                : "border-border"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <input
                type="radio"
                name="leadership"
                value="CAPTAIN"
                checked={leadership === "CAPTAIN"}
                onChange={() => setLeadership("CAPTAIN")}
              />
              Capitaine
            </span>
            <span className="pl-6 text-sm text-zinc-500">
              Tu gères l&apos;équipe et tu restes joueur actif dans le roster.
            </span>
          </label>
          <FieldError
            id="team-leadership-error"
            message={firstFieldError(state.fieldErrors, "leadership")}
          />
        </fieldset>
        <fieldset className="flex flex-col gap-2 rounded-xl border border-border p-3">
          <legend className="px-1 text-sm font-medium text-zinc-300">
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
            <label className="mt-2 form-label">
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
        </div>
        </details>
      ) : null}
      {state.message ? (
        <p
          role="status"
          className={state.ok ? "text-sm text-emerald-700" : "text-sm text-orange-400"}
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
