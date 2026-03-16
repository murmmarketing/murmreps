import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import ReferralBanner from "@/components/ReferralBanner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  title: "MurmReps — Find the best reps, all in one place",
  description:
    "500+ verified products with honest QC reviews and buy links across 8 agents. Search reps for shoes, streetwear, bags, and jewelry.",
  openGraph: {
    title: "MurmReps — Find the best reps, all in one place",
    description:
      "500+ verified products with honest QC reviews and buy links across 8 agents.",
    type: "website",
    siteName: "MurmReps",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "MurmReps — Find the best reps, all in one place",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} font-body bg-void text-text-primary antialiased`}
      >
        <ReferralBanner />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
