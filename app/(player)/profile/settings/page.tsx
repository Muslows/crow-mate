import Link from "next/link";
import { AccountRolesPanel } from "@/components/account/EnableAccessCards";
import { BattleTagVisibilityForm } from "@/components/account/BattleTagVisibilityForm";
import { OpenToPlayForm } from "@/components/account/OpenToPlayForm";
import { CasterProfileForm } from "@/components/account/CasterProfileForm";
import { Panel } from "@/components/ui/Panel";
import { db } from "@/lib/db";
import { requireAuthSession, sessionCapabilities } from "@/lib/session";

export default async function ProfileSettingsPage() {
  const session = await requireAuthSession();
  const caps = sessionCapabilities(session);
  const caster = await db.casterProfile.findUnique({
    where: { userId: session.user.id },
  });
  const playFlags = await db.playerProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      openToPlay: true,
      battleTagPublic: true,
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
          Compte
        </p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-wide">
          Paramètres
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Les rôles officiels suivent les flux métier : staff via le gérant de
          structure, coach via invitation, manager via création d&apos;équipe.
          Open to Cast, Open to Coach et Open to Play (5 rôles compétitifs)
          sont les statuts que tu actives toi-même.
        </p>
        <Link href="/profile" className="mt-4 inline-block hud-btn-ghost">
          Retour au profil
        </Link>
      </div>
      <AccountRolesPanel
        isPlayer={Boolean(caps.isPlayer)}
        isManager={Boolean(caps.isManager)}
        isCoach={Boolean(caps.isCoach)}
        isCaster={Boolean(caps.isCaster)}
        isStaff={Boolean(caps.isStaff)}
        openToCast={caps.openToCast === "OPEN" ? "OPEN" : "CLOSED"}
        openToCoach={caps.openToCoach === "OPEN" ? "OPEN" : "CLOSED"}
      />
      {caps.isPlayer ? (
        <>
          <BattleTagVisibilityForm
            battleTagPublic={playFlags?.battleTagPublic ?? false}
          />
          <OpenToPlayForm openToPlay={playFlags?.openToPlay ?? []} />
        </>
      ) : null}
      {caps.openToCast === "OPEN" || caps.isCaster ? (
        <Panel>
          <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-400">
            Liens caster
          </h2>
          <CasterProfileForm
            profile={
              caster ?? { streamUrl: "", vodUrl: "", eventsNote: "" }
            }
          />
        </Panel>
      ) : null}
    </main>
  );
}
