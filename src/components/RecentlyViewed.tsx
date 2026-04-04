"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePreferences } from "@/lib/usePreferences";

interface RecentProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  price_cny: number | null;
  image: string;
  viewedAt: number;
}

const STORAGE_KEY = "murmreps_recently_viewed";
const MAX_ITEMS = 20;

export function addRecentlyViewed(product: { id: number; name: string; brand: string; category: string; price_cny: number | null; image: string }) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as RecentProduct[];
    const filtered = stored.filter((p) => p.id !== product.id);
    const entry: RecentProduct = { ...product, viewedAt: Date.now() };
    const updated = [entry, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { /* */ }
}

export default function RecentlyViewed() {
  const [items, setItems] = useState<RecentProduct[]>([]);
  const { formatPrice } = usePreferences();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as RecentProduct[];
      setItems(stored);
    } catch { /* */ }
  }, []);

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  };

  if (items.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-white">Recently Viewed</h2>
        <button onClick={clear} className="text-xs text-text-muted hover:text-white transition-colors">Clear</button>
      </div>
      <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-pl-4 px-4 pr-4 sm:mx-0 sm:px-0 sm:scroll-pl-0">
        {items.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.id}`}
            className="group w-40 shrink-0 snap-start overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20"
          >
            <div className="aspect-square overflow-hidden bg-[#0a0a0a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-contain" onError={(e) => { (e.currentTarget.parentElement!.parentElement as HTMLElement).style.display = "none"; }} />
            </div>
            <div className="p-2.5">
              <p className="text-xs font-semibold text-white line-clamp-1">{p.name}</p>
              <p className="text-[10px] text-text-muted">{p.brand}</p>
              {p.price_cny != null && (
                <p className="mt-1 text-xs font-bold text-white">{formatPrice(p)}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
