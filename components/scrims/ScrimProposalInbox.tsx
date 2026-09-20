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
import { ScrimConversationButton } from "@/components/scrims/ScrimConversationButton";
import type { OfficialScrimSlot } from "@prisma/client";

type Proposal = {
  id: string;
  weekday: string;
  slot: OfficialScrimSlot;
  fromTeam: {
    id: string;
    name: string;
    estimatedSr: number;
    org: { id: string; name: string; tag: string } | null;
    parentTeam: { id: string; name: string } | null;
  };
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
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-700 dark:text-orange-300">
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
    <li className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-zinc-950/40">
      <p className="text-sm text-zinc-800 dark:text-zinc-200">
        L&apos;équipe{" "}
        <span className="font-semibold">
          {teamDisplayName(proposal.fromTeam.name, proposal.fromTeam.org?.tag)}
        </span>{" "}
        vous propose un scrim le {slotLabel(proposal.weekday, proposal.slot)}.
      </p>
      <details className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
        <summary className="cursor-pointer text-sm font-semibold text-cyan-700 dark:text-cyan-300">
          Inspecter l’équipe
        </summary>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <Info label="Équipe" value={proposal.fromTeam.name} />
          <Info
            label="SR estimé"
            value={
              proposal.fromTeam.estimatedSr > 0
                ? `${proposal.fromTeam.estimatedSr} SR`
                : "Non renseigné"
            }
          />
          <Info
            label="Structure"
            value={
              proposal.fromTeam.org
                ? `${proposal.fromTeam.org.name} (${proposal.fromTeam.org.tag})`
                : (proposal.fromTeam.parentTeam?.name ?? "Indépendante")
            }
          />
          <Info
            label="Configuration technique"
            value="Partagée uniquement après acceptation du Scrim"
          />
        </div>
      </details>
      <div className="mt-3 flex flex-wrap items-start gap-2">
        <form action={formAction} className="flex flex-wrap gap-2">
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
        <ScrimConversationButton proposalId={proposal.id} />
      </div>
      {state.message ? (
        <p className={`mt-2 text-sm ${state.ok ? "text-lime-400" : "text-orange-400"}`}>
          {state.message}
        </p>
      ) : null}
    </li>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex flex-col gap-0.5">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="font-medium text-zinc-900 dark:text-zinc-100">
        {value.trim() || "Non renseigné"}
      </span>
    </p>
  );
}
