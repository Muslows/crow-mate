import { TeamForm } from "@/components/teams/TeamForm";
import { Panel } from "@/components/ui/Panel";
import { requireManagerSession } from "@/lib/session";

export default async function NewTeamPage() {
  await requireManagerSession();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-semibold uppercase tracking-wide">
        Créer une équipe
      </h1>
      <Panel>
        <TeamForm mode="create" />
      </Panel>
    </main>
  );
}
