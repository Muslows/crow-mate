"use client";

import { useActionState } from "react";
import { respondToInvitation } from "@/lib/actions/invitations";
import { emptyActionState, type ActionState } from "@/lib/actions/state";
import { Panel } from "@/components/ui/Panel";
import { SubmitButton } from "@/components/forms/SubmitButton";

type Invitation = {
  id: string;
  message: string;
  kind?: "PLAYER" | "COACH";
  team: { id: string; name: string };
  inviter: { name: string };
};

function DecisionButton({
  invitationId,
  decision,
  idleLabel,
  pendingLabel,
  className,
}: {
  invitationId: string;
  decision: "accept" | "refuse";
  idleLabel: string;
  pendingLabel: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    respondToInvitation,
    emptyActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="invitationId" value={invitationId} />
      <input type="hidden" name="decision" value={decision} />
      <SubmitButton
        pending={pending}
        idleLabel={idleLabel}
        pendingLabel={pendingLabel}
        className={className}
      />
      {state.message ? (
        <p
          role="status"
          className={`text-sm ${state.ok ? "text-lime-400" : "text-orange-400"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function InvitationInbox({ invitations }: { invitations: Invitation[] }) {
  if (invitations.length === 0) {
    return (
      <p className="text-sm text-zinc-400">Aucune invitation en attente.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {invitations.map((invitation) => (
        <li key={invitation.id}>
          <Panel>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-orange-300">
              {invitation.kind === "COACH" ? "Coach" : "Recrutement"}
            </p>
            <p className="mt-2 text-lg">
              L&apos;équipe{" "}
              <span className="font-semibold uppercase text-cyan-100">
                {invitation.team.name}
              </span>{" "}
              {invitation.kind === "COACH"
                ? "vous invite comme coach."
                : "vous invite à la rejoindre."}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              De {invitation.inviter.name}
            </p>
            {invitation.message ? (
              <p className="mt-3 text-sm text-zinc-300">{invitation.message}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <DecisionButton
                invitationId={invitation.id}
                decision="accept"
                idleLabel="Accepter"
                pendingLabel="Acceptation…"
              />
              <DecisionButton
                invitationId={invitation.id}
                decision="refuse"
                idleLabel="Refuser"
                pendingLabel="Refus…"
                className="hud-btn-ghost disabled:opacity-60"
              />
            </div>
          </Panel>
        </li>
      ))}
    </ul>
  );
}
