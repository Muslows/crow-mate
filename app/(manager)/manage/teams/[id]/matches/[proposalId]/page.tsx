import Link from "next/link";
import { notFound } from "next/navigation";
import { ScrimStaffExchange } from "@/components/scrims/ScrimStaffExchange";
import { ValidatedScrimActions } from "@/components/scrims/ValidatedScrimActions";
import { TeamOpsLinks } from "@/components/teams/TeamOpsLinks";
import { getAcceptedScrimExchange } from "@/lib/data/validated-scrims";
import { requireAuthSession } from "@/lib/session";
import { acceptedScrimLabel } from "@/lib/scrim-config";
import { teamDisplayName } from "@/lib/team-name";

export default async function ValidatedScrimDetailPage({
  params,
}: {
  params: Promise<{ id: string; proposalId: string }>;
}) {
  const session = await requireAuthSession();
  const { id, proposalId } = await params;
  const exchange = await getAcceptedScrimExchange(
    proposalId,
    id,
    session.user.id,
  );
  if (!exchange) notFound();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-3">
        <p className="section-kicker">Staff exchange</p>
        <h1 className="text-3xl font-semibold uppercase tracking-wide">
          {teamDisplayName(exchange.ours.name, exchange.ours.org?.tag)} vs{" "}
          {teamDisplayName(exchange.opponent.name, exchange.opponent.org?.tag)}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {acceptedScrimLabel(
            exchange.proposal.weekday,
            exchange.proposal.slot,
          )}
        </p>
        <TeamOpsLinks teamId={id} current="matches" />
        <Link
          href={`/manage/teams/${id}/matches`}
          className="text-sm text-orange-600 underline underline-offset-4 dark:text-orange-400"
        >
          Retour aux scrims validés
        </Link>
        <ValidatedScrimActions
          proposalId={proposalId}
          viewerTeamId={id}
          opponentName={teamDisplayName(
            exchange.opponent.name,
            exchange.opponent.org?.tag,
          )}
          currentUserId={session.user.id}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ScrimStaffExchange
          title="Notre équipe"
          team={exchange.ours}
          config={exchange.ours.scrimConfig}
        />
        <ScrimStaffExchange
          title="Équipe adverse"
          highlight
          team={exchange.opponent}
          config={exchange.opponent.scrimConfig}
        />
      </div>
    </main>
  );
}
