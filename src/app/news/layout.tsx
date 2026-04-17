import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News & Updates",
  description:
    "Latest drops, agent deals, and rep community updates from MurmReps.",
  openGraph: {
    title: "News & Updates",
    description:
      "Latest drops, agent deals, and rep community updates from MurmReps.",
    url: "/news",
  },
  twitter: {
    title: "News & Updates",
    description:
      "Latest drops, agent deals, and rep community updates from MurmReps.",
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
