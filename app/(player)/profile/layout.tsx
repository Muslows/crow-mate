import type { ReactNode } from "react";
import { requireAuthSession } from "@/lib/session";

export default async function PlayerLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuthSession();
  return <>{children}</>;
}
