"use client";

import { useActionState } from "react";
import {
  addStructureStaff,
  assignTeamManager,
  removeStructureStaff,
} from "@/lib/actions/staff";
import { emptyActionState, firstFieldError, type ActionState } from "@/lib/actions/state";
import { FieldError } from "@/components/forms/FieldError";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { STAFF_ROLES, labelFor } from "@/lib/constants";
import type { StaffRole } from "@prisma/client";

export function StaffManageForm({
  structureId,
  staff,
}: {
  structureId: string;
  staff: {
    id: string;
    role: StaffRole;
    user: { name: string; email: string };
  }[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addStructureStaff,
    emptyActionState,
  );

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex max-w-lg flex-col gap-3">
        <input type="hidden" name="structureId" value={structureId} />
        <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
          User ID
          <input name="userId" className="hud-input" required minLength={8} />
          <FieldError message={firstFieldError(state.fieldErrors, "userId")} id="staff-userid-error" />
        </label>
        <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
          Rôle
          <select name="role" className="hud-input" defaultValue="COACH">
            {STAFF_ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </label>
        {state.message ? (
          <p className={`text-sm ${state.ok ? "text-lime-400" : "text-orange-400"}`}>
            {state.message}
          </p>
        ) : null}
        <SubmitButton
          pending={pending}
          idleLabel="Ajouter au staff"
          pendingLabel="Ajout…"
        />
      </form>
      {staff.length === 0 ? (
        <p className="text-sm text-zinc-400">Aucun staff pour le moment.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {staff.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-2 border border-cyan-400/20 px-3 py-2"
            >
              <p className="text-sm">
                <span className="font-semibold uppercase">{member.user.name}</span>
                <span className="ml-2 font-mono text-xs text-zinc-500">
                  {labelFor(STAFF_ROLES, member.role)}
                </span>
              </p>
              <RemoveStaffButton staffId={member.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RemoveStaffButton({ staffId }: { staffId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    removeStructureStaff,
    emptyActionState,
  );
  return (
    <form action={formAction}>
      <input type="hidden" name="staffId" value={staffId} />
      <SubmitButton
        pending={pending}
        idleLabel="Retirer"
        pendingLabel="…"
        className="hud-btn-ghost disabled:opacity-60"
      />
      {state.message && !state.ok ? (
        <p className="text-xs text-orange-400">{state.message}</p>
      ) : null}
    </form>
  );
}

export function AssignManagerForm({
  structureId,
  teamId,
}: {
  structureId: string;
  teamId: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    assignTeamManager,
    emptyActionState,
  );
  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <input type="hidden" name="structureId" value={structureId} />
      <input type="hidden" name="teamId" value={teamId} />
      <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs uppercase tracking-wider text-zinc-500">
        Nouveau manager (User ID)
        <input name="userId" className="hud-input" required minLength={8} />
      </label>
      <SubmitButton
        pending={pending}
        idleLabel="Nommer"
        pendingLabel="…"
      />
      {state.message ? (
        <p className={`text-xs ${state.ok ? "text-lime-400" : "text-orange-400"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
