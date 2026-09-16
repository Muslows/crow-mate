"use client";

import { abandonTeamCreation } from "@/lib/actions/manager-lifecycle";

export function CancelTeamCreateButton() {
  return (
    <form action={abandonTeamCreation}>
      <button type="submit" className="hud-btn-ghost">
        Annuler sans créer
      </button>
    </form>
  );
}
