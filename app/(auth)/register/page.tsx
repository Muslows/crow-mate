import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Panel } from "@/components/ui/Panel";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-16">
      <p className="section-kicker">Compétiteur ou staff</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Inscription
      </h1>
      <Panel>
        <RegisterForm />
      </Panel>
      <Link href="/login" className="text-sm text-zinc-400 underline hover:text-zinc-200">
        Déjà inscrit ?
      </Link>
    </main>
  );
}
