import { PlayerSearchFilters } from "@/components/players/PlayerSearchFilters";
import { PlayerScoutCard } from "@/components/players/PlayerScoutCard";
import { parseEloBound } from "@/lib/data/filters";
import { getPublicPlayers } from "@/lib/data/players";
import { parseLanguageParams, parseQueryParam } from "@/lib/languages";

export default async function PublicPlayersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    eloMin?: string;
    eloMax?: string;
    lang?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = parseQueryParam(params.q);
  const eloMin = parseEloBound(params.eloMin);
  const eloMax = parseEloBound(params.eloMax);
  const languages = parseLanguageParams(params.lang);
  const players = await getPublicPlayers({
    query,
    eloMin,
    eloMax,
    languages,
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
          Transfer market
        </p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-wide">
          Joueurs
        </h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Tous les profils inscrits, filtrables par pseudo, langues et SR (paliers de
          50).
        </p>
      </div>
      <PlayerSearchFilters
        query={query ?? ""}
        eloMin={params.eloMin}
        eloMax={params.eloMax}
        languages={languages}
      />
      {players.length === 0 ? (
        <p className="text-sm text-zinc-400">Aucun joueur pour ces filtres.</p>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <PlayerScoutCard key={player.id} player={player} />
          ))}
        </section>
      )}
    </main>
  );
}
