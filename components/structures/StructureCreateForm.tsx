"use client";

import { useActionState } from "react";
import { FieldError } from "@/components/forms/FieldError";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { createStructure } from "@/lib/actions/structures";
import {
  emptyActionState,
  firstFieldError,
  type ActionState,
} from "@/lib/actions/state";

export function StructureCreateForm({
  users,
}: {
  users: { id: string; name: string; email: string }[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createStructure,
    emptyActionState,
  );

  return (
    <form action={formAction} className="grid max-w-xl gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400 sm:col-span-2">
        Nom
        <input name="name" required minLength={2} className="hud-input" />
        <FieldError id="structure-name-error" message={firstFieldError(state.fieldErrors, "name")} />
      </label>
      <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
        Tag (2–5 lettres)
        <input
          name="tag"
          required
          minLength={2}
          maxLength={5}
          className="hud-input uppercase"
          placeholder="VIT"
        />
        <FieldError id="structure-tag-error" message={firstFieldError(state.fieldErrors, "tag")} />
      </label>
      <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400 sm:col-span-2">
        Propriétaire
        <select name="ownerId" required className="hud-input">
          <option value="">Choisir un compte</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} · {user.email}
            </option>
          ))}
        </select>
        <FieldError id="structure-owner-error" message={firstFieldError(state.fieldErrors, "ownerId")} />
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
          idleLabel="Créer la structure"
          pendingLabel="Création…"
        />
      </div>
    </form>
  );
}
