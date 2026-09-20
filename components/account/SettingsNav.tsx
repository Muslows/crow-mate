"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/profile/settings/account", label: "Mon compte" },
  { href: "/profile/settings/profile", label: "Profil & compétitif" },
  { href: "/profile/settings/roles", label: "Mes rôles plateforme" },
  { href: "/profile/settings/notifications", label: "Notifications (Bot)" },
  {
    href: "/profile/settings/discord-bot",
    label: "Configuration Bot Discord",
  },
] as const;

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Catégories des paramètres"
      className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible"
    >
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`min-w-max rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-cyan-500 bg-cyan-50 text-cyan-900 dark:border-cyan-500/70 dark:bg-cyan-950/50 dark:text-cyan-100"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
