import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QC Photo Guide \u2014 How to Check Quality Before You Buy",
  description:
    "Learn how to read QC photos, what to look for in shoes, clothing, bags, and jewelry. Free QC request generator for Reddit.",
  openGraph: {
    title: "QC Photo Guide \u2014 How to Check Quality Before You Buy",
    description:
      "Learn how to read QC photos, what to look for, and where to find them. Free QC request generator.",
    url: "/qc",
  },
  twitter: {
    title: "QC Photo Guide \u2014 How to Check Quality Before You Buy",
    description:
      "Learn how to read QC photos, what to look for, and where to find them.",
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
