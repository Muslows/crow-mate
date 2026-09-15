import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Rajdhani, Share_Tech_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const shareTech = Share_Tech_Mono({
  variable: "--font-share-tech",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "OW Manager",
  description: "Plateforme de gestion de rosters Overwatch pour managers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${rajdhani.variable} ${shareTech.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <Header />
        {children}
      </body>
    </html>
  );
}
