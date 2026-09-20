import { redirect } from "next/navigation";
import { ReactivateAccountForm } from "@/components/account/ReactivateAccountForm";
import { getSession } from "@/lib/session";
import { Panel } from "@/components/ui/Panel";

export default async function ReactivateAccountPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/reactivate");
  if (!session.user.deactivatedAt) redirect("/profile/settings/account");

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-16">
      <p className="section-kicker">Compte désactivé</p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Réactiver mon compte
      </h1>
      <Panel>
        <ReactivateAccountForm
          untilLabel={
            session.user.anonymizeAfter
              ? session.user.anonymizeAfter.toLocaleDateString("fr-FR")
              : undefined
          }
        />
      </Panel>
    </main>
  );
}
