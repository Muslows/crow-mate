import { AccountSecurityForms } from "@/components/account/AccountSecurityForms";
import { DeactivateAccountForm } from "@/components/account/DeactivateAccountForm";
import { db } from "@/lib/db";
import { requireAuthSession } from "@/lib/session";

export default async function AccountSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ reactivated?: string }>;
}) {
  const session = await requireAuthSession();
  const query = await searchParams;
  const account = await db.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      email: true,
      pendingEmail: true,
    },
  });

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold">Mon compte</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Email, mot de passe et cycle de vie du compte.
        </p>
      </div>
      {query.reactivated === "1" ? (
        <p
          role="status"
          className="rounded-xl border border-lime-300 bg-lime-50 p-3 text-sm text-lime-900 dark:border-lime-800 dark:bg-lime-950/40 dark:text-lime-100"
        >
          Ton compte a été réactivé.
        </p>
      ) : null}
      <AccountSecurityForms
        email={account.email}
        emailVerified={session.user.emailVerified}
        pendingEmail={account.pendingEmail}
      />
      <DeactivateAccountForm />
    </>
  );
}
