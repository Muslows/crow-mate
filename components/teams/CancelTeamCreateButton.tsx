"use client";

import { abandonTeamCreation } from "@/lib/actions/manager-lifecycle";
import { PendingSubmit } from "@/components/forms/SubmitButton";

export function CancelTeamCreateButton() {
  return (
    <form action={abandonTeamCreation}>
      <PendingSubmit
        idleLabel="Annuler sans créer"
        pendingLabel="Annulation…"
        className="hud-btn-ghost disabled:opacity-60"
      />
    </form>
  );
}
