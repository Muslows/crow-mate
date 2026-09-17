"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

export function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const frame = window.requestAnimationFrame(() => setShown(open));
    return () => window.cancelAnimationFrame(frame);
  }, [mounted, open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-end p-3 sm:p-4 ${
        shown ? "" : "pointer-events-none"
      }`}
      role="presentation"
    >
      <button
        type="button"
        className={`absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Fermer le panneau"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative z-10 flex max-h-[80vh] min-h-48 w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f19]/95 shadow-[-24px_0_48px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-transform duration-300 ease-out ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
        onTransitionEnd={() => {
          if (!open) setMounted(false);
        }}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <h2
            id={titleId}
            className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100"
          >
            {title}
          </h2>
          <button type="button" className="hud-btn-ghost" onClick={onClose}>
            Fermer
          </button>
        </div>
        <div className="min-h-24 overflow-y-auto px-5 py-4">{children}</div>
      </aside>
    </div>
  );
}
