import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parcel Tracking \u2014 Track Your Rep Haul Shipment",
  description:
    "Track your rep haul shipment with 17track, Parcelsapp, and other trackers. Covers EMS, SAL, FedEx, DHL, and all major shipping lines.",
  openGraph: {
    title: "Parcel Tracking \u2014 Track Your Rep Haul Shipment",
    description:
      "Track your rep haul shipment with 17track and other tracking services.",
    url: "/tracking",
  },
  twitter: {
    title: "Parcel Tracking \u2014 Track Your Rep Haul Shipment",
    description:
      "Track your rep haul shipment with 17track and other tracking services.",
  },
  alternates: { canonical: "/tracking" },
};

export default function TrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
