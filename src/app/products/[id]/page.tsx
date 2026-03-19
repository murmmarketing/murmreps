"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import products from "@/data/products.json";
import { agents } from "@/lib/agents";
import { useWishlist } from "@/lib/useWishlist";
import { useProductStats } from "@/lib/useProductStats";

const tierColors: Record<string, string> = {
  budget: "bg-verified/10 text-verified",
  mid: "bg-accent/10 text-accent",
  premium: "bg-danger/10 text-danger",
};

const qualityBadgeStyles: Record<string, string> = {
  best: "bg-[#1DB954]/15 text-[#1DB954]",
  good: "bg-[#F59E0B]/15 text-[#F59E0B]",
  budget: "bg-[#6C757D]/20 text-white",
};

export default function ProductDetailPage() {
  const params = useParams();
  const product = products.find((p) => p.id === String(params.id));
  const wishlist = useWishlist();
  const productStats = useProductStats();
  const [imgError, setImgError] = useState(false);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-heading text-2xl font-bold text-white">
          Product not found
        </h1>
        <Link
          href="/products"
          className="mt-4 inline-block text-sm text-accent hover:text-accent/80"
        >
          &larr; Back to products
        </Link>
      </div>
    );
  }

  const saved = wishlist.has(product.id);
  const stats = productStats.get(product.id);
  const hasLink = !!product.source_link;
  const similar = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Back link */}
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-white"
      >
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
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        Back to products
      </Link>

      {/* Two column layout */}
      <div className="mt-2 grid gap-8 lg:grid-cols-[55%_1fr]">
        {/* LEFT — Image */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-[#141414]">
            {product.image && !imgError ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-heading text-3xl font-bold text-text-muted/30">
                  {product.brand}
                </span>
              </div>
            )}
          </div>
          {/* Thumbnail strip */}
          {product.image && !imgError && (
            <div className="mt-3 flex gap-2">
              <div className="h-16 w-16 overflow-hidden rounded-lg border-2 border-accent bg-[#141414]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Details */}
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">
            {product.name}
          </h1>

          {/* Price */}
          <div className="mt-4">
            {product.price_cny != null ? (
              <>
                <span className="font-heading text-3xl font-bold text-accent">
                  &yen;{product.price_cny}
                </span>
                <div className="mt-1 flex gap-3 text-sm text-text-muted">
                  {product.price_usd != null && <span>${product.price_usd}</span>}
                  {product.price_eur != null && <span>&euro;{product.price_eur}</span>}
                </div>
              </>
            ) : (
              <div>
                <span className="font-heading text-2xl font-bold text-text-muted">
                  Multi
                </span>
                <p className="mt-1 text-xs text-text-muted">
                  This store has multiple items at different prices
                </p>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-pill bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              {product.brand}
            </span>
            <span
              className={`rounded-pill px-3 py-1 text-xs font-medium ${tierColors[product.tier]}`}
            >
              {product.tier}
            </span>
            {product.quality && qualityBadgeStyles[product.quality] && (
              <span
                className={`rounded-pill px-3 py-1 text-xs font-medium ${qualityBadgeStyles[product.quality]}`}
              >
                {product.quality}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-subtle" />

          {/* Buy section */}
          <div>
            <p className="mb-3 text-sm font-medium text-text-secondary">
              {hasLink
                ? "Buy this item through an agent:"
                : "Sign up with an agent:"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {agents.map((agent) => {
                const url = hasLink
                  ? agent.buildUrl(product.source_link)
                  : agent.referralUrl;
                return (
                  <a
                    key={agent.name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-btn border border-subtle bg-[#141414] px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:border-accent hover:shadow-[0_0_20px_rgba(254,66,5,0.1)]"
                  >
                    {agent.name}
                    <svg
                      className="h-3.5 w-3.5 text-text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            {hasLink && (
              <Link
                href={`/qc?link=${encodeURIComponent(product.source_link)}`}
                className="inline-flex items-center gap-2 rounded-btn border border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:border-accent/30 hover:text-accent"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                  />
                </svg>
                QC Photos
              </Link>
            )}
            <button
              onClick={() => wishlist.toggle(product.id)}
              className={`inline-flex items-center gap-2 rounded-btn border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                saved
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-subtle bg-surface text-white hover:border-accent/30 hover:text-accent"
              }`}
            >
              <svg
                className={`h-4 w-4 ${saved ? "fill-accent" : "fill-none"}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              {saved ? "Saved" : "Add to wishlist"}
            </button>
          </div>

          {/* Like / Dislike */}
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => productStats.vote(product.id, "like")}
              className={`flex items-center gap-1.5 rounded-btn border px-4 py-2 text-sm transition-all duration-200 ${
                stats.userVote === "like"
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-subtle bg-surface text-text-secondary hover:border-accent/30 hover:text-accent"
              }`}
            >
              <span>👍</span>
              <span>{stats.likes}</span>
            </button>
            <button
              onClick={() => productStats.vote(product.id, "dislike")}
              className={`flex items-center gap-1.5 rounded-btn border px-4 py-2 text-sm transition-all duration-200 ${
                stats.userVote === "dislike"
                  ? "border-danger/30 bg-danger/10 text-danger"
                  : "border-subtle bg-surface text-text-secondary hover:border-danger/30 hover:text-danger"
              }`}
            >
              <span>👎</span>
              <span>{stats.dislikes}</span>
            </button>
            <span className="flex items-center gap-1.5 text-sm text-text-muted">
              <span>👁</span>
              <span>{stats.views} views</span>
            </span>
          </div>
        </div>
      </div>

      {/* Similar products */}
      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-heading text-xl font-bold text-white">
            Similar products
          </h2>
          <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
            {similar.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="group w-60 shrink-0 snap-start rounded-card border border-[rgba(255,255,255,0.06)] bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 sm:w-auto"
              >
                <div className="relative h-[140px] overflow-hidden rounded-t-card bg-[#141414]">
                  {p.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs font-medium text-text-muted">
                        {p.brand}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 font-heading text-sm font-semibold leading-tight text-white">
                    {p.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-heading text-base font-bold text-white">
                      {p.price_cny != null ? (
                        <>&yen;{p.price_cny}</>
                      ) : (
                        <span className="text-sm text-text-muted">Multi</span>
                      )}
                    </span>
                    <span
                      className={`ml-auto rounded-pill px-2 py-0.5 text-[10px] font-medium ${tierColors[p.tier]}`}
                    >
                      {p.tier}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
