import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import ReferralBanner from "@/components/ReferralBanner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingReferral from "@/components/FloatingReferral";
import SearchModal from "@/components/SearchModal";
import ClientProviders from "@/components/ClientProviders";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://murmreps.com"),
  title: {
    default: "MurmReps \u2014 Find the Best Rep Finds | 19,000+ Products",
    template: "%s | MurmReps",
  },
  description:
    "Discover 19,000+ handpicked rep finds with QC photos. Free link converter for 8 shopping agents. New drops every week.",
  keywords: "reps, replica fashion, rep finds, weidian finds, taobao finds, fashion reps, best reps, QC photos",
  openGraph: {
    title: "MurmReps \u2014 Find the Best Rep Finds | 19,000+ Products",
    description:
      "Discover 19,000+ handpicked rep finds with QC photos. Free link converter for 8 shopping agents. New drops every week.",
    type: "website",
    siteName: "MurmReps",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "MurmReps \u2014 Find the Best Rep Finds | 19,000+ Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@murmreps",
    title: "MurmReps \u2014 Find the Best Rep Finds | 19,000+ Products",
    description:
      "Discover 19,000+ handpicked rep finds with QC photos. Free link converter for 8 shopping agents. New drops every week.",
    images: ["/og-image.svg"],
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "ZYcMnAEmiS4z-i7K0TNqJdO26Ucoh1ofdhhqLhDEZRk",
  },
  other: {
    "tiktok-developers-site-verification": "AnS27eKEP3beb486LWNWpZSf9EtrZDhR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="dns-prefetch" href="//pxdkqylraptallrkiaab.supabase.co" />
        <link rel="preconnect" href="https://pxdkqylraptallrkiaab.supabase.co" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} font-body bg-void text-text-primary antialiased`}
      >
        <GoogleAnalytics />
        <ClientProviders>
          <ReferralBanner />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <FloatingReferral />
          <SearchModal />
        </ClientProviders>
      </body>
    </html>
  );
}
