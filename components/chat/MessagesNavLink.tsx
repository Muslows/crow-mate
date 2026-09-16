"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const POLL_MS = 12000;

export function MessagesNavLink({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const response = await fetch("/api/messages/unread", { cache: "no-store" });
      if (!response.ok || cancelled) return;
      const payload = (await response.json()) as { count?: number };
      if (typeof payload.count === "number") setCount(payload.count);
    }
    const timer = window.setInterval(() => {
      void poll();
    }, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <Link
      href="/messages"
      aria-label={count > 0 ? `Chat, ${count} non lus` : "Chat"}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
        <path
          fill="currentColor"
          d="M3 4.5A1.5 1.5 0 0 1 4.5 3h11A1.5 1.5 0 0 1 17 4.5v8A1.5 1.5 0 0 1 15.5 14H8l-3.6 2.7A.75.75 0 0 1 3 16.1V4.5Z"
        />
      </svg>
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[var(--hud-red)] px-1 text-center text-[0.6rem] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
