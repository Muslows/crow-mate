import type { ReactNode } from "react";

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`hud-card p-4 ${className}`}
    >
      {children}
    </section>
  );
}
