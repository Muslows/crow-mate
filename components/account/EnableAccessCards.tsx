"use client";

import { useActionState } from "react";
import { enablePlayerAccess, toggleOpenFlag } from "@/lib/actions/account";
import { Panel } from "@/components/ui/Panel";
import { emptyActionState, type ActionState } from "@/lib/actions/state";
import Link from "next/link";

export function EnablePlayerAccessCard() {
  return (
    <Panel className="max-w-xl">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-400">
        Casquette
      </p>
      <h2 className="mt-2 text-2xl font-semibold uppercase tracking-wide">
        Activer le profil joueur
      </h2>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        Ton compte reste le même. Tu pourras renseigner SR, rôles et planning.
      </p>
      <form action={enablePlayerAccess} className="mt-6">
        <button type="submit" className="hud-btn">
          Créer mon profil joueur
        </button>
      </form>
    </Panel>
  );
}

export function CreateTeamAccessCard() {
  return (
    <Panel className="max-w-xl">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-400">
        Manager
      </p>
      <h2 className="mt-2 text-2xl font-semibold uppercase tracking-wide">
        Créer une équipe
      </h2>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        Le rôle manager s&apos;obtient uniquement en créant un roster, ou si un
        manager actuel te désigne. Choisis Manager pur ou Capitaine à la
        création.
      </p>
      <Link href="/manage/teams/new" className="mt-6 inline-flex hud-btn">
        Créer mon équipe
      </Link>
    </Panel>
  );
}

function OpenToggle({
  flag,
  nextValue,
  label,
}: {
  flag: "openToCast" | "openToCoach";
  nextValue: "OPEN" | "CLOSED";
  label: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    toggleOpenFlag,
    emptyActionState,
  );

  return (
    <form action={formAction} className="mt-4">
      <input type="hidden" name="flag" value={flag} />
      <input type="hidden" name="value" value={nextValue} />
      <button type="submit" className="hud-btn" disabled={pending}>
        {pending ? "Enregistrement…" : label}
      </button>
      {state.message ? (
        <p
          role="status"
          className={`mt-2 text-sm ${state.ok ? "text-lime-400" : "text-orange-400"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function AccountRolesPanel({
  isPlayer,
  isManager,
  isCoach,
  isCaster,
  isStaff,
  openToCast,
  openToCoach,
}: {
  isPlayer: boolean;
  isManager: boolean;
  isCoach: boolean;
  isCaster: boolean;
  isStaff: boolean;
  openToCast: string;
  openToCoach: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {isPlayer ? (
        <Panel>
          <h3 className="text-lg font-semibold uppercase tracking-wide">Joueur</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Profil compétitif actif.</p>
        </Panel>
      ) : (
        <Panel>
          <h3 className="text-lg font-semibold uppercase tracking-wide">Joueur</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Fiche publique, planning et recrutement.
          </p>
          <form action={enablePlayerAccess} className="mt-4">
            <button type="submit" className="hud-btn">
              Activer joueur
            </button>
          </form>
        </Panel>
      )}
      <Panel>
        <h3 className="text-lg font-semibold uppercase tracking-wide">Manager</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {isManager
            ? "Tu gères au moins une équipe (création ou désignation)."
            : "Impossible de s'auto-attribuer. Crée une équipe ou attends qu'un manager te désigne."}
        </p>
        {!isManager ? (
          <Link href="/manage/teams/new" className="mt-4 inline-flex hud-btn">
            Créer une équipe
          </Link>
        ) : null}
      </Panel>
      <Panel>
        <h3 className="text-lg font-semibold uppercase tracking-wide">Coach</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {isCoach
            ? "Rôle officiel : tu as accepté une invitation d'équipe."
            : "Open to Coach te rend visible. Le rôle officiel n'est validé qu'à l'acceptation d'une invitation manager."}
        </p>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
          {openToCoach === "OPEN" ? "Open to Coach" : "Fermé au coaching"}
        </p>
        <OpenToggle
          flag="openToCoach"
          nextValue={openToCoach === "OPEN" ? "CLOSED" : "OPEN"}
          label={openToCoach === "OPEN" ? "Retirer Open to Coach" : "Activer Open to Coach"}
        />
      </Panel>
      <Panel>
        <h3 className="text-lg font-semibold uppercase tracking-wide">Caster</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Open to Cast te référence dans l&apos;écosystème des casters. Tu peux
          le désactiver à tout moment.
        </p>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
          {isCaster || openToCast === "OPEN" ? "Open to Cast" : "Fermé au cast"}
        </p>
        <OpenToggle
          flag="openToCast"
          nextValue={openToCast === "OPEN" ? "CLOSED" : "OPEN"}
          label={openToCast === "OPEN" ? "Retirer Open to Cast" : "Activer Open to Cast"}
        />
      </Panel>
      <Panel className="md:col-span-2">
        <h3 className="text-lg font-semibold uppercase tracking-wide">Staff</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {isStaff
            ? "Tu as été désigné par le gérant d'une structure. Ce rôle ne s'active pas soi-même."
            : "Impossible de s'attribuer staff. Seul le gérant d'une structure peut te nommer dans son organigramme."}
        </p>
      </Panel>
    </div>
  );
}
