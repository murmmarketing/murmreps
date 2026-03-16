import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QC Photo Checker \u2014 Check Quality Before You Buy | MurmReps",
  description:
    "Paste any Taobao, Weidian, or 1688 link to find QC photos across 6 agents. Check stitching, tags, and shape before you ship your haul.",
  openGraph: {
    title: "QC Photo Checker \u2014 Check Quality Before You Buy | MurmReps",
    description:
      "Find QC photos for any rep product across 6 agents before you buy.",
    url: "/qc",
  },
  twitter: {
    title: "QC Photo Checker \u2014 Check Quality Before You Buy | MurmReps",
    description:
      "Find QC photos for any rep product across 6 agents before you buy.",
  },
  alternates: { canonical: "/qc" },
};

export default function QCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
