import { TeamCard } from "@/components/teams/TeamCard";
import { TeamFilters } from "@/components/teams/TeamFilters";
import { parseEloBound, parsePlatformParam } from "@/lib/data/filters";
import { filterTeamsByPublicQuery, getPublicTeams } from "@/lib/data/teams";
import { averageSr } from "@/lib/elo";

export default async function PublicDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; eloMin?: string; eloMax?: string }>;
}) {
  const params = await searchParams;
  const platform = parsePlatformParam(params.platform);
  const eloMin = parseEloBound(params.eloMin);
  const eloMax = parseEloBound(params.eloMax);
  const teams = filterTeamsByPublicQuery(await getPublicTeams({ platform }), {
    platform,
    eloMin,
    eloMax,
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
          Scouting board
        </p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-wide">
          Équipes Overwatch
        </h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Explore les rosters publics et filtre par plateforme ou SR moyen.
        </p>
      </div>
      <TeamFilters
        platform={platform ?? ""}
        eloMin={params.eloMin}
        eloMax={params.eloMax}
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
              averageSr={averageSr(team.players)}
            />
          ))}
        </section>
      )}
    </main>
  );
}
