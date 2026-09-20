"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function TeamSettingsSheet({
  defaultOpen = false,
  children,
}: {
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [portalReady, setPortalReady] = useState(false);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <>
      <button type="button" className="hud-btn-ghost" onClick={() => setOpen(true)}>
        Paramètres de l&apos;équipe
      </button>
      {portalReady && open
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] flex justify-end bg-zinc-950/55 backdrop-blur-[2px] dark:bg-black/70"
              role="presentation"
            >
              <button
                type="button"
                className="h-full flex-1 cursor-default"
                aria-label="Fermer les paramètres"
                onClick={() => setOpen(false)}
              />
              <aside
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-zinc-200 bg-white p-6 text-zinc-900 shadow-[-16px_0_40px_rgba(24,24,27,0.18)] dark:border-border dark:bg-surface dark:text-zinc-100"
              >
                <div className="mb-6 flex items-center justify-between gap-3">
                  <h2
                    id={titleId}
                    className="text-lg font-semibold uppercase tracking-wide"
                  >
                    Paramètres de l&apos;équipe
                  </h2>
                  <button
                    type="button"
                    className="hud-btn-ghost"
                    onClick={() => setOpen(false)}
                  >
                    Fermer
                  </button>
                </div>
                <div className="flex flex-col gap-8">{children}</div>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
