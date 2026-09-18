"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function TeamSettingsSheet({
  defaultOpen = false,
  children,
}: {
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <>
      <button type="button" className="hud-btn-ghost" onClick={() => setOpen(true)}>
        Paramètres de l&apos;équipe
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" role="presentation">
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
            className="flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-border bg-surface p-6 shadow-[-16px_0_40px_rgba(24,24,27,0.08)]"
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 id={titleId} className="text-lg font-semibold uppercase tracking-wide">
                Paramètres de l&apos;équipe
              </h2>
              <button type="button" className="hud-btn-ghost" onClick={() => setOpen(false)}>
                Fermer
              </button>
            </div>
            <div className="flex flex-col gap-8">{children}</div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
