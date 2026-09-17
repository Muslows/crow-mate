import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <Header />
        <div className="relative z-0 flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
