"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useWishlist } from "@/lib/useWishlist";
import { usePreferences } from "@/lib/usePreferences";
import ProductRow from "@/components/ProductRow";
// Girls products identified by collection = 'girls' in Supabase

type Sort = "best" | "newest" | "popular" | "price-asc" | "price-desc";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price_cny: number | null;
  price_usd: number | null;
  price_eur: number | null;
  tier: string;
  quality: string;
  source_link: string;
  image: string;
  views: number;
  likes: number;
  dislikes: number;
  featured: boolean;
  featured_rank: number | null;
  created_at: string;
}

// Pink palette
const P = {
  primary: "#E8518D",
  light: "#F472B6",
  dark: "#BE185D",
  glow: "rgba(232,81,141,0.15)",
  bg: "#0C0A0E",
  card: "#151218",
  cardHover: "#1C1720",
  text: "#F9F0F5",
  textSec: "#B8A4B0",
  textMuted: "#7A6B75",
  border: "rgba(232,81,141,0.08)",
  borderHover: "rgba(232,81,141,0.2)",
};

const CATEGORIES = [
  { emoji: "✨", label: "All", value: "All" },
  { emoji: "👜", label: "Bags", value: "Bags" },
  { emoji: "👟", label: "Shoes", value: "shoes" },
  { emoji: "💍", label: "Jewelry", value: "jewelry" },
  { emoji: "👗", label: "Tops", value: "tops" },
  { emoji: "👖", label: "Bottoms", value: "bottoms" },
  { emoji: "🧥", label: "Outerwear", value: "outerwear" },
  { emoji: "👛", label: "Wallets", value: "Wallets" },
  { emoji: "💎", label: "Accessories", value: "accessories" },
  { emoji: "⌚", label: "Watches", value: "Watches" },
  { emoji: "🕶️", label: "Sunglasses", value: "Sunglasses" },
  { emoji: "🧴", label: "Perfumes", value: "Perfumes" },
  { emoji: "📱", label: "Phone Cases", value: "Phone Cases" },
  { emoji: "🤵", label: "Old Money", value: "Old Money" },
  { emoji: "🏠", label: "Home", value: "Home & Decor" },
];

const CAT_MAP: Record<string, string[]> = {
  shoes: ["Sneakers", "Shoes", "Boots", "Slides & Sandals"],
  jewelry: ["Necklaces", "Bracelets", "Earrings", "Rings", "Jewelry"],
  tops: ["T-Shirts", "Shirts", "Polos", "Hoodies", "Sweaters", "Crewnecks", "Jerseys", "Long Sleeves", "Tank Tops"],
  bottoms: ["Pants", "Jeans", "Shorts", "Sweatpants"],
  outerwear: ["Jackets", "Coats & Puffers", "Vests", "Tracksuits"],
  accessories: ["Keychains", "Hats & Caps", "Scarves & Gloves", "Glasses", "Socks & Underwear", "Belts", "Ties", "Masks", "Accessories"],
};

function matchCategory(product: Product, filter: string): boolean {
  if (filter === "All") return true;
  if (CAT_MAP[filter]) return CAT_MAP[filter].includes(product.category);
  return product.category === filter;
}

const PER_PAGE = 24;

