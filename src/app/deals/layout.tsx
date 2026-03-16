import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rep Deals & Promotions \u2014 Limited Time Offers | MurmReps",
  description:
    "Curated rep deals with the best prices, updated regularly. Nike, Moncler, Chrome Hearts, and more at steep discounts for a limited time.",
  openGraph: {
    title: "Rep Deals & Promotions \u2014 Limited Time Offers | MurmReps",
    description:
      "Curated rep deals with the best prices, updated regularly. Limited time offers.",
    url: "/deals",
  },
  twitter: {
    title: "Rep Deals & Promotions \u2014 Limited Time Offers | MurmReps",
    description:
      "Curated rep deals with the best prices, updated regularly. Limited time offers.",
  },
  alternates: { canonical: "/deals" },
};

export default function DealsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
