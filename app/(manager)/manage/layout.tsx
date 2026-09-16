import type { ReactNode } from "react";
import { requireAuthSession } from "@/lib/session";

export default async function ManagerLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuthSession();
  return <>{children}</>;
}
