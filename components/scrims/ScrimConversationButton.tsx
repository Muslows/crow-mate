"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { openScrimConversation } from "@/lib/actions/chat";
import {
  emptyOpenConversationState,
  type OpenConversationState,
} from "@/lib/actions/state";

export function ScrimConversationButton({
  proposalId,
}: {
  proposalId: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    OpenConversationState,
    FormData
  >(openScrimConversation, emptyOpenConversationState);

  useEffect(() => {
    if (state.ok && state.conversationId) {
      router.push(`/messages/${state.conversationId}`);
    }
  }, [router, state.conversationId, state.ok]);

  return (
    <form action={formAction}>
      <input type="hidden" name="proposalId" value={proposalId} />
      <button type="submit" disabled={pending} className="hud-btn-ghost">
        {pending ? "Ouverture…" : "Envoyer un message"}
      </button>
      {state.message && !state.ok ? (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
