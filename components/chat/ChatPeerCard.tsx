"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FlagIcon } from "@/components/languages/FlagIcon";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { FairPlayBadge } from "@/components/ui/FairPlayBadge";
import { SPOKEN_LANGUAGES } from "@/lib/constants";
import type { FairPlayIndex } from "@/lib/fair-play";
import type { PlayerRole, SpokenLanguage } from "@prisma/client";

export type ChatPeerSummary = {
  profileId: string | null;
  displayName: string;
  roles: PlayerRole[];
  sr: number;
  languages: SpokenLanguage[];
  fairPlay: FairPlayIndex;
};

export function ChatPeerCard({ peer }: { peer: ChatPeerSummary }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function close(event: MouseEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="mt-1 text-left text-lg font-semibold uppercase tracking-wide text-cyan-700 underline decoration-cyan-300/50 underline-offset-4 hover:text-orange-600 dark:text-cyan-100 dark:hover:text-orange-300"
      >
        {peer.displayName}
      </button>
      {open ? (
        <section
          role="dialog"
          aria-label={`Profil de ${peer.displayName}`}
          className="absolute left-0 top-full z-30 mt-2 w-[min(22rem,calc(100vw-3rem))] rounded-2xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
                Interlocuteur
              </p>
              <h3 className="mt-1 text-lg font-semibold">{peer.displayName}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {peer.sr > 0 ? `${peer.sr} SR` : "SR non renseigné"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="rounded-full px-2 py-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {peer.roles.map((role) => (
              <RoleBadge key={role} role={role} compact />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {peer.languages.length > 0 ? (
              peer.languages.map((language) => {
                const meta = SPOKEN_LANGUAGES.find(
                  (item) => item.value === language,
                );
                return (
                  <span
                    key={language}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    <FlagIcon language={language} size="sm" />
                    {meta?.label ?? language}
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-zinc-500">
                Langues non renseignées
              </span>
            )}
          </div>
          <div className="mt-4">
            <FairPlayBadge index={peer.fairPlay} />
          </div>
          {peer.profileId ? (
            <Link
              href={`/players/${peer.profileId}`}
              className="hud-btn mt-4 inline-flex"
            >
              Voir le profil complet
            </Link>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
