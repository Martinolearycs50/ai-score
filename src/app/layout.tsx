'use client';

import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Suspense } from "react";
import Navigation from "@/components/Navigation";
import { TierProvider } from "@/contexts/TierContext";
import TierDebug from "@/components/TierDebug";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Note: Metadata export removed because this is now a client component due to TierProvider

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <TierProvider>
            <Navigation />
            {children}
            <TierDebug />
          </TierProvider>
        </Suspense>
      </body>
    </html>
  );
}