function GirlsInner() {
  const searchParams = useSearchParams();
  const { formatPrice } = usePreferences();
  const { has: isWishlisted, toggle: toggleWishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [activeCat, setActiveCat] = useState("All");
  const [sort, setSort] = useState<Sort>("best");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // Fetch girls products using collection column
      const all: Product[] = [];
      let offset = 0;
      while (true) {
        const { data } = await supabase
          .from("products")
          .select("*")
          .in("collection", ["girls", "both"])
          .not("image", "is", null)
          .neq("image", "")
          .order("score", { ascending: false })
          .range(offset, offset + 999);
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < 1000) break;
        offset += 1000;
      }
      setProducts(all);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let r = [...products];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    r = r.filter((p) => matchCategory(p, activeCat));
    if (sort === "price-asc") r.sort((a, b) => (a.price_cny ?? 9999999) - (b.price_cny ?? 9999999));
    else if (sort === "price-desc") r.sort((a, b) => (b.price_cny ?? 0) - (a.price_cny ?? 0));
    else if (sort === "popular") r.sort((a, b) => (b.views || 0) - (a.views || 0));
    else if (sort === "newest") r.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    // "best" is default (already sorted by score desc from fetch)
    return r;
  }, [products, search, activeCat, sort]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  useEffect(() => setCurrentPage(1), [search, activeCat, sort]);

  return (
    <div style={{ background: P.bg }} className="min-h-screen">
      {/* ══════ HERO ══════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: `radial-gradient(ellipse at 50% 30%, #1A0F15 0%, ${P.bg} 70%)` }}
      >
        {/* Sparkle dots */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: P.light,
                opacity: 0.15 + Math.random() * 0.2,
                animation: `sparkle ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-16 text-center sm:pb-14 sm:pt-24">
          <p
            className="mb-4 text-[11px] font-semibold uppercase"
            style={{ letterSpacing: "0.2em", color: P.primary }}
          >
            Curated for her
          </p>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span style={{ color: P.text }}>For </span>
            <span
              style={{
                background: `linear-gradient(135deg, ${P.primary}, ${P.light})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Her
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-[500px] text-base" style={{ color: P.textSec }}>
            Bags, shoes, jewelry, clothing — handpicked women&apos;s finds from the best sellers.
          </p>

          {/* Stats */}
          <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px]" style={{ color: P.textMuted }}>
            <span><strong style={{ color: P.text }}>{products.length.toLocaleString()}+</strong> Finds</span>
            <span style={{ color: P.border }}>|</span>
            <span><strong style={{ color: P.text }}>45+</strong> Categories</span>
            <span style={{ color: P.border }}>|</span>
            <span>New drops weekly</span>
          </div>

          {/* Search */}
          <div className="mx-auto mt-8 max-w-[600px]">
            <div className="relative">
              <svg className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: P.textMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search bags, shoes, jewelry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-full pl-12 pr-5 text-sm outline-none transition-all"
                style={{
                  background: P.card,
                  border: `1px solid ${P.border}`,
                  color: P.text,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = P.primary)}
                onBlur={(e) => (e.currentTarget.style.borderColor = P.border)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════ CAROUSELS ══════ */}
      {!loading && products.length > 0 && (
        <div className="mx-auto max-w-7xl space-y-8 px-4 pt-6 sm:px-6">
          {/* Trending Now — top 8 by score (already sorted) */}
          {(() => {
            const trending = products.filter((p) => p.image && p.price_cny != null).slice(0, 8);
            return trending.length > 0 ? (
              <ProductRow title={"\uD83D\uDD25 Trending Now"} products={trending} viewMoreHref="/girls" />
            ) : null;
          })()}
          {/* For You — pick 8 random from top 100 by score */}
          {(() => {
            const top100 = products.filter((p) => p.image && p.price_cny != null).slice(0, 100);
            const forYou = top100.sort(() => Math.random() - 0.5).slice(0, 8);
            return forYou.length > 0 ? (
              <ProductRow title="For You" products={forYou} />
            ) : null;
          })()}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        {/* ══════ CATEGORY GRID ══════ */}
        <div className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 py-6 sm:mx-0 sm:justify-center sm:gap-4 sm:px-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCat(cat.value)}
              className="flex flex-shrink-0 flex-col items-center gap-2 rounded-2xl p-3 transition-all duration-200 sm:p-4"
              style={{
                width: 96,
                minWidth: 96,
                background: activeCat === cat.value ? `${P.primary}15` : P.card,
                border: `1px solid ${activeCat === cat.value ? P.primary : P.border}`,
              }}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-[12px] font-medium" style={{ color: activeCat === cat.value ? P.primary : P.textSec }}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        {/* ══════ SORT BAR ══════ */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[13px]" style={{ color: P.textMuted }}>
            Showing {paginated.length} of {filtered.length} finds
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="min-w-[120px] rounded-lg px-3 py-2 text-[13px] outline-none"
            style={{ background: P.card, border: `1px solid ${P.border}`, color: P.textSec }}
          >
            <option value="best">Best</option>
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>

        {/* ══════ PRODUCT GRID ══════ */}
        {loading ? (
          <div className="py-24 text-center" style={{ color: P.textMuted }}>Loading finds...</div>
        ) : paginated.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-lg" style={{ color: P.textSec }}>No finds match your search.</p>
            <p className="mt-1 text-sm" style={{ color: P.textMuted }}>Try a different query or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {paginated.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group overflow-hidden transition-all duration-[250ms]"
                style={{
                  background: P.card,
                  border: `1px solid ${P.border}`,
                  borderRadius: 16,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = P.borderHover;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 30px ${P.glow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = P.border;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Image */}
                <div className="relative overflow-hidden" style={{ aspectRatio: "4/5", background: "#0E0B11" }}>
                  {product.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs font-medium" style={{ color: `${P.textMuted}40` }}>{product.brand}</span>
                    </div>
                  )}

                  {/* Wishlist */}
                  <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(String(product.id)); }}
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                    style={{ background: "rgba(0,0,0,0.4)" }}
                  >
                    <svg className="h-4 w-4" fill={isWishlisted(String(product.id)) ? P.primary : "none"} stroke={P.primary} strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>

                  {/* View/Like badges */}
                  <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
                    {product.views > 0 && (
                      <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] text-white" style={{ background: "rgba(0,0,0,0.6)" }}>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {product.views}
                      </span>
                    )}
                    {product.likes > 0 && (
                      <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] text-white" style={{ background: "rgba(0,0,0,0.6)" }}>
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                        {product.likes}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3.5 sm:p-4">
                  <h3 className="line-clamp-2 text-[14px] font-medium leading-tight" style={{ color: P.text }}>
                    {product.name}
                  </h3>
                  <p className="mt-1 text-[12px]" style={{ color: P.textMuted }}>{product.brand}</p>
                  <p className="mt-1.5 text-[15px] font-semibold" style={{ color: P.primary }}>
                    {product.price_cny != null ? formatPrice(product) : <span style={{ color: P.textMuted }}>Multi</span>}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ══════ PAGINATION ══════ */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={currentPage === 1}
                className="rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-30"
                style={{ background: P.card, border: `1px solid ${P.border}`, color: P.textSec }}
              >
                ←
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page: number;
                if (totalPages <= 7) page = i + 1;
                else if (currentPage <= 4) page = i + 1;
                else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                else page = currentPage - 3 + i;
                return (
                  <button
                    key={page}
                    onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="min-w-[36px] rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    style={{
                      background: currentPage === page ? P.primary : P.card,
                      color: currentPage === page ? "#fff" : P.textSec,
                    }}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={currentPage === totalPages}
                className="rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-30"
                style={{ background: P.card, border: `1px solid ${P.border}`, color: P.textSec }}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sparkle animation */}
      <style jsx>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.4; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default function GirlsPage() {
  return (
    <Suspense fallback={<div style={{ background: "#0C0A0E" }} className="min-h-screen" />}>
      <GirlsInner />
    </Suspense>
  );
}
