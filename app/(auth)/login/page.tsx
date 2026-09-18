import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Panel } from "@/components/ui/Panel";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-16">
      <p className="section-kicker">Accès manager</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Connexion</h1>
      <Panel>
        <Suspense>
          <LoginForm />
        </Suspense>
      </Panel>
      <Link href="/register" className="text-sm text-zinc-400 underline hover:text-zinc-200">
        Pas encore de compte ?
      </Link>
    </main>
  );
}
