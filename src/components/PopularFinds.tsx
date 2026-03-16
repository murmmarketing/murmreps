"use client";

import Link from "next/link";
import { useRef } from "react";
import products from "@/data/products.json";

const tierColors: Record<string, string> = {
  budget: "bg-verified/10 text-verified",
  mid: "bg-accent/10 text-accent",
  premium: "bg-danger/10 text-danger",
};

const popular = products.slice(0, 8);

export default function PopularFinds() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 256; // card width + gap
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-white">
          Popular finds
        </h2>
        <div className="flex items-center gap-3">
          {/* Desktop arrows */}
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => scroll("left")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-white transition-colors duration-200 hover:bg-accent/20"
              aria-label="Scroll left"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-white transition-colors duration-200 hover:bg-accent/20"
              aria-label="Scroll right"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-accent transition-colors duration-200 hover:text-accent/80"
          >
            See all &rarr;
          </Link>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
      >
        {popular.map((product) => (
          <Link
            key={product.id}
            href="/products"
            className="group w-60 shrink-0 snap-start rounded-card border border-[rgba(255,255,255,0.06)] bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20"
          >
            {/* Image placeholder */}
            <div className="flex h-[140px] items-center justify-center rounded-t-card bg-[#1a1a1a]">
              <span className="text-xs font-medium text-text-muted">
                {product.brand}
              </span>
            </div>

            <div className="p-4">
              <h3 className="line-clamp-2 font-heading text-sm font-semibold leading-tight text-white">
                {product.name}
              </h3>

              <span className="mt-2 inline-block rounded-pill bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                {product.brand}
              </span>

              <div className="mt-2 flex items-center gap-2">
                <span className="font-heading text-base font-bold text-white">
                  {product.price_cny != null ? <>&yen;{product.price_cny}</> : <span className="text-sm text-text-muted">No price</span>}
                </span>
                {product.price_usd != null && (
                  <span className="text-xs text-text-muted">
                    ${product.price_usd}
                  </span>
                )}
                <span
                  className={`ml-auto rounded-pill px-2 py-0.5 text-[10px] font-medium ${tierColors[product.tier]}`}
                >
                  {product.tier}
                </span>
              </div>

              <span className="mt-3 inline-block text-xs font-medium text-accent transition-colors duration-200 group-hover:text-accent/80">
                View &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
