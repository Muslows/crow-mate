import { PlayerSearchFilters } from "@/components/players/PlayerSearchFilters";
import { PlayerScoutCard } from "@/components/players/PlayerScoutCard";
import {
  parseEloSearchBand,
  parseOpenPlayParams,
} from "@/lib/data/filters";
import { getPublicPlayers } from "@/lib/data/players";
import { parseLanguageParams, parseQueryParam } from "@/lib/languages";

export default async function PublicPlayersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    elo?: string;
    sensitivity?: string;
    lang?: string | string[];
    open?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = parseQueryParam(params.q);
  const band = parseEloSearchBand(params.elo, params.sensitivity);
  const languages = parseLanguageParams(params.lang);
  const openRoles = parseOpenPlayParams(params.open);
  let players: Awaited<ReturnType<typeof getPublicPlayers>> = [];
  let loadError = false;
  try {
    players = await getPublicPlayers({
      query,
      eloMin: band?.min,
      eloMax: band?.max,
      languages,
      openRoles,
    });
  } catch (error) {
    console.error("public players", error);
    loadError = true;
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Joueurs</h1>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Cherche un profil par pseudo. Les filtres restent optionnels.
        </p>
      </div>
      {loadError ? (
        <p className="rounded-xl border border-orange-800/70 bg-orange-950/40 px-4 py-3 text-sm text-orange-200">
          Impossible de joindre la base. Vérifie DATABASE_URL (pooler Supabase
          :6543) sur Vercel.
        </p>
      ) : null}
      <PlayerSearchFilters
        query={query ?? ""}
        elo={params.elo}
        sensitivity={params.sensitivity}
        languages={languages}
        openRoles={openRoles}
      />
      {players.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Aucun joueur pour ces filtres.</p>
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
