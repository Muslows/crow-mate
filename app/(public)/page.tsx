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
  let teams: Awaited<ReturnType<typeof getPublicTeams>> = [];
  let fairPlay: Awaited<ReturnType<typeof getFairPlayIndexes>> = new Map();
  let loadError = false;
  try {
    teams = await getPublicTeams({
      platform,
      eloMin: band?.min,
      eloMax: band?.max,
    });
    fairPlay = await getFairPlayIndexes(teams.map((team) => team.id));
  } catch (error) {
    console.error("public teams", error);
    loadError = true;
  }

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
      {loadError ? (
        <p className="rounded-xl border border-orange-400/30 bg-orange-400/10 px-4 py-3 text-sm text-orange-200">
          Impossible de joindre la base de données. Vérifie DATABASE_URL /
          DIRECT_URL et le mot de passe Postgres sur Vercel.
        </p>
      ) : null}
      {teams.length === 0 && !loadError ? (
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
