import { Geist, Geist_Mono, Inter } from "next/font/google";
import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import ClientWrapper from "@/components/ClientWrapper";
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

export const metadata: Metadata = {
  title: 'AI Search Score - Free AI Search Visibility Analyzer',
  description: 'Analyze your website\'s AI search visibility with our free tool. Get actionable insights to improve your ranking in ChatGPT, Claude, Perplexity, and other AI search engines.',
  metadataBase: new URL('https://aisearchscore.com'),
  openGraph: {
    title: 'AI Search Score - Free AI Search Visibility Analyzer',
    description: 'Analyze your website\'s AI search visibility',
    type: 'website',
  },
};

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
        <ClientWrapper>
          <Navigation />
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
