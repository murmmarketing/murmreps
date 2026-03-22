"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import staticProducts from "@/data/products.json";

const tierColors: Record<string, string> = {
  budget: "bg-verified/10 text-verified",
  mid: "bg-accent/10 text-accent",
  premium: "bg-danger/10 text-danger",
};

interface PopularProduct {
  id: number;
  name: string;
  brand: string;
  price_cny: number | null;
  price_usd: number | null;
  tier: string;
  image: string;
  views: number;
}

export default function PopularFinds() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [popular, setPopular] = useState<PopularProduct[]>([]);

  useEffect(() => {
    async function fetchTrending() {
      try {
        // Fetch top 8 by views with price
        const { data, error } = await supabase
          .from("products")
          .select("id, name, brand, price_cny, price_usd, tier, image, views")
          .not("price_cny", "is", null)
          .order("views", { ascending: false })
          .limit(8);

        if (error) throw error;

        // If all views are 0, shuffle so it's not always the same
        const hasViews = data?.some((p) => (p.views ?? 0) > 0);
        if (data && !hasViews) {
          for (let i = data.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [data[i], data[j]] = [data[j], data[i]];
          }
        }

        if (data && data.length > 0) {
          setPopular((data as PopularProduct[]).filter((p) => !!p.image));
        } else {
          throw new Error("No data");
        }
      } catch {
        // Fallback to static JSON
        const withPrice = staticProducts.filter((p) => p.price_cny != null && !!p.image);
        setPopular(
          withPrice.slice(0, 8).map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            price_cny: p.price_cny,
            price_usd: p.price_usd,
            tier: p.tier,
            image: p.image,
            views: 0,
          }))
        );
      }
    }
    fetchTrending();
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 256;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (popular.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-white">
          Trending now
        </h2>
        <div className="flex items-center gap-3">
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
            href={`/products/${product.id}`}
            className="group w-60 shrink-0 snap-start rounded-card border border-[rgba(255,255,255,0.06)] bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20"
          >
            {/* Product image */}
            <div className="relative h-[140px] overflow-hidden rounded-t-card bg-[#0a0a0a]">
              {product.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    target.parentElement!.classList.add("flex", "items-center", "justify-center");
                    const fallback = document.createElement("span");
                    fallback.className = "text-xs font-medium text-text-muted";
                    fallback.textContent = product.brand;
                    target.parentElement!.appendChild(fallback);
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-xs font-medium text-text-muted">
                    {product.brand}
                  </span>
                </div>
              )}
              {/* View count badge */}
              {product.views > 0 && (
                <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white/70 backdrop-blur-sm">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {product.views}
                </span>
              )}
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
                  {product.price_cny != null ? <>&yen;{product.price_cny}</> : <span className="text-sm font-bold text-text-muted">Multi</span>}
                </span>
                {product.price_usd != null && (
                  <span className="text-xs text-text-muted">
                    ${product.price_usd}
                  </span>
                )}
                <span
                  className={`ml-auto rounded-pill px-2 py-0.5 text-[10px] font-medium ${tierColors[product.tier] ?? ""}`}
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
