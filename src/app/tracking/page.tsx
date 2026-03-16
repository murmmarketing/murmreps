"use client";

import { useState } from "react";

const trackers = [
  { name: "17track", url: "https://www.17track.net/en" },
  { name: "Parcelsapp", url: "https://parcelsapp.com/en" },
  { name: "Fujexp", url: "https://fujexp.com" },
  { name: "Track24", url: "https://track24.net" },
];

const shippingLines = [
  {
    name: "EMS",
    description: "Government postal, 10–20 days, good for large hauls",
  },
  {
    name: "SAL",
    description: "Budget option, 20–40 days, cheapest",
  },
  {
    name: "DHL / FedEx / UPS",
    description: "Express, 5–10 days, most expensive",
  },
  {
    name: "China Post",
    description: "Budget, 15–30 days",
  },
  {
    name: "Yanwen",
    description: "Economy, 15–25 days",
  },
  {
    name: "E-EMS",
    description: "Faster EMS, 7–15 days",
  },
];

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleTrack = () => {
    if (!trackingNumber.trim()) return;
    window.open(
      `https://www.17track.net/en/track#nums=${encodeURIComponent(trackingNumber.trim())}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Track your parcel
      </h1>
      <p className="mt-3 text-text-secondary">
        Enter your tracking number to check shipment status
      </p>

      {/* Track input */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
          className="shrink-0 rounded-btn bg-accent px-8 py-3 text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,107,53,0.15)] disabled:opacity-40 sm:w-auto"
        >
          Track
        </button>
      </div>

      {/* Alternative trackers */}
      <div className="mt-8">
        <p className="text-sm text-text-secondary">Or try these trackers:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {trackers.map((t) => (
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

      {/* Common shipping lines */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-bold text-white">
          Common shipping lines
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {shippingLines.map((line) => (
            <div
              key={line.name}
              className="rounded-card border border-subtle bg-surface p-5"
            >
              <h3 className="font-heading text-base font-semibold text-white">
                {line.name}
              </h3>
              <p className="mt-1.5 text-sm text-text-secondary">
                {line.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
