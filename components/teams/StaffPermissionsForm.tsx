"use client";

import { useActionState } from "react";
import { saveTeamPermissions } from "@/lib/actions/permissions";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { emptyActionState, type ActionState } from "@/lib/actions/state";
import type { TeamStaffGrant } from "@/lib/data/staff-permissions";
import {
  GRANT_ROLE_LABELS,
  PERMISSION_FLAG_LABELS,
  TEAM_PERMISSION_FLAGS,
} from "@/lib/team-permissions";

export function StaffPermissionsForm({
  teamId,
  staff,
}: {
  teamId: string;
  staff: TeamStaffGrant[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveTeamPermissions,
    emptyActionState,
  );

  if (staff.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Aucun coach, assistant ou capitaine à paramétrer. Invite un coach ou
        désigne un co-manager.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="teamId" value={teamId} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              <th className="py-2 pr-3">Membre</th>
              {TEAM_PERMISSION_FLAGS.map((flag) => (
                <th key={flag} className="px-2 py-2">
                  {PERMISSION_FLAG_LABELS[flag]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.userId} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="py-3 pr-3">
                  <input type="hidden" name="staffUserId" value={member.userId} />
                  <input type="hidden" name={`role:${member.userId}`} value={member.role} />
                  <p className="font-semibold text-foreground">{member.name}</p>
                  <p className="text-[0.65rem] uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-400">
                    {GRANT_ROLE_LABELS[member.role]}
                  </p>
                </td>
                {TEAM_PERMISSION_FLAGS.map((flag) => (
                  <td key={flag} className="px-2 py-3">
                    <input
                      type="checkbox"
                      name={`${flag}:${member.userId}`}
                      defaultChecked={member.grants[flag]}
                      className="h-4 w-4 accent-orange-600 dark:accent-orange-400"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-lime-400" : "text-orange-400"}`}>
          {state.message}
        </p>
      ) : null}
      <SubmitButton
        pending={pending}
        idleLabel="Enregistrer les droits"
        pendingLabel="Enregistrement…"
      />
    </form>
  );
}
