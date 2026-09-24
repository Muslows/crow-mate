import { AnnoncesHubTabs } from "@/components/annonces/AnnoncesHubTabs";
import { AnnouncementList } from "@/components/scrims/AnnouncementList";
import { parseAnnonceVue } from "@/lib/annonces";
import { getActiveAnnouncementsByType } from "@/lib/data/announcements";
import { getSession } from "@/lib/session";

export default async function AnnoncesPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string }>;
}) {
  const { vue: vueParam } = await searchParams;
  const vue = parseAnnonceVue(vueParam);
  let session = null;
  let loadError = false;
  let items: Awaited<ReturnType<typeof getActiveAnnouncementsByType>> = [];

  try {
    session = await getSession();
    const type = vue === "lft" ? "LFT" : vue === "lfp" ? "LFP" : "SCRIM";
    items = await getActiveAnnouncementsByType(type);
  } catch (error) {
    console.error("public annonces", error);
    loadError = true;
  }

  const currentUserId = session?.user.id ?? null;
  const copy =
    vue === "lft"
      ? {
          title: "Recherches d’équipe",
          empty: "Aucune annonce LFT active. Les joueurs publient depuis leur profil.",
        }
      : vue === "lfp"
        ? {
            title: "Recherches de joueurs",
            empty:
              "Aucune annonce LFP active. Les managers publient depuis les postes à pourvoir.",
          }
        : {
            title: "Recherches de scrim",
            empty: "Aucun LFS actif pour le moment.",
          };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <div>
        <p className="section-kicker">Communauté</p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-wide">
          Annonces
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Uniquement des posts actifs et datés : LFS, LFT, puis LFP. Sans
          publication, rien n’apparaît ici.
        </p>
      </div>
      <AnnoncesHubTabs current={vue} />
      {loadError ? (
        <p className="rounded-xl border border-orange-800/70 bg-orange-950/40 px-4 py-3 text-sm text-orange-200">
          Impossible de joindre la base. Vérifie DATABASE_URL (pooler Supabase
          :6543) sur Vercel.
        </p>
      ) : null}
      <AnnouncementList
        title={copy.title}
        empty={copy.empty}
        items={items}
        currentUserId={currentUserId}
        filterable={vue === "scrims"}
      />
    </main>
  );
}
