import Link from "next/link";
import { LftAnnouncementForm } from "@/components/annonces/LftAnnouncementForm";
import { AnnouncementList } from "@/components/scrims/AnnouncementList";
import { getActiveLftForUser } from "@/lib/data/announcements";
import { formatLftHeadline } from "@/lib/lft";
import { WEEKDAY_SLOT_FIELDS } from "@/lib/availability";
import { db } from "@/lib/db";
import { requireAuthSession } from "@/lib/session";
import { civilToIso, weekSnapshot, WEEKDAY_KEYS } from "@/lib/week";
import { EnablePlayerAccessCard } from "@/components/account/EnableAccessCards";

export default async function PlayerLftPage() {
  const session = await requireAuthSession();
  const profile = await db.playerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10">
        <EnablePlayerAccessCard />
      </main>
    );
  }

  const weekStart = civilToIso(weekSnapshot().currentStart);
  const availability = await db.weeklyAvailability.findUnique({
    where: {
      playerId_weekStartDate: {
        playerId: profile.id,
        weekStartDate: new Date(`${weekStart}T00:00:00.000Z`),
      },
    },
  });
  const weekdays = WEEKDAY_KEYS.filter((day) => {
    const field = WEEKDAY_SLOT_FIELDS[day];
    return (availability?.[field] ?? []).length > 0;
  });
  const headline = formatLftHeadline({
    region: "EU",
    platform: "PC",
    estimatedSr: profile.sr,
    weekdays,
    startHour: 20,
    endHour: 22,
    role: profile.role,
  });
  const active = await getActiveLftForUser(session.user.id);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10">
      <div>
        <p className="section-kicker">Joueur</p>
        <h1 className="mt-2 text-3xl font-semibold uppercase tracking-wide">
          Recherche d’équipe
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Publie une annonce LFT éphémère. Elle apparaît dans le hub Annonces
          et sur les salons Discord{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em] dark:bg-zinc-800">
            /setup-team-channel
          </code>
          .
        </p>
      </div>
      {active ? (
        <AnnouncementList
          title="Ton annonce active"
          empty=""
          items={[active]}
          currentUserId={session.user.id}
        />
      ) : (
        <LftAnnouncementForm headline={headline} />
      )}
      <Link href="/annonces?vue=lft" className="hud-btn-ghost w-fit">
        Voir le hub Annonces
      </Link>
    </main>
  );
}
