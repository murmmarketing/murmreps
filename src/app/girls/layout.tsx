import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Her \u2014 Women's Rep Finds",
  description:
    "1,800+ curated women's fashion finds \u2014 bags, shoes, jewelry, clothing. Handpicked from the best sellers with QC photos.",
  keywords: "women reps, women fashion finds, rep bags, rep shoes, women weidian finds",
  openGraph: {
    title: "For Her \u2014 Women's Rep Finds",
    description:
      "1,800+ curated women's fashion finds \u2014 bags, shoes, jewelry, clothing. Handpicked from the best sellers with QC photos.",
    url: "/girls",
  },
  twitter: {
    title: "For Her \u2014 Women's Rep Finds",
    description:
      "1,800+ curated women's fashion finds \u2014 bags, shoes, jewelry, clothing.",
  },
  alternates: { canonical: "/girls" },
};

export default function GirlsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
