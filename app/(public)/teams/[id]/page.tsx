import { LanguageBadges } from "@/components/languages/LanguageBadges";
import { PlayerList } from "@/components/players/PlayerList";
import { getTeamWithPlayers } from "@/lib/data/teams";
import { averageSr } from "@/lib/elo";
import { labelFor, PLATFORMS, STRUCTURES } from "@/lib/constants";
import { notFound } from "next/navigation";

export default async function PublicTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await getTeamWithPlayers(id);
  if (!team) notFound();

  const sr = averageSr(team.players);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
          {labelFor(PLATFORMS, team.platform)} · {labelFor(STRUCTURES, team.structure)}
        </p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-wide">
          {team.name}
        </h1>
        <div className="mt-3">
          <LanguageBadges languages={[team.language]} tone="orange" />
        </div>
        <p className="mt-2 text-zinc-400">
          {sr === null ? "SR moyen à définir" : `${sr} SR moyen`}
        </p>
      </div>
      <PlayerList players={team.players} />
    </main>
  );
}
