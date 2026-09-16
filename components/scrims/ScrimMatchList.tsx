import Link from "next/link";
import { ProposeScrimButton } from "@/components/scrims/ProposeScrimButton";
import type { ScrimMatchCandidate } from "@/lib/data/scrim-match";
import { teamDisplayName } from "@/lib/team-name";

export function ScrimMatchList({
  fromTeamId,
  weekStartDate,
  matches,
}: {
  fromTeamId: string;
  weekStartDate: string;
  matches: ScrimMatchCandidate[];
}) {
  if (matches.length === 0) {
    return (
      <p className="text-sm text-zinc-400">
        Aucune équipe dans cette tranche de SR ne partage un créneau 20h/21h
        cette semaine.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {matches.map((match) => (
        <li key={match.teamId} className="hud-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href={`/teams/${match.teamId}`}
                className="text-lg font-bold uppercase tracking-wide hover:text-orange-200"
              >
                {teamDisplayName(match.name, match.orgTag)}
              </Link>
              <p className="mt-1 text-sm text-zinc-400">
                {match.estimatedSr} SR · {match.labels.join(" · ")}
              </p>
            </div>
            <ProposeScrimButton
              fromTeamId={fromTeamId}
              toTeamId={match.teamId}
              toName={match.name}
              orgTag={match.orgTag}
              weekStartDate={weekStartDate}
              commonSlots={match.commonSlots}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
