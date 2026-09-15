type SubmitButtonProps = {
  pending: boolean;
  idleLabel: string;
  pendingLabel: string;
  className?: string;
  disabled?: boolean;
};

export function SubmitButton({
  pending,
  idleLabel,
  pendingLabel,
  className = "hud-btn disabled:opacity-60",
  disabled = false,
}: SubmitButtonProps) {
  return (
    <button type="submit" disabled={pending || disabled} className={className}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
