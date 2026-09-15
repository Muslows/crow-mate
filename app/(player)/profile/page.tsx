import { redirect } from "next/navigation";
import { EnablePlayerAccessCard } from "@/components/account/EnableAccessCards";
import { db } from "@/lib/db";
import {
  hasPlayerAccess,
  requireAuthSession,
  sessionCapabilities,
} from "@/lib/session";

export default async function PlayerProfilePage() {
  const session = await requireAuthSession();
  if (!hasPlayerAccess(sessionCapabilities(session))) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10">
        <EnablePlayerAccessCard />
      </main>
    );
  }

  const profile = await db.playerProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      sr: 0,
      primaryRole: "DPS",
      favoriteHeroes: [],
      experience: "",
      recruitmentStatus: "LOOKING",
    },
    update: {},
  });

  redirect(`/players/${profile.id}`);
}
