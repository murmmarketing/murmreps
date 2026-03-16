import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Wishlist | MurmReps",
  description:
    "Your saved rep finds. Review your wishlist, compare prices, and buy through 8 trusted agents when you are ready.",
  openGraph: {
    title: "Your Wishlist | MurmReps",
    description: "Your saved rep finds on MurmReps.",
    url: "/wishlist",
  },
  twitter: {
    title: "Your Wishlist | MurmReps",
    description: "Your saved rep finds on MurmReps.",
  },
  alternates: { canonical: "/wishlist" },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
