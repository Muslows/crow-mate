"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
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
  buttonClassName = "hud-btn-ghost",
  kicker,
  emptyHint,
  children,
}: {
  action: (
    prev: OpenConversationState,
    formData: FormData,
  ) => Promise<OpenConversationState>;
  hiddenFields: Record<string, string>;
  idleLabel: string;
  peerName: string;
  currentUserId: string;
  buttonClassName?: string;
  kicker?: string;
  emptyHint?: string;
  children?: ReactNode;
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
          className={buttonClassName}
          disabled={pending}
          aria-busy={pending}
          aria-label={idleLabel}
          onClick={() => setOpen(true)}
        >
          {pending ? "Ouverture…" : (children ?? idleLabel)}
        </button>
      </form>
      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/40 p-4 dark:bg-black/70"
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
              <p role="alert" className="mb-3 text-sm text-red-700 dark:text-orange-300">
                {state.message}
              </p>
            ) : null}
            {state.conversationId ? (
              <ChatPanel
                key={`${state.conversationId}-${messages.at(-1)?.id ?? "empty"}`}
                conversationId={state.conversationId}
                currentUserId={currentUserId}
                peerName={peerName}
                initialMessages={messages}
                kicker={kicker}
                emptyHint={emptyHint}
              />
            ) : (
              <p className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-cyan-400/25 dark:bg-black/60 dark:text-zinc-300">
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
