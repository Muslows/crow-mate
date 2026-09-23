"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  addOpenPosition,
  publishLfpAnnouncement,
  removeOpenPosition,
} from "@/lib/actions/open-positions";
import { emptyActionState, firstFieldError } from "@/lib/actions/state";
import { ContactPlayerButton } from "@/components/chat/ContactPlayerButton";
import { FieldError } from "@/components/forms/FieldError";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { PlayerScoutCard } from "@/components/players/PlayerScoutCard";
import { Panel } from "@/components/ui/Panel";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { labelFor, PLAYER_ROLES } from "@/lib/constants";
import { OPEN_POSITION_SR_TOLERANCE } from "@/lib/lfp";
import { publicDisplayName } from "@/lib/privacy-display";
import type { OpenPositionMatch } from "@/lib/data/open-positions";
import type { PlayerRole } from "@prisma/client";

export function OpenPositionsBoard({
  teamId,
  positions,
  selectedId,
  matches,
  currentUserId,
  estimatedSr,
}: {
  teamId: string;
  positions: { id: string; role: PlayerRole }[];
  selectedId: string | null;
  matches: OpenPositionMatch[];
  currentUserId: string;
  estimatedSr: number;
}) {
  const taken = new Set(positions.map((item) => item.role));
  const available = PLAYER_ROLES.filter((item) => !taken.has(item.value));
  const selected = positions.find((item) => item.id === selectedId) ?? null;
  const [addState, addAction, addPending] = useActionState(
    addOpenPosition,
    emptyActionState,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeOpenPosition,
    emptyActionState,
  );
  const [lfpState, lfpAction, lfpPending] = useActionState(
    publishLfpAnnouncement,
    emptyActionState,
  );

  return (
    <Panel>
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
        Postes à pourvoir
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Ouvre un rôle, scanne les joueurs compatibles (langue, SR ±
        {OPEN_POSITION_SR_TOLERANCE}, Open to Play), ou publie un LFP.
      </p>

      {positions.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {positions.map((item) => {
            const active = item.id === selectedId;
            return (
              <li key={item.id}>
                <Link
                  href={`/manage/teams/${teamId}/edit?poste=${item.id}`}
                  className={`inline-flex items-center rounded-full border px-1 py-1 ${
                    active
                      ? "border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-950/50"
                      : "border-transparent"
                  }`}
                >
                  <RoleBadge role={item.role} />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Aucun poste ouvert.
        </p>
      )}

      {available.length > 0 ? (
        <form action={addAction} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="teamId" value={teamId} />
          <label className="form-label">
            Ajouter un poste
            <select name="role" className="hud-input" defaultValue={available[0].value}>
              {available.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <SubmitButton
            pending={addPending}
            idleLabel="Ajouter un poste"
            pendingLabel="Ajout…"
          />
        </form>
      ) : (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Les cinq rôles sont déjà ouverts.
        </p>
      )}
      {addState.message && !addState.ok ? (
        <p className="mt-2 text-sm text-red-700 dark:text-orange-300">
          {addState.message}
        </p>
      ) : null}
      <FieldError
        id="open-position-role-error"
        message={firstFieldError(addState.fieldErrors, "role")}
      />

      {selected ? (
        <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {labelFor(PLAYER_ROLES, selected.role)} · {matches.length}{" "}
              profil{matches.length > 1 ? "s" : ""}
            </h3>
            <form action={removeAction}>
              <input type="hidden" name="positionId" value={selected.id} />
              <SubmitButton
                pending={removePending}
                idleLabel="Retirer le poste"
                pendingLabel="Retrait…"
                className="hud-btn-ghost disabled:opacity-60"
              />
            </form>
          </div>
          {removeState.message && !removeState.ok ? (
            <p className="mt-2 text-sm text-red-700 dark:text-orange-300">
              {removeState.message}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            SR {Math.max(0, estimatedSr - OPEN_POSITION_SR_TOLERANCE)}–
            {estimatedSr + OPEN_POSITION_SR_TOLERANCE}
          </p>
          {matches.length === 0 ? (
            <div className="mt-4">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Aucun joueur ne correspond strictement à ce poste.
              </p>
              <form action={lfpAction} className="mt-3">
                <input type="hidden" name="positionId" value={selected.id} />
                <SubmitButton
                  pending={lfpPending}
                  idleLabel="Publier une annonce LFP (Looking For Player)"
                  pendingLabel="Publication…"
                />
              </form>
              {lfpState.message ? (
                <p
                  className={`mt-2 text-sm ${
                    lfpState.ok
                      ? "text-emerald-700 dark:text-lime-300"
                      : "text-red-700 dark:text-orange-300"
                  }`}
                >
                  {lfpState.message}
                </p>
              ) : null}
            </div>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {matches.map((player) => (
                <li
                  key={player.id}
                  className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950/40"
                >
                  <PlayerScoutCard player={player} />
                  <ContactPlayerButton
                    candidateUserId={player.user.id}
                    displayName={publicDisplayName({
                      displayName: player.displayName,
                      name: player.user.name,
                    })}
                    currentUserId={currentUserId}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </Panel>
  );
}
