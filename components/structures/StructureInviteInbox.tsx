"use client";

import { useActionState } from "react";
import { respondToStructureInvitation } from "@/lib/actions/structures";
import { emptyActionState, type ActionState } from "@/lib/actions/state";
import { Panel } from "@/components/ui/Panel";
import { SubmitButton } from "@/components/forms/SubmitButton";

type StructureInvite = {
  id: string;
  structure: { name: string; tag: string };
  team: { id: string; name: string };
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
    respondToStructureInvitation,
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

export function StructureInviteInbox({
  invitations,
  perspective = "team",
}: {
  invitations: StructureInvite[];
  perspective?: "team" | "owner";
}) {
  if (invitations.length === 0) return null;

  return (
    <section id="structure-invites" className="flex flex-col gap-3">
      <h2 className="text-sm uppercase tracking-[0.16em] text-cyan-400">
        {perspective === "owner"
          ? "Demandes d'affiliation"
          : "Invitations de structure"}
      </h2>
      <ul className="flex flex-col gap-3">
        {invitations.map((invitation) => (
          <li key={invitation.id}>
            <Panel>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-orange-300">
                Affiliation
              </p>
              <p className="mt-2 text-lg">
                {perspective === "owner" ? (
                  <>
                    L&apos;équipe{" "}
                    <span className="font-semibold uppercase text-cyan-100">
                      {invitation.team.name}
                    </span>{" "}
                    demande à rejoindre{" "}
                    <span className="font-semibold uppercase">
                      {invitation.structure.name}
                    </span>
                    .
                  </>
                ) : (
                  <>
                    La structure{" "}
                    <span className="font-semibold uppercase text-cyan-100">
                      {invitation.structure.name}
                    </span>{" "}
                    ({invitation.structure.tag}) souhaite intégrer votre équipe{" "}
                    <span className="font-semibold uppercase">
                      {invitation.team.name}
                    </span>
                    .
                  </>
                )}
              </p>
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
    </section>
  );
}
