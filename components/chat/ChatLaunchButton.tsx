"use client";

import { useActionState, useEffect, useState } from "react";
import {
  emptyOpenConversationState,
  type OpenConversationState,
} from "@/lib/actions/state";
import { ChatPanel } from "@/components/chat/ChatPanel";
import type { ChatMessageView } from "@/lib/data/chat";

export function ChatLaunchButton({
  action,
  hiddenFields,
  idleLabel,
  peerName,
  currentUserId,
}: {
  action: (
    prev: OpenConversationState,
    formData: FormData,
  ) => Promise<OpenConversationState>;
  hiddenFields: Record<string, string>;
  idleLabel: string;
  peerName: string;
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<
    OpenConversationState,
    FormData
  >(action, emptyOpenConversationState);
  const [messages, setMessages] = useState<ChatMessageView[]>([]);

  useEffect(() => {
    if (!state.ok || !state.conversationId) return;
    let cancelled = false;
    async function load() {
      const response = await fetch(`/api/messages/${state.conversationId}`, {
        cache: "no-store",
      });
      if (!response.ok || cancelled) return;
      const payload = (await response.json()) as { messages?: ChatMessageView[] };
      setMessages(payload.messages ?? []);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [state.ok, state.conversationId]);

  return (
    <>
      <form action={formAction}>
        {Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <button
          type="submit"
          className="hud-btn-ghost"
          disabled={pending}
          onClick={() => setOpen(true)}
        >
          {pending ? "Ouverture…" : idleLabel}
        </button>
      </form>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg"
            onClick={(event) => event.stopPropagation()}
          >
            {state.message && !state.ok ? (
              <p role="alert" className="mb-3 text-sm text-orange-400">
                {state.message}
              </p>
            ) : null}
            {state.conversationId ? (
              <ChatPanel
                conversationId={state.conversationId}
                currentUserId={currentUserId}
                peerName={peerName}
                initialMessages={messages}
              />
            ) : (
              <p className="border border-cyan-400/25 bg-black/60 p-4 text-sm text-zinc-400">
                Préparation du fil…
              </p>
            )}
            <button
              type="button"
              className="mt-3 hud-btn-ghost"
              onClick={() => setOpen(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
