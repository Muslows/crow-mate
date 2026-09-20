"use client";

import { useActionState } from "react";
import { deleteAnnouncement } from "@/lib/actions/announcements";
import { emptyActionState, type ActionState } from "@/lib/actions/state";

export function DeleteAnnouncementButton({
  announcementId,
}: {
  announcementId: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    deleteAnnouncement,
    emptyActionState,
  );
  return (
    <form action={formAction}>
      <input type="hidden" name="announcementId" value={announcementId} />
      <button type="submit" className="hud-btn-ghost" disabled={pending}>
        {pending ? "Retrait…" : "Retirer l’annonce"}
      </button>
      {state.message ? (
        <p
          className={`mt-1 text-xs ${
            state.ok
              ? "text-emerald-700 dark:text-lime-300"
              : "text-red-700 dark:text-orange-300"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
