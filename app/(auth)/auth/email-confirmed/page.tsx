import { Suspense } from "react";
import { EmailConfirmedStatus } from "@/components/auth/EmailConfirmedStatus";
import { Panel } from "@/components/ui/Panel";
import { Spinner } from "@/components/ui/Spinner";

export default function EmailConfirmedPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-16">
      <p className="section-kicker">Compte</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Email validé
      </h1>
      <Panel>
        <Suspense
          fallback={
            <p className="inline-flex items-center gap-2 text-sm text-muted">
              <Spinner />
              Confirmation de ton adresse…
            </p>
          }
        >
          <EmailConfirmedStatus />
        </Suspense>
      </Panel>
    </main>
  );
}
