import { CancelTeamCreateButton } from "@/components/teams/CancelTeamCreateButton";
import { TeamForm } from "@/components/teams/TeamForm";
import { Panel } from "@/components/ui/Panel";
import { requireAuthSession } from "@/lib/session";

export default async function NewTeamPage() {
  await requireAuthSession();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold uppercase tracking-wide">
          Créer une équipe
        </h1>
        <CancelTeamCreateButton />
      </div>
      <Panel>
        <TeamForm mode="create" />
      </Panel>
    </main>
  );
}
