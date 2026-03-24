import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Her — Women's Finds",
  description:
    "Curated reps and finds for women — bags, accessories, shoes, clothing and more. Browse 500+ items from top brands.",
  openGraph: {
    title: "For Her — MurmReps",
    description: "Curated finds for women — bags, accessories, shoes, clothing and more.",
  },
};

export default function GirlsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
