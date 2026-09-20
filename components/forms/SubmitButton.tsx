"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  pending: boolean;
  idleLabel: string;
  pendingLabel: string;
  className?: string;
  disabled?: boolean;
};

export function Spinner({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  );
}

export function SubmitButton({
  pending,
  idleLabel,
  pendingLabel,
  className = "hud-btn disabled:opacity-60",
  disabled = false,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={`${className} inline-flex items-center gap-2`}
    >
      {pending ? <Spinner /> : null}
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

export function PendingSubmit({
  idleLabel,
  pendingLabel,
  className = "hud-btn disabled:opacity-60",
}: {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <SubmitButton
      pending={pending}
      idleLabel={idleLabel}
      pendingLabel={pendingLabel}
      className={className}
    />
  );
}
