"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { updateStructureOwner } from "@/lib/actions/structures";
import { emptyActionState, type ActionState } from "@/lib/actions/state";

export function StructureOwnerForm({
  structureId,
  ownerId,
  users,
}: {
  structureId: string;
  ownerId: string;
  users: { id: string; name: string; email: string }[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateStructureOwner,
    emptyActionState,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="id" value={structureId} />
      <label className="flex min-w-[14rem] flex-1 flex-col gap-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
        Owner
        <select name="ownerId" defaultValue={ownerId} className="hud-input">
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} · {user.email}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton
        pending={pending}
        idleLabel="Assigner"
        pendingLabel="Mise à jour…"
      />
      {state.message ? (
        <p
          role="status"
          className={`w-full text-sm ${state.ok ? "text-lime-400" : "text-orange-400"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
