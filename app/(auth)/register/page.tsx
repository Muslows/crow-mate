import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Panel } from "@/components/ui/Panel";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
        Compétiteur ou staff
      </p>
      <h1 className="text-3xl font-semibold uppercase tracking-wide">
        Inscription
      </h1>
      <Panel>
        <RegisterForm />
      </Panel>
      <Link href="/login" className="text-sm text-cyan-300 underline">
        Déjà inscrit ?
      </Link>
    </main>
  );
}
