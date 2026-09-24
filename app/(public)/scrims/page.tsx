import { AnnouncementList } from "@/components/scrims/AnnouncementList";
import { getActiveLfsAnnouncements } from "@/lib/data/announcements";
import { getSession } from "@/lib/session";

export default async function PublicScrimsPage() {
  let items: Awaited<ReturnType<typeof getActiveLfsAnnouncements>> = [];
  let session = null;
  let loadError = false;
  try {
    [items, session] = await Promise.all([
      getActiveLfsAnnouncements(),
      getSession(),
    ]);
  } catch (error) {
    console.error("public scrims", error);
    loadError = true;
  }
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div>
        <p className="section-kicker">Matchmaking</p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-wide">
          LF Scrim
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Annonces de recherche de scrim encore valides. L’auteur, le manager ou
          le capitaine peut les retirer à tout moment : le bot les efface aussi
          sur Discord.
        </p>
      </div>
      {loadError ? (
        <p className="rounded-xl border border-orange-800/70 bg-orange-950/40 px-4 py-3 text-sm text-orange-200">
          Impossible de joindre la base. Vérifie DATABASE_URL (pooler Supabase
          :6543) sur Vercel.
        </p>
      ) : null}
      <AnnouncementList
        title="Annonces publiques"
        empty="Aucun LFS actif pour le moment."
        items={items}
        currentUserId={session?.user.id ?? null}
        filterable
      />
    </main>
  );
}
