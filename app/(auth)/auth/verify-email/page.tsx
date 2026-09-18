import { Suspense } from "react";
import { VerifyEmailStatus } from "@/components/auth/VerifyEmailStatus";
import { Panel } from "@/components/ui/Panel";

export default function VerifyEmailPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-16">
      <p className="section-kicker">Compte</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Vérification d’email
      </h1>
      <Panel>
        <Suspense>
          <VerifyEmailStatus />
        </Suspense>
      </Panel>
    </main>
  );
}
