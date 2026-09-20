"use client";

import { reactivateAccount } from "@/lib/actions/account";
import { PendingSubmit } from "@/components/forms/SubmitButton";

export function ReactivateAccountForm({ untilLabel }: { untilLabel?: string }) {
  return (
    <form action={reactivateAccount} className="flex flex-col gap-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Ton compte est encore récupérable
        {untilLabel ? ` jusqu’au ${untilLabel}` : ""}. La réactivation restaure
        immédiatement ton accès.
      </p>
      <PendingSubmit
        idleLabel="Réactiver mon compte"
        pendingLabel="Réactivation…"
      />
    </form>
  );
}
