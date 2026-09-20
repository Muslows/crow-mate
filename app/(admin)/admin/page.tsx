import { StructureCreateForm } from "@/components/structures/StructureCreateForm";
import { StructureOwnerForm } from "@/components/structures/StructureOwnerForm";
import { StructureMark } from "@/components/structures/StructureMark";
import { Panel } from "@/components/ui/Panel";
import {
  getStructuresForAdmin,
  listUsersForOwnerPicker,
} from "@/lib/data/structures";
import { getReportsForAdmin, reportTargetLabel } from "@/lib/data/reports";
import { labelFor, REPORT_REASONS } from "@/lib/constants";
import { publicDisplayName } from "@/lib/privacy";
import { requireAdminSession } from "@/lib/session";

export default async function AdminDashboardPage() {
  await requireAdminSession();
  const [structures, users, reports] = await Promise.all([
    getStructuresForAdmin(),
    listUsersForOwnerPicker(),
    getReportsForAdmin(),
  ]);

  return (
    <>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
          Admin
        </p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-wide">
          Structures
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Crée une écurie et désigne son owner. Les équipes restent optionnelles.
        </p>
      </div>
      <Panel>
        <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-cyan-400">
          Nouvelle structure
        </h2>
        <StructureCreateForm users={users} />
      </Panel>
      {structures.length === 0 ? (
        <p className="text-sm text-zinc-400">Aucune structure pour le moment.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {structures.map((structure) => (
            <li key={structure.id}>
              <Panel className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <StructureMark
                    tag={structure.tag}
                    name={structure.name}
                    logoUrl={structure.logoUrl}
                  />
                  <div>
                    <p className="font-mono text-xs text-cyan-400">
                      {structure.tag}
                    </p>
                    <h2 className="text-2xl font-semibold uppercase">
                      {structure.name}
                    </h2>
                    <p className="mt-1 font-mono text-sm text-zinc-400">
                      Owner {structure.owner.name} · {structure._count.teams}{" "}
                      équipe{structure._count.teams > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <StructureOwnerForm
                  structureId={structure.id}
                  ownerId={structure.ownerId}
                  users={users}
                />
              </Panel>
            </li>
          ))}
        </ul>
      )}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-semibold uppercase tracking-wide">
            Signalements
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Modération des fiches joueur et équipe.
          </p>
        </div>
        {reports.length === 0 ? (
          <p className="text-sm text-zinc-400">Aucun signalement.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {reports.map((report) => (
              <li key={report.id}>
                <Panel>
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-orange-300">
                    {report.targetType === "TEAM" ? "Équipe" : "Joueur"} ·{" "}
                    {labelFor(REPORT_REASONS, report.reason)}
                  </p>
                  <p className="mt-2 text-lg font-semibold uppercase tracking-wide text-cyan-100">
                    {reportTargetLabel(report)}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Par{" "}
                    {publicDisplayName({
                      displayName: report.reporter.playerProfile?.displayName,
                      name: report.reporter.name,
                    })}{" "}
                    · {report.createdAt.toLocaleString("fr-FR")}
                  </p>
                  {report.details.trim() ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-200">
                      {report.details}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-zinc-500">Sans détail.</p>
                  )}
                </Panel>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
