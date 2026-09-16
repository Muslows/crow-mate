"use client";

import { useActionState } from "react";
import { respondScrimProposal } from "@/lib/actions/proposals";
import { emptyActionState, type ActionState } from "@/lib/actions/state";
import {
  encodeMatchSlot,
  formatMatchSlot,
  isMatchableSlot,
} from "@/lib/scrim-slots";
import { teamDisplayName } from "@/lib/team-name";
import { WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";
import type { OfficialScrimSlot } from "@prisma/client";

type Proposal = {
  id: string;
  weekday: string;
  slot: OfficialScrimSlot;
  fromTeam: { id: string; name: string; org: { tag: string } | null };
};

function slotLabel(weekday: string, slot: OfficialScrimSlot) {
  if (!WEEKDAY_KEYS.includes(weekday as WeekdayKey) || !isMatchableSlot(slot)) {
    return weekday;
  }
  return formatMatchSlot(encodeMatchSlot(weekday as WeekdayKey, slot));
}

export function ScrimProposalInbox({ proposals }: { proposals: Proposal[] }) {
  if (proposals.length === 0) return null;
  return (
    <section id="scrim-proposals" className="hud-card flex flex-col gap-3 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-300">
        Propositions de scrim
      </h2>
      <ul className="flex flex-col gap-3">
        {proposals.map((proposal) => (
          <ProposalRow key={proposal.id} proposal={proposal} />
        ))}
      </ul>
    </section>
  );
}

function ProposalRow({ proposal }: { proposal: Proposal }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    respondScrimProposal,
    emptyActionState,
  );

  return (
    <li className="rounded-xl border border-white/10 p-3">
      <p className="text-sm text-zinc-200">
        L&apos;équipe{" "}
        <span className="font-semibold">
          {teamDisplayName(proposal.fromTeam.name, proposal.fromTeam.org?.tag)}
        </span>{" "}
        vous propose un scrim le {slotLabel(proposal.weekday, proposal.slot)}.
      </p>
      <form action={formAction} className="mt-3 flex flex-wrap gap-2">
        <input type="hidden" name="proposalId" value={proposal.id} />
        <button
          type="submit"
          name="decision"
          value="accept"
          disabled={pending}
          className="hud-btn"
        >
          {pending ? "…" : "Accepter"}
        </button>
        <button
          type="submit"
          name="decision"
          value="refuse"
          disabled={pending}
          className="hud-btn-ghost"
        >
          Refuser
        </button>
      </form>
      {state.message ? (
        <p className={`mt-2 text-sm ${state.ok ? "text-lime-400" : "text-orange-400"}`}>
          {state.message}
        </p>
      ) : null}
    </li>
  );
}
