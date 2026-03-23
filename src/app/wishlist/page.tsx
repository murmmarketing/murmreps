"use client";

import Link from "next/link";
import { useState } from "react";
import products from "@/data/products.json";
import BuyModal from "@/components/BuyModal";
import { useWishlist } from "@/lib/useWishlist";
import { useProductStats } from "@/lib/useProductStats";

const tierColors: Record<string, string> = {
  budget: "bg-verified/10 text-verified",
  mid: "bg-accent/10 text-accent",
  premium: "bg-danger/10 text-danger",
};

export default function WishlistPage() {
  const wishlist = useWishlist();
  const productStats = useProductStats();
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof products)[0] | null
  >(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const saved = products.filter((p) => wishlist.has(String(p.id)));

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    wishlist.clear();
    setConfirmClear(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Your wishlist
          </h1>
          <p className="mt-2 text-text-secondary">
            Items you&apos;ve saved. Stored locally on this device.
          </p>
        </div>
        {saved.length > 0 && (
          <button
            onClick={handleClear}
            className="shrink-0 rounded-btn px-4 py-2 text-sm font-medium text-danger transition-colors duration-200 hover:bg-danger/10"
          >
            {confirmClear ? "Are you sure?" : "Clear all"}
          </button>
        )}
      </div>

      {saved.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((product) => (
            <div
              key={product.id}
              className="group rounded-card border border-[rgba(255,255,255,0.06)] bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-[0_0_20px_rgba(254,66,5,0.05)]"
            >
              {/* Product image */}
              <div className="relative mb-4 h-40 overflow-hidden rounded-btn bg-[#0a0a0a]">
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
                      fallback.className = "font-heading text-lg font-bold text-text-muted/40";
                      fallback.textContent = product.brand;
                      target.parentElement!.appendChild(fallback);
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-heading text-lg font-bold text-text-muted/40">
                      {product.brand}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading text-base font-semibold text-white">
                  {product.name}
                </h3>
                <span
                  className={`shrink-0 rounded-pill px-2 py-0.5 text-[10px] font-medium ${tierColors[product.tier]}`}
                >
                  {product.tier}
                </span>
              </div>

              <span className="mt-1 inline-block rounded-pill bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                {product.brand}
              </span>

              <div className="mt-3">
                {product.price_cny != null ? (
                  <>
                    <span className="font-heading text-xl font-bold text-white">
                      &yen;{product.price_cny}
                    </span>
                    {product.price_usd != null && (
                      <span className="ml-2 text-xs text-text-secondary">
                        ${product.price_usd}
                        {product.price_eur != null && <> / &euro;{product.price_eur}</>}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="font-heading text-lg font-bold text-text-muted">Multi</span>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedProduct(product);
                  }}
                  className="flex-1 rounded-btn bg-accent py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(254,66,5,0.15)]"
                >
                  Buy
                </button>
                <button
                  onClick={() => wishlist.remove(String(product.id))}
                  className="rounded-btn border border-danger/30 px-4 py-2.5 text-sm font-medium text-danger transition-colors duration-200 hover:bg-danger/10"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-24 flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface">
            <svg
              className="h-8 w-8 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </div>
          <p className="font-heading text-lg font-semibold text-white">
            No items saved yet
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Tap the heart icon on any product to save it here.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-10 items-center rounded-btn bg-accent px-6 text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(254,66,5,0.15)]"
          >
            Browse products &rarr;
          </Link>
        </div>
      )}

      <BuyModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        stats={selectedProduct ? productStats.get(String(selectedProduct.id), selectedProduct as { views?: number; likes?: number; dislikes?: number }) : undefined}
      />
    </div>
  );
}
