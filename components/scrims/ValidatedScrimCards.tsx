import Link from "next/link";
import { acceptedScrimLabel } from "@/lib/scrim-config";
import { teamDisplayName } from "@/lib/team-name";
import { utcDateToIso, weekDays, WEEKDAY_KEYS, type WeekdayKey, isMondayIso } from "@/lib/week";
import { ValidatedScrimActions } from "@/components/scrims/ValidatedScrimActions";
import type { OfficialScrimSlot } from "@prisma/client";

type TeamChip = {
  id: string;
  name: string;
  estimatedSr: number;
  org: { tag: string } | null;
};

export type ValidatedScrimCardData = {
  id: string;
  weekday: string;
  slot: OfficialScrimSlot;
  weekStartDate: Date;
  fromTeam: TeamChip;
  toTeam: TeamChip;
};

function matchDateLabel(weekStartDate: Date, weekday: string) {
  const weekIso = utcDateToIso(weekStartDate);
  const index = WEEKDAY_KEYS.indexOf(weekday as WeekdayKey);
  if (index < 0 || !isMondayIso(weekIso)) return weekIso;
  const days = weekDays(utcDateToIso(weekStartDate));
  const iso = days[index]?.iso;
  if (!iso) return utcDateToIso(weekStartDate);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00.000Z`));
}

export function ValidatedScrimCards({
  viewerTeamId,
  viewerTeamIds,
  currentUserId,
  matches,
}: {
  viewerTeamId?: string;
  viewerTeamIds?: string[] | null;
  currentUserId: string;
  matches: ValidatedScrimCardData[];
}) {
  if (matches.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Aucun scrim validé pour le moment.
      </p>
    );
  }

  const owned = new Set(viewerTeamIds ?? (viewerTeamId ? [viewerTeamId] : []));

  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {matches.map((match) => {
        const ourId = owned.has(match.fromTeam.id)
          ? match.fromTeam.id
          : owned.has(match.toTeam.id)
            ? match.toTeam.id
            : (viewerTeamId ?? match.toTeam.id);
        const opponent =
          match.fromTeam.id === ourId ? match.toTeam : match.fromTeam;
        const opponentName = teamDisplayName(
          opponent.name,
          opponent.org?.tag,
        );
        return (
          <li key={match.id}>
            <article className="hud-card flex h-full flex-col gap-4 p-4 transition hover:border-orange-400/60">
              <Link
                href={`/manage/teams/${ourId}/matches/${match.id}`}
                className="block"
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
                  {matchDateLabel(match.weekStartDate, match.weekday)} ·{" "}
                  {acceptedScrimLabel(match.weekday, match.slot)}
                </p>
                <p className="mt-2 text-lg font-semibold uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
                  vs {opponentName}
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {opponent.estimatedSr > 0
                    ? `${opponent.estimatedSr} SR estimé`
                    : "SR non renseigné"}
                </p>
              </Link>
              <ValidatedScrimActions
                proposalId={match.id}
                viewerTeamId={ourId}
                opponentName={opponentName}
                currentUserId={currentUserId}
              />
            </article>
          </li>
        );
      })}
    </ul>
  );
}
