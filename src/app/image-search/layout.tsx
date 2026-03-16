import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Search \u2014 Find Any Rep Product by Photo | MurmReps",
  description:
    "Upload a photo of any product to find it on 1688.com. Reverse image search for shoes, streetwear, bags, and accessories.",
  openGraph: {
    title: "Image Search \u2014 Find Any Rep Product by Photo | MurmReps",
    description:
      "Upload a photo of any product to find it on 1688.com via reverse image search.",
    url: "/image-search",
  },
  twitter: {
    title: "Image Search \u2014 Find Any Rep Product by Photo | MurmReps",
    description:
      "Upload a photo of any product to find it on 1688.com via reverse image search.",
  },
  alternates: { canonical: "/image-search" },
};

export default function ImageSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
