"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function NavMenu({
  label,
  align = "right",
  children,
}: {
  label: ReactNode;
  align?: "left" | "right";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2 py-1 text-sm text-zinc-200 transition hover:border-orange-300 hover:text-orange-300"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <span aria-hidden className="text-[0.65rem] text-zinc-500">
          {open ? "▴" : "▾"}
        </span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className={`absolute z-50 mt-2 min-w-60 overflow-hidden rounded-2xl border border-border bg-surface py-1 shadow-lg ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      ) : null}
    </div>
  );
}

export function NavMenuLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="block px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800/50 hover:text-orange-300"
    >
      {children}
    </Link>
  );
}
