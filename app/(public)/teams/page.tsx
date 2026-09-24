import { TeamCard } from "@/components/teams/TeamCard";
import { TeamFilters } from "@/components/teams/TeamFilters";
import { parseEloSearchBand, parsePlatformParam } from "@/lib/data/filters";
import { parseQueryParam, parseSpokenLanguageParam } from "@/lib/languages";
import { getPublicTeams } from "@/lib/data/teams";
import { getFairPlayIndexes } from "@/lib/data/fair-play";
import { emptyFairPlayIndex } from "@/lib/fair-play";

export default async function PublicTeamsPage({
  searchParams,
}: {
  searchParams: Promise<{
    platform?: string;
    elo?: string;
    sensitivity?: string;
    q?: string;
    lang?: string;
  }>;
}) {
  const params = await searchParams;
  const platform = parsePlatformParam(params.platform);
  const language = parseSpokenLanguageParam(params.lang);
  const query = parseQueryParam(params.q);
  const band = parseEloSearchBand(params.elo, params.sensitivity);
  let teams: Awaited<ReturnType<typeof getPublicTeams>> = [];
  let fairPlay: Awaited<ReturnType<typeof getFairPlayIndexes>> = new Map();
  let loadError = false;
  try {
    teams = await getPublicTeams({
      query,
      platform,
      language,
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
        <h1 className="text-3xl font-semibold tracking-tight">Équipes</h1>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Trouve un roster par nom, langue, plateforme ou niveau estimé.
        </p>
      </div>
      <TeamFilters
        query={query ?? ""}
        platform={platform ?? ""}
        language={language ?? ""}
        elo={params.elo}
        sensitivity={params.sensitivity}
      />
      {loadError ? (
        <p className="rounded-xl border border-orange-800/70 bg-orange-950/40 px-4 py-3 text-sm text-orange-200">
          Impossible de joindre la base. Vérifie DATABASE_URL (pooler Supabase
          :6543) sur Vercel.
        </p>
      ) : null}
      {teams.length === 0 && !loadError ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Aucune équipe pour ces filtres.</p>
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
