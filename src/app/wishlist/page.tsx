"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useWishlist } from "@/lib/useWishlist";
import { usePreferences } from "@/lib/usePreferences";
import { useToast } from "@/components/Toast";

const tierColors: Record<string, string> = {
  budget: "bg-[#6B7280]/15 text-[#9CA3AF]",
  value: "bg-[#22C55E]/15 text-[#4ADE80]",
  quality: "bg-[#F97316]/15 text-[#FB923C]",
  premium: "bg-[#EAB308]/15 text-[#FACC15] shadow-[0_0_8px_rgba(234,179,8,0.3)]",
};

interface WishProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  price_cny: number | null;
  price_usd: number | null;
  price_eur: number | null;
  image: string;
  tier: string;
  collection: string;
}

export default function WishlistPage() {
  const wishlist = useWishlist();
  const { formatPrice } = usePreferences();
  const { showToast } = useToast();
  const [products, setProducts] = useState<WishProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);

  // Fetch wishlisted products from Supabase (no collection filter)
  useEffect(() => {
    if (wishlist.ids.length === 0) { setProducts([]); setLoading(false); return; }

    (async () => {
      setLoading(true);
      const numericIds = wishlist.ids.map((id) => parseInt(id)).filter((n) => !isNaN(n));
      if (numericIds.length === 0) { setProducts([]); setLoading(false); return; }

      const { data } = await supabase
        .from("products")
        .select("id, name, brand, category, price_cny, price_usd, price_eur, image, tier, collection")
        .in("id", numericIds);

      setProducts((data as WishProduct[]) || []);
      setLoading(false);
    })();
  }, [wishlist.ids]);

  const shareWishlist = () => {
    const ids = products.map((p) => p.id).join(",");
    navigator.clipboard.writeText(`https://murmreps.com/wishlist?ids=${ids}`);
    showToast("Wishlist link copied!");
  };

  const handleClear = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    wishlist.clear();
    setConfirmClear(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Your wishlist</h1>
          <p className="mt-2 text-text-secondary">
            {products.length} saved item{products.length !== 1 ? "s" : ""}.
          </p>
        </div>
        {products.length > 0 && (
          <div className="flex shrink-0 gap-2">
            <button onClick={shareWishlist} className="rounded-btn border border-subtle px-4 py-2 text-sm font-medium text-white transition-colors hover:border-accent/30 hover:text-accent">Share</button>
            <button onClick={handleClear} className="rounded-btn px-4 py-2 text-sm font-medium text-danger transition-colors duration-200 hover:bg-danger/10">
              {confirmClear ? "Are you sure?" : "Clear all"}
            </button>
          </div>
        )}
      </div>

      {/* Persistence warning */}
      {products.length > 0 && (
        <p className="mt-3 text-xs text-text-muted">
          💡 Your wishlist is saved in your browser. Use the &quot;Share&quot; button to save a permanent link.
        </p>
      )}

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-card border border-[rgba(255,255,255,0.06)] bg-surface p-5">
              <div className="h-40 rounded-btn bg-[#1a1a1a]" />
              <div className="mt-4 h-5 w-3/4 rounded bg-[#1a1a1a]" />
              <div className="mt-2 h-4 w-1/2 rounded bg-[#1a1a1a]" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id}
              className="group rounded-card border border-[rgba(255,255,255,0.06)] bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20">
              <Link href={`/products/${product.id}`}>
                <div className="relative mb-4 h-40 overflow-hidden rounded-btn bg-[#0a0a0a]">
                  {product.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="font-heading text-lg font-bold text-text-muted/40">{product.brand}</span>
                    </div>
                  )}
                  {product.collection === "girls" && (
                    <span className="absolute top-2 left-2 rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-400">Girls</span>
                  )}
                </div>
              </Link>

              <div className="flex items-start justify-between gap-2">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-heading text-base font-semibold text-white hover:text-accent transition-colors">{product.name}</h3>
                </Link>
                {product.tier && tierColors[product.tier] && (
                  <span className={`shrink-0 rounded-pill px-2 py-0.5 text-[10px] font-medium ${tierColors[product.tier]}`}>{product.tier}</span>
                )}
              </div>

              <span className="mt-1 inline-block rounded-pill bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">{product.brand}</span>

              <div className="mt-3">
                <span className="font-heading text-xl font-bold text-white">{formatPrice(product)}</span>
              </div>

              <div className="mt-4 flex gap-2">
                <Link href={`/products/${product.id}`}
                  className="flex-1 rounded-btn bg-accent py-2.5 text-center text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(254,66,5,0.15)]">
                  View
                </Link>
                <button onClick={() => wishlist.remove(String(product.id))}
                  className="rounded-btn border border-danger/30 px-4 py-2.5 text-sm font-medium text-danger transition-colors duration-200 hover:bg-danger/10">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-24 flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface">
            <svg className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <p className="font-heading text-lg font-semibold text-white">No items saved yet</p>
          <p className="mt-2 text-sm text-text-secondary">Tap the heart icon on any product to save it here.</p>
          <Link href="/products" className="mt-6 inline-flex h-10 items-center rounded-btn bg-accent px-6 text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(254,66,5,0.15)]">
            Browse products →
          </Link>
        </div>
      )}
    </div>
  );
}
