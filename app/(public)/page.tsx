import { TeamCard } from "@/components/teams/TeamCard";
import { TeamFilters } from "@/components/teams/TeamFilters";
import { parseEloSearchBand, parsePlatformParam } from "@/lib/data/filters";
import { getPublicTeams } from "@/lib/data/teams";
import { getFairPlayIndexes } from "@/lib/data/fair-play";
import { emptyFairPlayIndex } from "@/lib/fair-play";

export default async function PublicDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    platform?: string;
    elo?: string;
    sensitivity?: string;
  }>;
}) {
  const params = await searchParams;
  const platform = parsePlatformParam(params.platform);
  const band = parseEloSearchBand(params.elo, params.sensitivity);
  const teams = await getPublicTeams({
    platform,
    eloMin: band?.min,
    eloMax: band?.max,
  });
  const fairPlay = await getFairPlayIndexes(teams.map((team) => team.id));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div>
        <p className="section-kicker">
          Scouting board
        </p>
        <h1 className="mt-2 text-4xl font-bold uppercase tracking-wide">
          Équipes Overwatch
        </h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Explore les rosters publics. Filtre par plateforme et par niveau estimé
          (Élo cible ± sensibilité).
        </p>
      </div>
      <TeamFilters
        platform={platform ?? ""}
        elo={params.elo}
        sensitivity={params.sensitivity}
      />
      {teams.length === 0 ? (
        <p className="text-sm text-zinc-400">Aucune équipe pour ces filtres.</p>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              id={team.id}
              name={team.name}
              platform={team.platform}
              structure={team.structure}
              language={team.language}
              estimatedSr={team.estimatedSr}
              orgTag={team.org?.tag}
              orgId={team.orgId}
              orgName={team.org?.name}
              parentTeamId={team.parentTeamId}
              parentName={team.parentTeam?.name}
              academyCount={team.academyTeams.length}
              fairPlay={fairPlay.get(team.id) ?? emptyFairPlayIndex()}
            />
          ))}
        </section>
      )}
    </main>
  );
}
