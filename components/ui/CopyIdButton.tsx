"use client";

import { useState } from "react";

export function CopyIdButton({
  value,
  label = "Copier",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="hud-btn-ghost px-2 py-1 text-[0.65rem]"
    >
      {copied ? "Copié !" : label}
    </button>
  );
}
