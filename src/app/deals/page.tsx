"use client";

import { useState, useMemo, useEffect } from "react";
import promotions from "@/data/promotions.json";
import BuyModal from "@/components/BuyModal";

type Sort = "newest" | "ending-soon" | "price-asc";

const qualityBadgeStyles: Record<string, string> = {
  best: "bg-[#1DB954]/15 text-[#1DB954]",
  good: "bg-[#F59E0B]/15 text-[#F59E0B]",
  budget: "bg-[#6C757D]/20 text-white",
};

function getTimeLeft(validUntil: string) {
  const diff = new Date(validUntil).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { days, hours };
}

function Countdown({ validUntil }: { validUntil: string }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(validUntil));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(validUntil));
    }, 60_000);
    return () => clearInterval(interval);
  }, [validUntil]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-warning">
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {timeLeft.days}d {timeLeft.hours}h left
    </div>
  );
}

export default function DealsPage() {
  const [sort, setSort] = useState<Sort>("newest");
  const [selectedDeal, setSelectedDeal] = useState<
    (typeof promotions)[0] | null
  >(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const sorted = useMemo(() => {
    const items = [...promotions];
    if (sort === "newest") {
      items.sort(
        (a, b) =>
          (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0) ||
          new Date(b.valid_until).getTime() - new Date(a.valid_until).getTime()
      );
    } else if (sort === "ending-soon") {
      items.sort(
        (a, b) =>
          new Date(a.valid_until).getTime() - new Date(b.valid_until).getTime()
      );
    } else {
      items.sort((a, b) => a.price_cny - b.price_cny);
    }
    return items;
  }, [sort]);

  const isExpired = (validUntil: string) =>
    new Date(validUntil).getTime() <= now;

  const modalProduct = selectedDeal
    ? {
        id: selectedDeal.id,
        name: selectedDeal.title,
        price_cny: selectedDeal.price_cny,
        source_link: selectedDeal.source_link,
        quality: selectedDeal.quality,
      }
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Heading */}
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        <span className="text-white">Deals &amp; promotions </span>
        <span className="text-accent">limited time only.</span>
      </h1>
      <p className="mt-3 text-text-secondary">
        Curated deals with the best prices. Updated regularly.
      </p>

      {/* Sort */}
      <div className="mt-6 flex items-center gap-2">
        {(
          [
            ["newest", "Newest"],
            ["ending-soon", "Ending soon"],
            ["price-asc", "Price low\u2192high"],
          ] as [Sort, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setSort(value)}
            className={`rounded-pill px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
              sort === value
                ? "bg-accent text-white"
                : "border border-subtle bg-surface text-text-secondary hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Deal grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((deal) => {
          const expired = isExpired(deal.valid_until);
          const discount = Math.round(
            ((deal.original_price_cny - deal.price_cny) /
              deal.original_price_cny) *
              100
          );

          return (
            <div
              key={deal.id}
              className={`relative rounded-card border border-[rgba(255,255,255,0.06)] bg-surface transition-all duration-200 ${
                expired
                  ? "opacity-50 grayscale"
                  : "hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-[0_0_20px_rgba(255,107,53,0.05)]"
              }`}
            >
              {/* Image area */}
              <div className="relative flex h-[180px] items-center justify-center rounded-t-card bg-[#1a1a1a]">
                <svg
                  className="h-10 w-10 text-text-muted/20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                  />
                </svg>

                {/* NEW badge */}
                {deal.is_new && !expired && (
                  <span className="absolute left-3 top-3 rounded-pill bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    NEW
                  </span>
                )}

                {/* SALE badge */}
                <span className="absolute right-3 top-3 rounded-pill bg-danger px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  -{discount}%
                </span>

                {/* Expired overlay */}
                {expired && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-t-card bg-black/60">
                    <span className="font-heading text-lg font-bold uppercase tracking-wider text-white/80">
                      EXPIRED
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-heading text-base font-semibold text-white">
                  {deal.title}
                </h3>

                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-pill bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                    {deal.brand}
                  </span>
                  {deal.quality && qualityBadgeStyles[deal.quality] && (
                    <span
                      className={`rounded-pill px-2 py-0.5 text-[10px] font-medium ${qualityBadgeStyles[deal.quality]}`}
                    >
                      {deal.quality}
                    </span>
                  )}
                </div>

                <p className="mt-2.5 text-xs leading-relaxed text-text-muted line-clamp-2">
                  {deal.description}
                </p>

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-heading text-xl font-bold text-accent">
                    &yen;{deal.price_cny}
                  </span>
                  <span className="text-sm text-text-muted line-through">
                    &yen;{deal.original_price_cny}
                  </span>
                </div>

                {/* Countdown */}
                {!expired && (
                  <div className="mt-2.5">
                    <Countdown validUntil={deal.valid_until} />
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={() => !expired && setSelectedDeal(deal)}
                  disabled={expired}
                  className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-btn py-2.5 text-sm font-semibold transition-all duration-200 ${
                    expired
                      ? "cursor-not-allowed bg-[#333] text-text-muted"
                      : "bg-accent text-white hover:shadow-[0_0_20px_rgba(255,107,53,0.15)]"
                  }`}
                >
                  {expired ? "Expired" : "Get deal"}
                  {!expired && (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <BuyModal
        product={modalProduct}
        onClose={() => setSelectedDeal(null)}
      />
    </div>
  );
}
