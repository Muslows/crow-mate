"use client";

import { useActionState, useEffect } from "react";
import { BattleTagField } from "@/components/forms/BattleTagField";
import { FieldError } from "@/components/forms/FieldError";
import { LanguageMultiSelect } from "@/components/languages/LanguageMultiSelect";
import { SrField } from "@/components/forms/SrField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { HeroPicker } from "@/components/players/HeroPicker";
import { updatePlayerProfile } from "@/lib/actions/profile";
import {
  emptyActionState,
  firstFieldError,
  type ActionState,
} from "@/lib/actions/state";
import { PLAYER_ROLES, RECRUITMENT_STATUSES } from "@/lib/constants";
import type { PlayerRole, RecruitmentStatus, SpokenLanguage } from "@prisma/client";

type ProfileFormProps = {
  profile: {
    battleTag?: string;
    sr: number;
    primaryRole: PlayerRole;
    secondaryRole: PlayerRole | null;
    favoriteHeroes: string[];
    experience: string;
    recruitmentStatus?: RecruitmentStatus;
    languages?: SpokenLanguage[];
  };
  onSaved?: () => void;
};

export function ProfileForm({ profile, onSaved }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updatePlayerProfile,
    emptyActionState,
  );

  useEffect(() => {
    if (state.ok) onSaved?.();
  }, [state, onSaved]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <BattleTagField
        defaultValue={profile.battleTag ?? ""}
        serverError={firstFieldError(state.fieldErrors, "battleTag")}
      />
      <SrField
        defaultValue={profile.sr}
        error={firstFieldError(state.fieldErrors, "sr")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
          Rôle principal
          <select
            name="primaryRole"
            defaultValue={profile.primaryRole}
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
            defaultValue={profile.secondaryRole ?? ""}
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
      </div>
      <HeroPicker
        defaultSelected={profile.favoriteHeroes}
        error={firstFieldError(state.fieldErrors, "favoriteHeroes")}
      />
      <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
        Statut de recrutement
        <select
          name="recruitmentStatus"
          defaultValue={profile.recruitmentStatus ?? "LOOKING"}
          className="hud-input"
        >
          {RECRUITMENT_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
      <LanguageMultiSelect defaultValues={profile.languages ?? []} />
      <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
        Expérience
        <textarea
          name="experience"
          defaultValue={profile.experience}
          rows={5}
          placeholder="Anciennes équipes, tournois, rôle en scrim…"
          className="hud-input min-h-28"
        />
      </label>
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
        idleLabel="Enregistrer le profil"
        pendingLabel="Enregistrement…"
      />
    </form>
  );
}
