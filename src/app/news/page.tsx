"use client";

import Link from "next/link";
import newsData from "@/data/news.json";
import productsData from "@/data/products.json";
import { usePreferences } from "@/lib/usePreferences";

const tagColors: Record<string, { bg: string; text: string }> = {
  announcement: { bg: "bg-blue-500/15", text: "text-blue-400" },
  "new products": { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  update: { bg: "bg-accent/15", text: "text-accent" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const trendingProducts = productsData.slice(0, 5);

export default function NewsPage() {
  const { formatPrice } = usePreferences();
  const sorted = [...newsData].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          News &amp; updates
        </h1>
        <p className="mt-2 text-text-muted">
          Latest from{" "}
          <span className="text-accent">@murmreps</span>
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* Main feed */}
        <div className="flex flex-col gap-6">
          {sorted.map((post) => (
            <article
              key={post.id}
              className="rounded-card border border-subtle bg-[#141414] p-6"
            >
              {/* Tags */}
              <div className="mb-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => {
                  const color = tagColors[tag] ?? {
                    bg: "bg-white/10",
                    text: "text-text-secondary",
                  };
                  return (
                    <span
                      key={tag}
                      className={`rounded-pill px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${color.bg} ${color.text}`}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>

              {/* Title */}
              <h2 className="font-heading text-lg font-semibold text-white">
                {post.title}
              </h2>

              {/* Date + author */}
              <p className="mt-1 text-xs text-text-muted">
                {formatDate(post.date)} &middot; by {post.author}
              </p>

              {/* Content */}
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                {post.content}
              </p>
            </article>
          ))}
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6">
          {/* Trending products */}
          <div className="rounded-card border border-subtle bg-[#141414] p-5">
            <h3 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-text-muted">
              Trending products
            </h3>
            <div className="flex flex-col gap-3">
              {trendingProducts.map((p) => (
                <Link
                  key={p.id}
                  href="/products"
                  className="group flex items-center justify-between gap-3 rounded-btn px-2 py-1.5 transition-colors hover:bg-surface"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white group-hover:text-accent">
                      {p.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatPrice(p)}
                    </p>
                  </div>
                  <svg
                    className="h-4 w-4 flex-shrink-0 text-text-muted transition-colors group-hover:text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Join community */}
          <div className="rounded-card border border-accent/30 bg-[#141414] p-5">
            <h3 className="mb-3 font-heading text-sm font-semibold text-white">
              Join the community
            </h3>
            <p className="mb-4 text-xs text-text-muted">
              Follow <span className="text-accent">@murmreps</span> for daily
              finds, haul reviews, and exclusive drops.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="https://instagram.com/murmreps"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-btn bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                Instagram
              </a>
              <a
                href="https://tiktok.com/@murmreps"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-btn bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46 6.27 6.27 0 001.88-4.47V8.76a8.25 8.25 0 004.84 1.56V6.87a4.85 4.85 0 01-1.14-.18z" />
                </svg>
                TikTok
              </a>
              <a
                href="https://discord.gg/8r5EFMRg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-btn bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Discord
              </a>
            </div>
          </div>

          {/* Support us */}
          <div className="rounded-card border border-subtle bg-[#141414] p-5">
            <h3 className="mb-2 font-heading text-sm font-semibold text-white">
              Support us
            </h3>
            <p className="mb-4 text-xs leading-relaxed text-text-muted">
              Sign up for an agent through our referral links. It helps us keep
              MurmReps free and updated.
            </p>
            <a
              href="https://ikako.vip/r/6gkjt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-btn bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
            >
              Sign up with KakoBuy
              <svg
                className="h-3.5 w-3.5"
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
          </div>
        </aside>
      </div>
    </div>
  );
}
