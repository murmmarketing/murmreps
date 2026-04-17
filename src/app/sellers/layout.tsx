import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Weidian & Taobao Sellers for Reps 2026",
  description:
    "Trusted Weidian and Taobao sellers for replica shoes, clothing, jewelry, and bags. Verified stores with consistent quality.",
  openGraph: {
    title: "Best Weidian & Taobao Sellers for Reps 2026 | MurmReps",
    description:
      "Trusted Weidian and Taobao sellers for replica shoes, clothing, jewelry, and bags. Verified stores with consistent quality.",
  },
  alternates: { canonical: "/sellers" },
};

export default function SellersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
