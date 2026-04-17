"use client";

import { useState } from "react";

const carriers = [
  { name: "Auto-detect (17track)", id: "17track", url: (tn: string) => `https://www.17track.net/en/track?nums=${tn}` },
  { name: "EMS / ePacket", id: "ems", url: (tn: string) => `https://www.17track.net/en/track?nums=${tn}` },
  { name: "Yanwen", id: "yanwen", url: (tn: string) => `https://www.17track.net/en/track?nums=${tn}` },
  { name: "DHL", id: "dhl", url: (tn: string) => `https://www.dhl.com/en/express/tracking.html?AWB=${tn}` },
  { name: "FedEx", id: "fedex", url: (tn: string) => `https://www.fedex.com/fedextrack/?trknbr=${tn}` },
  { name: "UPS", id: "ups", url: (tn: string) => `https://www.ups.com/track?tracknum=${tn}` },
  { name: "USPS", id: "usps", url: (tn: string) => `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${tn}` },
  { name: "PostNL", id: "postnl", url: (tn: string) => `https://postnl.nl/tracktrace/?B=${tn}` },
  { name: "Royal Mail", id: "royalmail", url: (tn: string) => `https://www.royalmail.com/track-your-item#/tracking-results/${tn}` },
];

const altTrackers = [
  { name: "Parcelsapp", url: "https://parcelsapp.com/en" },
  { name: "Fujexp", url: "https://fujexp.com" },
  { name: "Track24", url: "https://track24.net" },
];

const shippingLines = [
  { name: "EMS", time: "10–20 days", description: "Government postal, reliable for large hauls. Good tracking." },
  { name: "E-EMS", time: "7–15 days", description: "Faster than regular EMS. Slightly more expensive." },
  { name: "SAL", time: "20–40 days", description: "Cheapest option. Slow but saves money on heavy hauls." },
  { name: "DHL", time: "5–10 days", description: "Express shipping. Fast but expensive and strict customs." },
  { name: "FedEx", time: "5–10 days", description: "Express. Fast delivery, good tracking." },
  { name: "China Post", time: "15–30 days", description: "Budget option for small, lightweight packages." },
  { name: "Yanwen", time: "15–25 days", description: "Economy line. Decent value for lighter parcels." },
  { name: "UPS", time: "5–10 days", description: "Express. Reliable but pricey." },
];

const faq = [
  {
    q: "How long does shipping take from China?",
    a: "It depends on the shipping line. EMS takes 10-20 days, DHL/FedEx 5-10 days, and SAL 20-40 days. Most people use EMS for the best balance of speed and price.",
  },
  {
    q: "Why is my tracking not updating?",
    a: "Chinese tracking often goes silent for 5-10 days while the parcel is in transit or at customs. This is normal. If it hasn't updated in 20+ days, contact your agent.",
  },
  {
    q: "What's the cheapest shipping method?",
    a: "SAL is the cheapest but slowest (20-40 days). For a better balance, EMS or E-EMS gives you decent speed at a reasonable price. DHL/FedEx are the fastest but most expensive.",
  },
  {
    q: "My parcel is stuck at customs. What do I do?",
    a: "Most parcels clear customs in 1-3 days. If it's been longer, check your local customs authority website. You may need to pay import duties or provide documentation.",
  },
  {
    q: "How much does shipping cost?",
    a: "Typically ¥20-40 per 500g for EMS, ¥50-80 per 500g for DHL/FedEx. Heavier hauls get better per-kg rates. Your agent will show exact costs before you ship.",
  },
];

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [selectedCarrier, setSelectedCarrier] = useState("17track");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleTrack = () => {
    const tn = trackingNumber.trim();
    if (!tn) return;
    const carrier = carriers.find((c) => c.id === selectedCarrier) || carriers[0];
    window.open(carrier.url(tn), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Track Your Parcel
      </h1>
      <p className="mt-3 text-text-secondary">
        Track shipments from any carrier — enter your tracking number below
      </p>

      {/* Track input */}
      <div className="mt-8 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              placeholder="Enter tracking number..."
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              className="w-full rounded-card border border-subtle bg-surface py-3 pl-12 pr-4 text-sm text-white placeholder-text-muted outline-none transition-colors focus:border-accent/50"
            />
          </div>
          <button
            onClick={handleTrack}
            disabled={!trackingNumber.trim()}
            className="shrink-0 rounded-btn bg-accent px-8 py-3 text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(254,66,5,0.15)] disabled:opacity-40 sm:w-auto"
          >
            Track
          </button>
        </div>

        {/* Carrier selector */}
        <select
          value={selectedCarrier}
          onChange={(e) => setSelectedCarrier(e.target.value)}
          className="w-full rounded-btn border border-subtle bg-surface px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-accent/50 sm:w-auto"
        >
          {carriers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Alternative trackers */}
      <div className="mt-8">
        <p className="text-sm text-text-secondary">Or try these trackers:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {altTrackers.map((t) => (
            <a
              key={t.name}
              href={t.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-pill border border-subtle bg-surface px-4 py-2 text-xs font-medium text-white transition-all duration-200 hover:border-accent hover:text-accent"
            >
              {t.name}
            </a>
          ))}
        </div>
      </div>

      {/* Shipping times */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-bold text-white">
          Shipping times &amp; carriers
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {shippingLines.map((line) => (
            <div
              key={line.name}
              className="rounded-card border border-subtle bg-surface p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-semibold text-white">
                  {line.name}
                </h3>
                <span className="rounded-pill bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                  {line.time}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-text-secondary">
                {line.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-bold text-white">
          Shipping FAQ
        </h2>
        <div className="mt-6 space-y-3">
          {faq.map((item, i) => (
            <div
              key={i}
              className="rounded-card border border-subtle bg-surface"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <span className="text-sm font-medium text-white">
                  {item.q}
                </span>
                <svg
                  className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
              {openFaq === i && (
                <div className="border-t border-subtle px-4 pb-4 pt-3">
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
