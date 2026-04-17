import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MurmReps Giveaways — Win Free Hauls",
  description:
    "Enter MurmReps giveaways for a chance to win free hauls, agent credits, and exclusive prizes. Join Discord and follow us to enter.",
  openGraph: {
    title: "MurmReps Giveaways — Win Free Hauls",
    description:
      "Enter MurmReps giveaways for a chance to win free hauls, agent credits, and exclusive prizes.",
  },
  alternates: { canonical: "/giveaway" },
};

export default function GiveawayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
