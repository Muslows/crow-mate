import Link from "next/link";
import { DiscordSettingsForm } from "@/components/account/DiscordSettingsForm";
import { ProfileForm } from "@/components/players/ProfileForm";
import { Panel } from "@/components/ui/Panel";
import { db } from "@/lib/db";
import { requireAuthSession, sessionCapabilities } from "@/lib/session";

export default async function CompetitiveProfileSettingsPage() {
  const session = await requireAuthSession();
  const caps = sessionCapabilities(session);
  const [account, profile] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { discord: true, isDiscordPublic: true },
    }),
    caps.isPlayer
      ? db.playerProfile.findUnique({ where: { userId: session.user.id } })
      : null,
  ]);

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold">Profil & compétitif</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Identité publique, BattleTag, rôles de jeu et informations
          compétitives. Pour un LFT,{" "}
          <Link
            href="/profile/lft"
            className="font-medium text-orange-700 underline underline-offset-2 dark:text-orange-300"
          >
            publie une annonce de recherche d’équipe
          </Link>
          .
        </p>
      </div>
      {profile ? (
        <Panel>
          <ProfileForm profile={profile} />
        </Panel>
      ) : (
        <Panel>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Active d’abord ton profil joueur depuis « Mes rôles plateforme ».
          </p>
        </Panel>
      )}
      <DiscordSettingsForm
        discord={account.discord}
        discordPublic={account.isDiscordPublic}
      />
    </>
  );
}
