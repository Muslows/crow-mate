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
      className={`border border-cyan-400/25 bg-black/35 p-4 shadow-[inset_0_0_0_1px_rgba(255,154,31,0.08)] ${className}`}
    >
      {children}
    </section>
  );
}
