import { DiscordBotPreferencesForm } from "@/components/account/DiscordBotPreferencesForm";
import { getDiscordAccountLink } from "@/lib/data/discord";
import { requireAuthSession } from "@/lib/session";
import Link from "next/link";

export default async function DiscordBotSettingsPage() {
  const session = await requireAuthSession();
  const account = await getDiscordAccountLink(session.user.id);
  const linked = Boolean(account?.discordId);
  const username =
    account?.discordUsername.trim() || account?.discord.trim() || "Discord";

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Configuration Bot Discord
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Choisis précisément quelles alertes le bot peut t’envoyer en message
          privé. Les invitations, messages et propositions restent visibles sur
          le site même si tu coupes un canal Discord.
        </p>
      </div>
      <p
        className={`rounded-xl border p-3 text-sm ${
          linked
            ? "border-cyan-200 bg-cyan-50 text-cyan-900 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-100"
            : "border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        }`}
      >
        {linked
          ? `Compte associé : ${username}. Les options actives ci-dessous déclenchent un embed Discord.`
          : "Aucun compte Discord associé pour l’instant."}{" "}
        <Link
          href="/profile/settings/notifications"
          className="font-semibold underline underline-offset-2"
        >
          Gérer l’association
        </Link>
      </p>
      <DiscordBotPreferencesForm
        linked={linked}
        preferences={{
          notifyDiscordMessages: account?.notifyDiscordMessages ?? true,
          notifyDiscordInvitations: account?.notifyDiscordInvitations ?? true,
          notifyDiscordScrims: account?.notifyDiscordScrims ?? true,
          notifyDiscordCancellations:
            account?.notifyDiscordCancellations ?? true,
        }}
      />
    </>
  );
}
