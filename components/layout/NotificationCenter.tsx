"use client";

import { useCallback, useState } from "react";
import { ClubInviteInbox } from "@/components/teams/ClubInviteInbox";
import { InvitationInbox } from "@/components/invitations/InvitationInbox";
import { ScrimProposalInbox } from "@/components/scrims/ScrimProposalInbox";
import { StructureInviteInbox } from "@/components/structures/StructureInviteInbox";
import { Sheet } from "@/components/ui/Sheet";
import type { NotificationInbox } from "@/lib/data/notifications";

export function NotificationCenter({ inbox }: { inbox: NotificationInbox }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const pending = inbox.count;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={
          pending > 0 ? `Notifications, ${pending} en attente` : "Notifications"
        }
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200 transition hover:border-orange-400/40 hover:text-orange-200"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
          <path
            fill="currentColor"
            d="M10 2a5 5 0 0 0-5 5v2.2L3.4 12A1 1 0 0 0 4.2 13.5h11.6a1 1 0 0 0 .8-1.5L14 9.2V7a5 5 0 0 0-5-5Zm0 16a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 10 18Z"
          />
        </svg>
        {pending > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-orange-500 px-1 text-center text-[0.6rem] font-bold text-black">
            {pending > 99 ? "99+" : pending}
          </span>
        ) : null}
      </button>
      <Sheet open={open} title="Notifications" onClose={close}>
        {pending === 0 ? (
          <p className="text-sm text-zinc-400">Aucune alerte en attente.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {inbox.teamInvites.length > 0 ? (
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-orange-300">
                  Équipes
                </h3>
                <InvitationInbox invitations={inbox.teamInvites} />
              </section>
            ) : null}
            {inbox.structureInvites.length > 0 ? (
              <StructureInviteInbox invitations={inbox.structureInvites} />
            ) : null}
            {inbox.structureRequests.length > 0 ? (
              <StructureInviteInbox
                invitations={inbox.structureRequests}
                perspective="owner"
              />
            ) : null}
            {inbox.clubInvites.length > 0 ? (
              <ClubInviteInbox invitations={inbox.clubInvites} />
            ) : null}
            {inbox.scrimProposals.length > 0 ? (
              <ScrimProposalInbox proposals={inbox.scrimProposals} />
            ) : null}
          </div>
        )}
      </Sheet>
    </>
  );
}
