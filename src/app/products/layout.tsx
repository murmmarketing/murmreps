import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "500+ Rep Finds \u2014 Shoes, Streetwear, Bags, Jewelry | MurmReps",
  description:
    "Browse and filter 500+ curated rep products. Compare prices across tiers, check quality ratings, and buy through 8 trusted agents.",
  openGraph: {
    title: "500+ Rep Finds \u2014 Shoes, Streetwear, Bags, Jewelry | MurmReps",
    description:
      "Browse and filter 500+ curated rep products with buy links across 8 agents.",
    url: "/products",
  },
  twitter: {
    title: "500+ Rep Finds \u2014 Shoes, Streetwear, Bags, Jewelry | MurmReps",
    description:
      "Browse and filter 500+ curated rep products with buy links across 8 agents.",
  },
  alternates: { canonical: "/products" },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
