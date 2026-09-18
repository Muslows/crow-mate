import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Panel } from "@/components/ui/Panel";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-16">
      <p className="section-kicker">Compte</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Mot de passe oublié
      </h1>
      <p className="text-sm text-zinc-400">
        Saisis l’email du compte. Si un compte existe, tu recevras un lien
        valable une heure.
      </p>
      <Panel>
        <ForgotPasswordForm />
      </Panel>
      <Link href="/login" className="text-sm text-zinc-400 underline hover:text-zinc-200">
        Retour à la connexion
      </Link>
    </main>
  );
}
