"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { themeCookieSetter, type AppTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme !== "light";

  function toggle() {
    const next: AppTheme = isDark ? "light" : "dark";
    document.cookie = themeCookieSetter(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:border-orange-400 hover:text-orange-500"
      onClick={toggle}
      aria-label={
        mounted
          ? isDark
            ? "Activer le mode clair"
            : "Activer le mode sombre"
          : "Changer de thème"
      }
    >
      {mounted && isDark ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
