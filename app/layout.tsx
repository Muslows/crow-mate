import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { Inter, Rajdhani } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { AuthHashHandler } from "@/components/auth/AuthHashHandler";
import { AppThemeProvider } from "@/components/theme/AppThemeProvider";
import { parseAppTheme, THEME_COOKIE } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Crow-mate",
  description:
    "Plateforme tout-en-un pour gérer, recruter et matcher vos équipes Overwatch.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const theme = parseAppTheme((await cookies()).get(THEME_COOKIE)?.value);
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${rajdhani.variable} ${theme} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground" suppressHydrationWarning>
        <AppThemeProvider defaultTheme={theme}>
          <AuthHashHandler />
          <Header />
          <div className="relative z-0 flex flex-1 flex-col">{children}</div>
        </AppThemeProvider>
      </body>
    </html>
  );
}
