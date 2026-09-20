import Link from "next/link";

export function DiscordDmBlockedBanner({
  inset = false,
}: {
  inset?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-2xl border border-orange-300 bg-orange-50 px-4 py-2.5 text-sm text-orange-950 dark:border-orange-800/70 dark:bg-orange-950/40 dark:text-orange-100 ${
        inset ? "w-full" : "mx-auto mt-2 max-w-6xl"
      }`}
    >
      <p>
        Veuillez rejoindre le Discord officiel de la plateforme et y activer les
        MP des membres du serveur pour recevoir nos alertes.
      </p>
      <Link href="/profile/settings/notifications" className="hud-btn-ghost shrink-0">
        Notifications
      </Link>
    </div>
  );
}
