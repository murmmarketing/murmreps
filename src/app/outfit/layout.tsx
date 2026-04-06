import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Outfit Generator — Random Outfit Ideas",
  description:
    "Generate random outfit combinations from 15,000+ fashion finds. Streetwear, dark aesthetic, old money, hypebeast styles.",
  openGraph: {
    title: "Outfit Generator — Random Outfit Ideas | MurmReps",
    description:
      "Generate random outfit combinations from 15,000+ fashion finds. Streetwear, dark aesthetic, old money, hypebeast styles.",
  },
  alternates: { canonical: "/outfit" },
};

export default function OutfitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
