import { Panel } from "@/components/ui/Panel";
import { labelFor, STAFF_ROLES } from "@/lib/constants";
import type { StaffRole } from "@prisma/client";

export function StaffRoster({
  staff,
}: {
  staff: { id: string; role: StaffRole; user: { name: string } }[];
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm uppercase tracking-[0.16em] text-cyan-400">
        Staff
      </h2>
      {staff.length === 0 ? (
        <p className="text-sm text-zinc-400">
          Aucun membre du staff n&apos;est encore configuré pour cette structure.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {staff.map((member) => (
            <li key={member.id}>
              <Panel>
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-orange-300">
                  {labelFor(STAFF_ROLES, member.role)}
                </p>
                <p className="mt-2 text-lg font-semibold uppercase">
                  {member.user.name}
                </p>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
