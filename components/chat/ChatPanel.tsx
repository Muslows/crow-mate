"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { sendChatMessage } from "@/lib/actions/chat";
import { emptyActionState, type ActionState } from "@/lib/actions/state";
import { SubmitButton } from "@/components/forms/SubmitButton";
import type { ChatMessageView } from "@/lib/data/chat";

const POLL_MS = 3000;

export function ChatPanel({
  conversationId,
  currentUserId,
  peerName,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  peerName: string;
  initialMessages: ChatMessageView[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastIdRef = useRef<string | undefined>(initialMessages.at(-1)?.id);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    sendChatMessage,
    emptyActionState,
  );

  useEffect(() => {
    setMessages(initialMessages);
    lastIdRef.current = initialMessages.at(-1)?.id;
  }, [initialMessages]);

  useEffect(() => {
    lastIdRef.current = messages.at(-1)?.id;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const prevPending = useRef(false);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  useEffect(() => {
    if (prevPending.current && !pending && state.ok) {
      void fetch(`/api/messages/${conversationId}`, { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((payload: { messages?: ChatMessageView[] } | null) => {
          if (!payload?.messages) return;
          setMessages(payload.messages);
        });
    }
    prevPending.current = pending;
  }, [pending, state.ok, conversationId]);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const lastId = lastIdRef.current;
      const url = lastId
        ? `/api/messages/${conversationId}?after=${encodeURIComponent(lastId)}`
        : `/api/messages/${conversationId}`;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok || cancelled) return;
      const payload = (await response.json()) as { messages?: ChatMessageView[] };
      const incoming = payload.messages ?? [];
      if (incoming.length === 0) return;
      setMessages((current) => {
        const known = new Set(current.map((item) => item.id));
        const extra = incoming.filter((item) => !known.has(item.id));
        if (extra.length === 0) return current;
        return [...current, ...extra];
      });
    }
    const timer = window.setInterval(() => {
      void poll();
    }, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [conversationId]);

  return (
    <div className="flex h-[min(32rem,70vh)] flex-col border border-cyan-400/25 bg-black/50">
      <header className="border-b border-cyan-400/20 px-4 py-3">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-orange-300">
          Recrutement
        </p>
        <h2 className="mt-1 text-lg font-semibold uppercase tracking-wide text-cyan-100">
          {peerName}
        </h2>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Aucun message. Échangez disponibilités et ambitions avant une
            invitation officielle.
          </p>
        ) : (
          messages.map((message) => {
            const mine = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={`max-w-[85%] px-3 py-2 text-sm ${
                  mine
                    ? "ml-auto bg-orange-400/15 text-orange-50"
                    : "bg-cyan-400/10 text-cyan-50"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.body}</p>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form
        ref={formRef}
        action={formAction}
        className="flex gap-2 border-t border-cyan-400/20 p-3"
      >
        <input type="hidden" name="conversationId" value={conversationId} />
        <input
          name="body"
          required
          maxLength={2000}
          placeholder="Message…"
          className="hud-input flex-1"
          autoComplete="off"
        />
        <SubmitButton pending={pending} idleLabel="Envoyer" pendingLabel="…" />
      </form>
      {state.message && !state.ok ? (
        <p role="alert" className="px-3 pb-3 text-sm text-orange-400">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
