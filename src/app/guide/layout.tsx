import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tutorials \u2014 How to Buy Reps",
  description:
    "Step-by-step guides on buying reps through shopping agents. Learn how to use KakoBuy, Superbuy, CnFans and more.",
  openGraph: {
    title: "Tutorials \u2014 How to Buy Reps",
    description:
      "Step-by-step guides on buying reps through shopping agents. Learn how to use KakoBuy, Superbuy, CnFans and more.",
    url: "/guide",
  },
  twitter: {
    title: "Tutorials \u2014 How to Buy Reps",
    description:
      "Step-by-step guides on buying reps through shopping agents.",
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
