import Link from "next/link";
import { StructureMark } from "@/components/structures/StructureMark";
import { Panel } from "@/components/ui/Panel";
import { getAccessibleStructures } from "@/lib/data/structures";
import { requireAuthSession } from "@/lib/session";
import { teamDisplayName } from "@/lib/team-name";

export default async function OrgDashboardPage() {
  const session = await requireAuthSession();
  const structures = await getAccessibleStructures(session.user.id);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
          Écurie
        </p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-wide">
          Mes structures
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Rattache ou détache des équipes entières. La suppression d&apos;une
          équipe n&apos;efface pas la structure.
        </p>
      </div>
      {structures.length === 0 ? (
        <p className="text-sm text-zinc-400">
          Aucune structure. Un administrateur doit te désigner owner, ou un
          owner doit t&apos;ajouter au staff.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {structures.map((structure) => (
            <li key={structure.id}>
              <Panel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <StructureMark
                    tag={structure.tag}
                    name={structure.name}
                    logoUrl={structure.logoUrl}
                  />
                  <div>
                    <p className="font-mono text-xs text-cyan-400">
                      {structure.tag}
                    </p>
                    <p className="text-2xl font-semibold uppercase">
                      {structure.name}
                    </p>
                    <p className="font-mono text-sm text-zinc-400">
                      {structure.teams.length} équipe
                      {structure.teams.length > 1 ? "s" : ""}
                      {structure.teams[0]
                        ? ` · ${teamDisplayName(structure.teams[0].name, structure.tag)}`
                        : ""}
                    </p>
                  </div>
                </div>
                <Link href={`/org/${structure.id}`} className="hud-btn">
                  Gérer les équipes
                </Link>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
