import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rep Link Converter \u2014 Convert Taobao/Weidian Links to 8 Agents",
  description:
    "Instantly convert any Taobao, Weidian, or 1688 product link into buy links for KakoBuy, Superbuy, CnFans, and 5 more agents.",
  openGraph: {
    title: "Rep Link Converter \u2014 Convert Taobao/Weidian Links to 8 Agents",
    description:
      "Instantly convert any Taobao, Weidian, or 1688 link into agent buy links.",
    url: "/converter",
  },
  twitter: {
    title: "Rep Link Converter \u2014 Convert Taobao/Weidian Links to 8 Agents",
    description:
      "Instantly convert any Taobao, Weidian, or 1688 link into agent buy links.",
  },
  alternates: { canonical: "/converter" },
};

export default function ConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
