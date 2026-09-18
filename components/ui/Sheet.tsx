"use client";

import { X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

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
  const [portalReady, setPortalReady] = useState(false);
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

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

  if (!portalReady || !mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] ${shown ? "" : "pointer-events-none"}`}
      role="presentation"
    >
      <button
        type="button"
        className={`absolute inset-0 cursor-default bg-zinc-950/45 backdrop-blur-[2px] transition-opacity duration-200 dark:bg-black/60 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Fermer les notifications"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`absolute inset-y-0 right-0 z-10 flex h-full w-full max-w-md flex-col overflow-hidden border-l border-border bg-surface shadow-[-16px_0_40px_rgba(24,24,27,0.18)] transition-transform duration-200 ease-out sm:inset-y-4 sm:right-4 sm:h-auto sm:max-h-[calc(100vh-2rem)] sm:rounded-2xl sm:border ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
        onTransitionEnd={() => {
          if (!open) setMounted(false);
        }}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 id={titleId} className="text-base font-semibold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-zinc-700 transition-colors duration-200 hover:border-orange-400 hover:text-orange-600 dark:text-zinc-300 dark:hover:text-orange-300"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>
        <div className="min-h-24 overflow-y-auto px-5 py-4">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}
