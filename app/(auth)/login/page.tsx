import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Panel } from "@/components/ui/Panel";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
        Accès manager
      </p>
      <h1 className="text-3xl font-semibold uppercase tracking-wide">Connexion</h1>
      <Panel>
        <Suspense>
          <LoginForm />
        </Suspense>
      </Panel>
      <Link href="/register" className="text-sm text-cyan-300 underline">
        Pas encore de compte ?
      </Link>
    </main>
  );
}
