import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Buy Reps in 2026 \u2014 Step-by-Step Beginner Guide | MurmReps",
  description:
    "Learn how to buy reps from Taobao and Weidian using an agent. 11-step interactive guide covering agents, QC photos, shipping, and tracking.",
  openGraph: {
    title: "How to Buy Reps in 2026 \u2014 Step-by-Step Beginner Guide | MurmReps",
    description:
      "11-step interactive guide to buying reps from Taobao and Weidian using an agent.",
    url: "/guide",
  },
  twitter: {
    title: "How to Buy Reps in 2026 \u2014 Step-by-Step Beginner Guide | MurmReps",
    description:
      "11-step interactive guide to buying reps from Taobao and Weidian using an agent.",
  },
  alternates: { canonical: "/guide" },
};

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
