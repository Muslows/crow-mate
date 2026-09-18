import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { AppThemeProvider } from "@/components/theme/AppThemeProvider";
import { parseAppTheme, THEME_COOKIE } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OW Manager",
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
      className={`${inter.variable} ${theme} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground" suppressHydrationWarning>
        <AppThemeProvider defaultTheme={theme}>
          <Header />
          <div className="relative z-0 flex flex-1 flex-col">{children}</div>
        </AppThemeProvider>
      </body>
    </html>
  );
}
