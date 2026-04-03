import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products \u2014 15,000+ Rep Finds",
  description:
    "Browse 15,000+ verified rep finds across 45+ categories. Compare prices across 8 shopping agents. New products added daily.",
  openGraph: {
    title: "All Products \u2014 15,000+ Rep Finds | MurmReps",
    description:
      "Browse 15,000+ verified rep finds across 45+ categories. Compare prices across 8 shopping agents.",
    url: "/products",
  },
  twitter: {
    title: "All Products \u2014 15,000+ Rep Finds | MurmReps",
    description:
      "Browse 15,000+ verified rep finds across 45+ categories. Compare prices across 8 shopping agents.",
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
