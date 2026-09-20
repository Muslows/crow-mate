"use client";

import Link from "next/link";
import { ChatLaunchButton } from "@/components/chat/ChatLaunchButton";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { openOpenPositionConversation } from "@/lib/actions/chat";
import { labelFor, PLAYER_ROLES } from "@/lib/constants";
import type { PlayerRole } from "@prisma/client";

function VacancyFace({ role }: { role: PlayerRole }) {
  return (
    <div className="flex min-h-[10.5rem] flex-col justify-between gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-600 dark:bg-zinc-900/60">
      <div className="flex items-start justify-between gap-3">
        <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          Poste à pourvoir
        </p>
        <RoleBadge role={role} />
      </div>
      <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
        Recrutement actif
      </p>
      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        {labelFor(PLAYER_ROLES, role)} · écrire au manager
      </p>
    </div>
  );
}

export function OpenPositionVacancyCard({
  positionId,
  role,
  currentUserId,
  managerId,
}: {
  positionId: string;
  role: PlayerRole;
  currentUserId: string | null;
  managerId: string;
}) {
  const canApply =
    Boolean(currentUserId) && currentUserId !== managerId;

  if (canApply && currentUserId) {
    return (
      <ChatLaunchButton
        action={openOpenPositionConversation}
        hiddenFields={{ positionId }}
        idleLabel={`Postuler ${labelFor(PLAYER_ROLES, role)}`}
        peerName="Manager"
        currentUserId={currentUserId}
        buttonClassName="block w-full rounded-2xl p-0 text-left transition hover:brightness-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:opacity-70"
        kicker="Candidature"
        emptyHint="Aucun message. Présente-toi et discute du poste ici."
      >
        <VacancyFace role={role} />
      </ChatLaunchButton>
    );
  }

  if (!currentUserId) {
    return (
      <Link href="/login" className="block rounded-2xl">
        <VacancyFace role={role} />
      </Link>
    );
  }

  return <VacancyFace role={role} />;
}
