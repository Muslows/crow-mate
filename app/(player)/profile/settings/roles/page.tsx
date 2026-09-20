import { AccountRolesPanel } from "@/components/account/EnableAccessCards";
import { CasterProfileForm } from "@/components/account/CasterProfileForm";
import { Panel } from "@/components/ui/Panel";
import { db } from "@/lib/db";
import { requireAuthSession, sessionCapabilities } from "@/lib/session";

export default async function PlatformRolesSettingsPage() {
  const session = await requireAuthSession();
  const caps = sessionCapabilities(session);
  const caster =
    caps.openToCast === "OPEN" || caps.isCaster
      ? await db.casterProfile.findUnique({
          where: { userId: session.user.id },
        })
      : null;

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold">Mes rôles plateforme</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Active tes disponibilités Coach/Caster et consulte tes rôles
          officiels.
        </p>
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
      {caps.openToCast === "OPEN" || caps.isCaster ? (
        <Panel>
          <h3 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
            Liens caster
          </h3>
          <CasterProfileForm
            profile={
              caster ?? { streamUrl: "", vodUrl: "", eventsNote: "" }
            }
          />
        </Panel>
      ) : null}
    </>
  );
}
