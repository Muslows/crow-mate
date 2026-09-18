import { Suspense } from "react";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Panel } from "@/components/ui/Panel";

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-16">
      <p className="section-kicker">Compte</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Nouveau mot de passe
      </h1>
      <Panel>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </Panel>
      <Link href="/login" className="text-sm text-zinc-400 underline hover:text-zinc-200">
        Retour à la connexion
      </Link>
    </main>
  );
}
