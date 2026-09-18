"use client";

import { useActionState, useEffect } from "react";
import { BattleTagField } from "@/components/forms/BattleTagField";
import { FieldError } from "@/components/forms/FieldError";
import { LanguageMultiSelect } from "@/components/languages/LanguageMultiSelect";
import { SrField } from "@/components/forms/SrField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { HeroPicker } from "@/components/players/HeroPicker";
import { OpenToPlayCheckboxes } from "@/components/account/OpenToPlayCheckboxes";
import { updatePlayerProfile } from "@/lib/actions/profile";
import {
  emptyActionState,
  firstFieldError,
  type ActionState,
} from "@/lib/actions/state";
import { RECRUITMENT_STATUSES } from "@/lib/constants";
import type { PlayerRole, RecruitmentStatus, SpokenLanguage } from "@prisma/client";

type ProfileFormProps = {
  profile: {
    battleTag?: string;
    displayName?: string;
    sr: number;
    openToPlay?: PlayerRole[];
    battleTagPublic?: boolean;
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
    <form
      action={formAction}
      className="flex flex-col gap-6"
      key={`${profile.battleTag}|${profile.displayName ?? ""}`}
    >
      <details className="rounded-2xl border border-border bg-surface p-4" open>
        <summary className="cursor-pointer text-base font-semibold text-foreground">
          Identité
        </summary>
        <div className="mt-4 flex flex-col gap-4">
      <BattleTagField
        defaultValue={profile.battleTag ?? ""}
        serverError={firstFieldError(state.fieldErrors, "battleTag")}
      />
      <label className="form-label">
        Pseudonyme
        <input
          name="displayName"
          defaultValue={profile.displayName ?? ""}
          maxLength={32}
          placeholder="Striker"
          className="hud-input"
          aria-describedby="profile-displayname-error"
        />
        <FieldError
          id="profile-displayname-error"
          message={firstFieldError(state.fieldErrors, "displayName")}
        />
      </label>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 transition-colors duration-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
        <input
          type="checkbox"
          name="battleTagPublic"
          value="on"
          defaultChecked={Boolean(profile.battleTagPublic)}
          className="h-4 w-4 shrink-0 accent-orange-600 dark:accent-orange-400"
        />
        Rendre mon BattleTag public
      </label>
      <LanguageMultiSelect defaultValues={profile.languages ?? []} />
        </div>
      </details>
      <details className="rounded-2xl border border-border bg-surface p-4">
        <summary className="cursor-pointer text-base font-semibold text-foreground">
          Compétitif
        </summary>
        <div className="mt-4 flex flex-col gap-4">
      <SrField
        defaultValue={profile.sr}
        error={firstFieldError(state.fieldErrors, "sr")}
      />
      <OpenToPlayCheckboxes selected={profile.openToPlay ?? []} />
      <HeroPicker
        defaultSelected={profile.favoriteHeroes}
        error={firstFieldError(state.fieldErrors, "favoriteHeroes")}
      />
        </div>
      </details>
      <details className="rounded-2xl border border-border bg-surface p-4">
        <summary className="cursor-pointer text-base font-semibold text-foreground">
          Recrutement
        </summary>
        <div className="mt-4 flex flex-col gap-4">
      <label className="form-label">
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
      <label className="form-label">
        Expérience
        <textarea
          name="experience"
          defaultValue={profile.experience}
          rows={5}
          placeholder="Anciennes équipes, tournois, rôle en scrim…"
          className="hud-input min-h-28"
        />
      </label>
        </div>
      </details>
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
        idleLabel="Enregistrer le profil"
        pendingLabel="Enregistrement…"
      />
    </form>
  );
}
