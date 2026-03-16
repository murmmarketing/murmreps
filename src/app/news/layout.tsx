import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News & Updates — Community Updates from MurmReps",
  description:
    "Stay up to date with MurmReps news, new product drops, agent updates, and community announcements. Follow @murmreps for the latest.",
  openGraph: {
    title: "News & Updates — Community Updates from MurmReps",
    description:
      "Stay up to date with MurmReps news, new product drops, and community announcements.",
    url: "/news",
  },
  twitter: {
    title: "News & Updates — Community Updates from MurmReps",
    description:
      "Stay up to date with MurmReps news, new product drops, and community announcements.",
  },
  alternates: { canonical: "/news" },
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
