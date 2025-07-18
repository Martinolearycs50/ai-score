'use client';

import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Suspense, useEffect } from "react";
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
  // Set page title on mount
  useEffect(() => {
    document.title = 'AI Search Score - Free AI Search Visibility Analyzer';
  }, []);

  return (
    <html lang="en">
      <head>
        <meta name="description" content="Analyze your website's AI search visibility with our free tool. Get actionable insights to improve your ranking in ChatGPT, Claude, Perplexity, and other AI search engines." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <TierProvider>
            <Navigation />
            {children}
            {process.env.NODE_ENV === 'development' && <TierDebug />}
          </TierProvider>
        </Suspense>
      </body>
    </html>
  );
}
