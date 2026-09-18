"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import type { AppTheme } from "@/lib/theme";

export function AppThemeProvider({
  children,
  defaultTheme,
}: {
  children: ReactNode;
  defaultTheme: AppTheme;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={false}
      disableTransitionOnChange
      storageKey="ow-manager-theme"
    >
      {children}
    </ThemeProvider>
  );
}
