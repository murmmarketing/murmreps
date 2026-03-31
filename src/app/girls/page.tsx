"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useWishlist } from "@/lib/useWishlist";
import { usePreferences } from "@/lib/usePreferences";
import ProductRow from "@/components/ProductRow";

type Sort = "best" | "newest" | "popular" | "price-asc" | "price-desc";

const CARD_COLUMNS = "id,name,brand,price_cny,price_usd,price_eur,image,views,likes,category,tier";

interface RowProduct {
  id: number;
  name: string;
  brand: string;
  price_cny: number | null;
  price_usd: number | null;
  price_eur: number | null;
  image: string;
  views: number;
  likes: number;
  category: string;
  tier?: string;
}

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
  { emoji: "\u2728", label: "All", value: "All" },
  { emoji: "\uD83D\uDC5C", label: "Bags", value: "Bags" },
  { emoji: "\uD83D\uDC5F", label: "Shoes", value: "shoes" },
  { emoji: "\uD83D\uDC8D", label: "Jewelry", value: "jewelry" },
  { emoji: "\uD83D\uDC57", label: "Tops", value: "tops" },
  { emoji: "\uD83D\uDC56", label: "Bottoms", value: "bottoms" },
  { emoji: "\uD83E\uDDE5", label: "Outerwear", value: "outerwear" },
  { emoji: "\uD83D\uDC5B", label: "Wallets", value: "Wallets" },
  { emoji: "\uD83D\uDC8E", label: "Accessories", value: "accessories" },
  { emoji: "\u231A", label: "Watches", value: "Watches" },
  { emoji: "\uD83D\uDD76\uFE0F", label: "Sunglasses", value: "Sunglasses" },
  { emoji: "\uD83E\uDDF4", label: "Perfumes", value: "Perfumes" },
  { emoji: "\uD83D\uDCF1", label: "Phone Cases", value: "Phone Cases" },
  { emoji: "\uD83E\uDD35", label: "Old Money", value: "Old Money" },
  { emoji: "\uD83E\uDD84", label: "Unique", value: "Unique" },
  { emoji: "\uD83C\uDFE0", label: "Home", value: "Home & Decor" },
];

const CAT_MAP: Record<string, string[]> = {
  shoes: ["Shoes", "Boots", "Slides & Sandals"],
  jewelry: ["Necklaces", "Bracelets", "Earrings", "Rings", "Jewelry"],
  tops: ["Shirts", "Polos", "Hoodies", "Sweaters", "Jerseys", "Long Sleeves", "Tank Tops", "Tops"],
  bottoms: ["Pants", "Shorts"],
  outerwear: ["Jackets"],
  accessories: ["Keychains", "Hats & Caps", "Scarves & Gloves", "Glasses", "Socks & Underwear", "Belts", "Ties", "Masks", "Accessories"],
};

const PER_PAGE = 24;

interface BrandRow {
  brand: string;
  products: RowProduct[];
}

