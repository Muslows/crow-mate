import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { requireAdminSession } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminSession();
  const pathname = (await headers()).get("x-pathname") ?? "";

  const items = [
    { href: "/admin", label: "Structures", match: (path: string) => path === "/admin" },
    {
      href: "/admin/discord",
      label: "Bot Discord",
      match: (path: string) => path.startsWith("/admin/discord"),
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <nav
        aria-label="Administration"
        className="flex flex-wrap gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1 dark:border-white/10 dark:bg-surface/5"
      >
        {items.map((item) =>
          item.match(pathname) ? (
            <span
              key={item.href}
              className="rounded-full bg-orange-400 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-black"
            >
              {item.label}
            </span>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-zinc-600 transition hover:text-orange-600 dark:text-zinc-300 dark:hover:text-orange-200"
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>
      {children}
    </div>
  );
}
