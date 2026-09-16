"use client";

import { CopyIdButton } from "@/components/ui/CopyIdButton";

export function CopyPlayerIdButton({ playerId }: { playerId: string }) {
  return <CopyIdButton value={playerId} />;
}