function GirlsInner() {
  const searchParams = useSearchParams();
  const { formatPrice } = usePreferences();
  const { has: isWishlisted, toggle: toggleWishlist } = useWishlist();

  // Grid state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [activeCat, setActiveCat] = useState("All");
  const [sort, setSort] = useState<Sort>("best");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Carousel state
  const [trendingProducts, setTrendingProducts] = useState<RowProduct[]>([]);
  const [forYouProducts, setForYouProducts] = useState<RowProduct[]>([]);
  const [recentProducts, setRecentProducts] = useState<RowProduct[]>([]);
  const [brandRows, setBrandRows] = useState<BrandRow[]>([]);

  // Lazy-load brand rows
  const brandsRef = useRef<HTMLDivElement>(null);
  const [brandsVisible, setBrandsVisible] = useState(false);

  // Category slider
  const catScrollRef = useRef<HTMLDivElement>(null);
  const catButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  const handleCatScroll = useCallback(() => {
    const el = catScrollRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 10);
    setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = catScrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleCatScroll, { passive: true });
    handleCatScroll();
    return () => el.removeEventListener("scroll", handleCatScroll);
  }, [handleCatScroll]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch carousel data once (Trending, For You, Recently Added)
  useEffect(() => {
    (async () => {
      const [trendingRes, forYouRes, recentRes] = await Promise.all([
        // Trending Now — top 8 by score
        supabase
          .from("products")
          .select(CARD_COLUMNS)
          .in("collection", ["girls", "both"])
          .not("image", "is", null)
          .neq("image", "")
          .not("price_cny", "is", null)
          .order("score", { ascending: false })
          .limit(8),
        // For You — random 8 from positions 9-200 by score
        supabase
          .from("products")
          .select(CARD_COLUMNS)
          .in("collection", ["girls", "both"])
          .not("image", "is", null)
          .neq("image", "")
          .not("price_cny", "is", null)
          .order("score", { ascending: false })
          .range(8, 207),
        // Recently Added — 8 newest with images
        supabase
          .from("products")
          .select(CARD_COLUMNS)
          .in("collection", ["girls", "both"])
          .not("image", "is", null)
          .neq("image", "")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      setTrendingProducts((trendingRes.data as RowProduct[]) || []);

      const forYouPool = (forYouRes.data as RowProduct[]) || [];
      const shuffled = forYouPool.sort(() => Math.random() - 0.5).slice(0, 8);
      setForYouProducts(shuffled);

      setRecentProducts((recentRes.data as RowProduct[]) || []);
    })();
  }, []);

  // Lazy-load brand rows when they scroll into view
  useEffect(() => {
    if (!brandsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBrandsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(brandsRef.current);
    return () => observer.disconnect();
  }, [trendingProducts]);

  // Fetch top brands when visible
  useEffect(() => {
    if (!brandsVisible) return;

    (async () => {
      // Find top brands by product count in girls collection
      const { data: allBrands } = await supabase
        .from("products")
        .select("brand")
        .in("collection", ["girls", "both"])
        .not("image", "is", null)
        .neq("image", "");

      if (!allBrands) return;

      // Count per brand
      const counts: Record<string, number> = {};
      for (const p of allBrands) {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
      }

      // Top 6 brands with at least 5 products
      const topBrands = Object.entries(counts)
        .filter(([, count]) => count >= 5)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([brand]) => brand);

      // Fetch 8 products per brand
      const results = await Promise.all(
        topBrands.map((brand) =>
          supabase
            .from("products")
            .select(CARD_COLUMNS)
            .in("collection", ["girls", "both"])
            .eq("brand", brand)
            .not("image", "is", null)
            .neq("image", "")
            .order("score", { ascending: false })
            .limit(8)
        )
      );

      const rows: BrandRow[] = [];
      results.forEach((res, i) => {
        if (res.data && res.data.length >= 4) {
          rows.push({ brand: topBrands[i], products: res.data as RowProduct[] });
        }
      });
      setBrandRows(rows);
    })();
  }, [brandsVisible]);

  // Fetch paginated grid data with server-side filters
  useEffect(() => {
    (async () => {
      setLoading(true);

      let query = supabase
        .from("products")
        .select("id,name,brand,category,price_cny,price_usd,price_eur,tier,quality,source_link,image,views,likes,dislikes,featured,featured_rank,created_at", { count: "exact" })
        .in("collection", ["girls", "both"])
        .not("image", "is", null)
        .neq("image", "");

      if (debouncedSearch) {
        query = query.or(`name.ilike.%${debouncedSearch}%,brand.ilike.%${debouncedSearch}%`);
      }

      if (activeCat !== "All") {
        const cats = CAT_MAP[activeCat];
        if (cats) {
          query = query.in("category", cats);
        } else {
          query = query.eq("category", activeCat);
        }
      }

      if (sort === "price-asc") query = query.order("price_cny", { ascending: true, nullsFirst: false });
      else if (sort === "price-desc") query = query.order("price_cny", { ascending: false, nullsFirst: false });
      else if (sort === "popular") query = query.order("views", { ascending: false });
      else if (sort === "newest") query = query.order("created_at", { ascending: false });
      else query = query.order("score", { ascending: false });

      const from = (currentPage - 1) * PER_PAGE;
      query = query.range(from, from + PER_PAGE - 1);

      const { data, count } = await query;
      setProducts((data as Product[]) || []);
      setTotalCount(count ?? 0);
      setLoading(false);
    })();
  }, [debouncedSearch, activeCat, sort, currentPage]);

  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const paginated = products;

  useEffect(() => setCurrentPage(1), [debouncedSearch, activeCat, sort]);

  return (
    <div data-theme="pink" style={{ background: P.bg }} className="min-h-screen">
      {/* ══════ HERO ══════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: `radial-gradient(ellipse at 50% 30%, #1A0F15 0%, ${P.bg} 70%)` }}
      >
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

          <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px]" style={{ color: P.textMuted }}>
            <span><strong style={{ color: P.text }}>{totalCount.toLocaleString()}+</strong> Finds</span>
            <span style={{ color: P.border }}>|</span>
            <span><strong style={{ color: P.text }}>45+</strong> Categories</span>
            <span style={{ color: P.border }}>|</span>
            <span>New drops weekly</span>
          </div>

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

      {/* ══════ CAROUSELS (matches homepage pattern) ══════ */}
      <div className="mx-auto max-w-7xl space-y-10 px-4 pt-8 sm:px-6">
        {/* Trending Now */}
        {trendingProducts.length > 0 && (
          <ProductRow title={"\uD83D\uDD25 Trending Now"} products={trendingProducts} viewMoreHref="/girls" />
        )}

        {/* For You */}
        {forYouProducts.length > 0 && (
          <ProductRow title="For You" products={forYouProducts} viewMoreHref="/girls" />
        )}

        {/* Recently Added */}
        {recentProducts.length > 0 && (
          <ProductRow title="Recently Added" products={recentProducts} viewMoreHref="/girls" />
        )}
      </div>

      {/* ══════ BRAND SECTIONS (lazy loaded, matches homepage) ══════ */}
      <div ref={brandsRef} className="mx-auto max-w-7xl space-y-10 px-4 pt-10 sm:px-6">
        {brandRows.map(({ brand, products: brandProducts }) => (
          <ProductRow
            key={brand}
            title={brand}
            products={brandProducts}
            viewMoreHref={`/girls?q=${encodeURIComponent(brand)}`}
          />
        ))}
      </div>

      {/* ══════ BROWSE BY CATEGORY + PRODUCT GRID ══════ */}
      <div id="product-grid" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        {/* Category icon grid */}
        <div className="relative py-8">
          {showLeftFade && (
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-[#0C0A0E] to-transparent" />
          )}
          {showRightFade && (
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-[#0C0A0E] to-transparent" />
          )}
          <h2 className="mb-5 font-heading text-[22px] font-bold" style={{ color: P.text }}>Browse by Category</h2>
          <div
            ref={catScrollRef}
            className="scrollbar-hide flex gap-3 overflow-x-auto px-1 py-2 sm:gap-4"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                ref={(el) => { catButtonRefs.current[cat.value] = el; }}
                onClick={() => {
                  setActiveCat(cat.value);
                  setTimeout(() => {
                    catButtonRefs.current[cat.value]?.scrollIntoView({
                      behavior: "smooth",
                      inline: "center",
                      block: "nearest",
                    });
                  }, 50);
                }}
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
        </div>

        {/* Sort bar */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[13px]" style={{ color: P.textMuted }}>
            Showing {paginated.length} of {totalCount} finds
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
            <option value="price-asc">Price &uarr;</option>
            <option value="price-desc">Price &darr;</option>
          </select>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl" style={{ background: P.card, border: `1px solid ${P.border}` }}>
                <div className="aspect-square" style={{ background: "rgba(255,255,255,0.03)" }} />
                <div className="p-4">
                  <div className="h-4 w-3/4 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
                  <div className="mt-2 h-3 w-1/2 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
                  <div className="mt-3 h-5 w-1/3 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
                </div>
              </div>
            ))}
          </div>
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
                <div className="relative overflow-hidden" style={{ aspectRatio: "4/5", background: "#0E0B11" }}>
                  {product.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      width={300}
                      height={375}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs font-medium" style={{ color: `${P.textMuted}40` }}>{product.brand}</span>
                    </div>
                  )}

                  <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(String(product.id)); }}
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                    style={{ background: "rgba(0,0,0,0.4)" }}
                  >
                    <svg className="h-4 w-4" fill={isWishlisted(String(product.id)) ? P.primary : "none"} stroke={P.primary} strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>

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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); { const el = document.getElementById("product-grid"); if (el) { const top = el.getBoundingClientRect().top + window.scrollY - 20; window.scrollTo({ top, behavior: "smooth" }); } } }}
                disabled={currentPage === 1}
                className="rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-30"
                style={{ background: P.card, border: `1px solid ${P.border}`, color: P.textSec }}
              >
                &larr;
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
                    onClick={() => { setCurrentPage(page); { const el = document.getElementById("product-grid"); if (el) { const top = el.getBoundingClientRect().top + window.scrollY - 20; window.scrollTo({ top, behavior: "smooth" }); } } }}
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
                onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); { const el = document.getElementById("product-grid"); if (el) { const top = el.getBoundingClientRect().top + window.scrollY - 20; window.scrollTo({ top, behavior: "smooth" }); } } }}
                disabled={currentPage === totalPages}
                className="rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-30"
                style={{ background: P.card, border: `1px solid ${P.border}`, color: P.textSec }}
              >
                &rarr;
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
