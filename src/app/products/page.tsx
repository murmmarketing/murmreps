"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import staticProducts from "@/data/products.json";
import { supabase } from "@/lib/supabase";
import { useWishlist } from "@/lib/useWishlist";
import { useProductStats } from "@/lib/useProductStats";
import { usePreferences } from "@/lib/usePreferences";
import { Pagination } from "@/components/ui/pagination";

type Tier = "all" | "budget" | "mid" | "premium";
type Quality = "all" | "best" | "good" | "budget";
type Sort = "random" | "popular" | "price-asc" | "price-desc";
const categoryPills = [
  "All Categories",
  // Footwear
  "Sneakers", "Shoes", "Boots", "Slides & Sandals",
  // Tops
  "T-Shirts", "Shirts", "Polos", "Hoodies", "Sweaters", "Crewnecks", "Jerseys", "Long Sleeves", "Tank Tops",
  // Outerwear
  "Jackets", "Coats & Puffers", "Vests", "Tracksuits",
  // Bottoms
  "Pants", "Jeans", "Shorts", "Sweatpants",
  // Bags & Wallets
  "Bags", "Wallets",
  // Accessories
  "Belts", "Hats & Caps", "Scarves & Gloves", "Sunglasses", "Glasses", "Phone Cases", "Socks & Underwear", "Ties", "Masks", "Keychains",
  // Jewelry
  "Necklaces", "Bracelets", "Earrings", "Rings", "Watches", "Jewelry",
  // Style
  "Old Money",
  // Other
  "Perfumes", "Electronics", "Home & Decor", "Accessories",
] as const;

type Category = (typeof categoryPills)[number];

const tierLabels: Record<Tier, string> = {
  all: "All",
  budget: "\u{1F4B0} Budget",
  mid: "\u{1F4B0}\u{1F4B0} Mid",
  premium: "\u{1F4B0}\u{1F4B0}\u{1F4B0} Premium",
};

const qualityLabels: Record<Quality, string> = {
  all: "All",
  best: "Best",
  good: "Good",
  budget: "Budget",
};

const qualityBadgeStyles: Record<string, string> = {
  best: "bg-[#1DB954]/15 text-[#1DB954]",
  good: "bg-[#F59E0B]/15 text-[#F59E0B]",
  budget: "bg-[#6C757D]/20 text-white",
};

const sortOptions: { value: Sort; label: string; icon: string }[] = [
  { value: "random", label: "Random", icon: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" },
  { value: "popular", label: "Most Popular", icon: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  { value: "price-asc", label: "Price \u2191", icon: "M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" },
  { value: "price-desc", label: "Price \u2193", icon: "M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" },
];

// Compute the set of top-20 trending product IDs (by views desc, id asc as tiebreaker)
function computeTrendingIds(products: typeof staticProducts): Set<string> {
  const sorted = [...products].sort((a, b) => {
    const viewsA = (a as { views?: number }).views ?? 0;
    const viewsB = (b as { views?: number }).views ?? 0;
    if (viewsB !== viewsA) return viewsB - viewsA;
    return a.id - b.id;
  });
  return new Set(sorted.slice(0, 20).map((p) => String(p.id)));
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageInner />
    </Suspense>
  );
}

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(staticProducts);
  const [, setLoading] = useState(true);

  // Fetch products from Supabase on mount, fall back to static JSON
  useEffect(() => {
    async function fetchProducts() {
      try {
        let all: typeof staticProducts = [];
        let from = 0;
        const pageSize = 1000;
        while (true) {
          const { data, error } = await supabase
            .from("products")
            .select("*")
            .not("image", "is", null)
            .neq("image", "")
            .order("id")
            .range(from, from + pageSize - 1);
          if (error) throw error;
          if (!data || data.length === 0) break;
          all = all.concat(data as typeof staticProducts);
          if (data.length < pageSize) break;
          from += pageSize;
        }
        if (all.length > 0) {
          console.log(`Fetched ${all.length} products from Supabase`);
          setProducts(all);
        } else {
          console.log("Falling back to static JSON");
        }
      } catch (err) {
        console.log("Supabase fetch failed, using static JSON:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Initialize search from URL ?q= parameter and sync when it changes
  const urlQuery = searchParams.get("q") || "";
  const [search, setSearch] = useState(urlQuery);

  // Sync search state when URL ?q= param changes (e.g. navbar navigation)
  useEffect(() => {
    setSearch(urlQuery);
  }, [urlQuery]);

  // Initialize category from URL ?category= parameter
  const urlCategory = searchParams.get("category") || "All Categories";
  const [category, setCategory] = useState<Category>(
    categoryPills.includes(urlCategory as Category) ? (urlCategory as Category) : "All Categories"
  );

  // Sync category state when URL ?category= param changes
  useEffect(() => {
    const validCategory = categoryPills.includes(urlCategory as Category) ? (urlCategory as Category) : "All Categories";
    setCategory(validCategory);
  }, [urlCategory]);
  const [tier, setTier] = useState<Tier>("all");
  const [quality, setQuality] = useState<Quality>("all");
  const [sort, setSort] = useState<Sort>("random");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const PRODUCTS_PER_PAGE = 24;
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const [tmpTier, setTmpTier] = useState<Tier>(tier);
  const [tmpQuality, setTmpQuality] = useState<Quality>(quality);
  const [tmpSort, setTmpSort] = useState<Sort>(sort);
  const [tmpMinPrice, setTmpMinPrice] = useState(minPrice);
  const [tmpMaxPrice, setTmpMaxPrice] = useState(maxPrice);

  const wishlist = useWishlist();
  const productStats = useProductStats();
  const { formatPrice } = usePreferences();

  const openFilters = () => {
    setTmpTier(tier);
    setTmpQuality(quality);
    setTmpSort(sort);
    setTmpMinPrice(minPrice);
    setTmpMaxPrice(maxPrice);
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setTier(tmpTier);
    setQuality(tmpQuality);
    setSort(tmpSort);
    setMinPrice(tmpMinPrice);
    setMaxPrice(tmpMaxPrice);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setTmpTier("all");
    setTmpQuality("all");
    setTmpSort("random");
    setTmpMinPrice("");
    setTmpMaxPrice("");
  };

  // Sync search and category to URL without full page reload
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category && category !== "All Categories") params.set("category", category);
    const qs = params.toString();
    window.history.replaceState({}, "", `/products${qs ? "?" + qs : ""}`);
  }, [search, category]);

  useEffect(() => {
    if (filterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [filterOpen]);

  const activeFilterCount =
    (tier !== "all" ? 1 : 0) +
    (quality !== "all" ? 1 : 0) +
    (sort !== "random" ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0);

  // Pre-compute trending IDs for badge display
  const trendingIds = useMemo(() => computeTrendingIds(products), [products]);

  const filtered = useMemo(() => {
    setCurrentPage(1);
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    if (category !== "All Categories") {
      result = result.filter((p) => p.category === category);
    }

    if (tier !== "all") {
      result = result.filter((p) => p.tier === tier);
    }

    if (quality !== "all") {
      result = result.filter((p) => p.quality === quality);
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) result = result.filter((p) => (p.price_cny ?? 0) >= min);
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) result = result.filter((p) => p.price_cny != null && p.price_cny <= max);
    }

    // Apply sort
    if (sort === "price-asc") {
      result.sort((a, b) => (a.price_cny ?? 9999999) - (b.price_cny ?? 9999999));
    } else if (sort === "price-desc") {
      result.sort((a, b) => (b.price_cny ?? 0) - (a.price_cny ?? 0));
    } else if (sort === "popular") {
      result.sort((a, b) => {
        const viewsA = (a as { views?: number }).views ?? 0;
        const viewsB = (b as { views?: number }).views ?? 0;
        if (viewsB !== viewsA) return viewsB - viewsA;
        return a.id - b.id;
      });
    } else {
      // Default: sort by views descending (most popular first)
      result.sort((a, b) => {
        const viewsA = (a as { views?: number }).views ?? 0;
        const viewsB = (b as { views?: number }).views ?? 0;
        if (viewsB !== viewsA) return viewsB - viewsA;
        return a.id - b.id;
      });
    }

    return result;
  }, [search, category, tier, quality, sort, minPrice, maxPrice, products]);

  const tmpFilteredCount = useMemo(() => {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }
    if (category !== "All Categories") result = result.filter((p) => p.category === category);
    if (tmpTier !== "all") result = result.filter((p) => p.tier === tmpTier);
    if (tmpQuality !== "all") result = result.filter((p) => p.quality === tmpQuality);
    if (tmpMinPrice) {
      const min = parseFloat(tmpMinPrice);
      if (!isNaN(min)) result = result.filter((p) => (p.price_cny ?? 0) >= min);
    }
    if (tmpMaxPrice) {
      const max = parseFloat(tmpMaxPrice);
      if (!isNaN(max)) result = result.filter((p) => p.price_cny != null && p.price_cny <= max);
    }
    return result.length;
  }, [search, category, tmpTier, tmpQuality, tmpMinPrice, tmpMaxPrice, products]);

  const paginated = filtered.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  const pillActive = "bg-accent text-white";
  const pillInactive = "bg-[#1a1a1a] text-text-secondary border border-[rgba(255,255,255,0.1)] hover:border-accent/40";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Mobile search + Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="h-10 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] pl-9 pr-3 text-sm text-white placeholder-text-muted outline-none transition-colors focus:border-accent/50"
          />
        </div>
        <button
          onClick={openFilters}
          className="relative flex h-10 shrink-0 items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 text-sm font-medium text-white transition-all hover:border-accent/30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Category pills */}
      <div className="relative mt-3">
        <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
          {categoryPills.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 ${
                category === c
                  ? "bg-accent text-white"
                  : "bg-[#141414] text-text-secondary hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {/* Gradient fade on right edge for mobile */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0a] to-transparent lg:hidden" />
      </div>

      {/* Search context pill */}
      {category !== "All Categories" && search && (
        <div className="mt-4 flex items-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[#141414] px-3 py-1 text-[13px] text-text-secondary">
            Searching in: {category}
            <button
              onClick={() => setCategory("All Categories")}
              className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent/20"
              aria-label="Clear category filter"
            >
              &times;
            </button>
          </span>
        </div>
      )}

      {/* Result count */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-text-muted">
          {filtered.length} products
        </p>
        <p className="text-sm text-text-muted">
          Showing {paginated.length} of {filtered.length}
        </p>
      </div>

      {/* Filter Modal */}
      {filterOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setFilterOpen(false)}
        >
          <div
            className="flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-[#141414] sm:max-w-[480px] sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "filter-slide-up 0.2s ease-out" }}
          >
            <style>{`
              @keyframes filter-slide-up {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-6 py-4">
              <h2 className="font-heading text-lg font-bold text-white">Filters</h2>
              <button onClick={() => setFilterOpen(false)} className="text-text-muted transition-colors hover:text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[1px] text-accent">Price Range</label>
                <div className="mt-3 flex gap-3">
                  <input type="number" placeholder="Min (CNY)" value={tmpMinPrice} onChange={(e) => setTmpMinPrice(e.target.value)} className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0a0a0a] px-3 py-2.5 text-sm text-white placeholder-text-muted outline-none focus:border-accent/50" />
                  <input type="number" placeholder="Max (CNY)" value={tmpMaxPrice} onChange={(e) => setTmpMaxPrice(e.target.value)} className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0a0a0a] px-3 py-2.5 text-sm text-white placeholder-text-muted outline-none focus:border-accent/50" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[1px] text-accent">Quality</label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(Object.keys(qualityLabels) as Quality[]).map((q) => (
                    <button key={q} onClick={() => setTmpQuality(q)} className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${tmpQuality === q ? pillActive : pillInactive}`}>{qualityLabels[q]}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[1px] text-accent">Tier</label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(Object.keys(tierLabels) as Tier[]).map((t) => (
                    <button key={t} onClick={() => setTmpTier(t)} className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${tmpTier === t ? pillActive : pillInactive}`}>{tierLabels[t]}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[1px] text-accent">Sort By</label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {sortOptions.map((opt) => (
                    <button key={opt.value} onClick={() => setTmpSort(opt.value)} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${tmpSort === opt.value ? pillActive : pillInactive}`}>
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={opt.icon} /></svg>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-[rgba(255,255,255,0.06)] px-6 py-4">
              <button onClick={clearFilters} className="rounded-lg border border-accent px-5 py-2.5 text-sm font-semibold text-accent transition-all hover:bg-accent/10">Clear</button>
              <button onClick={applyFilters} className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(254,66,5,0.15)]">Show {tmpFilteredCount} Results</button>
            </div>
          </div>
        </div>
      )}

      {/* Product grid */}
      <div className="mt-4 grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginated.map((product) => {
          const pid = String(product.id);
          const saved = wishlist.has(pid);
          const displayBrand = product.brand === "Various" ? "Unbranded" : product.brand;
          const s = productStats.get(pid, product as { views?: number; likes?: number; dislikes?: number });
          const isTrending = trendingIds.has(pid);
          return (
            <div
              key={product.id}
              className="group overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(254,66,5,0.2)]"
            >
              {/* Image area */}
              <Link href={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-[#0a0a0a]">
                {product.image ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#1a1a1a]">
                    <span className="font-heading text-lg font-bold text-text-muted/30">{displayBrand}</span>
                  </div>
                )}

                {/* Wishlist heart -- top right */}
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); wishlist.toggle(pid); }}
                  className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-all hover:scale-110"
                  aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <svg className={`h-4 w-4 ${saved ? "fill-accent text-accent" : "fill-none text-white/70 hover:text-accent"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>

                {/* Like/Dislike -- top left */}
                <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); productStats.vote(pid, "like"); }}
                    className={`flex h-7 items-center gap-1 rounded-full bg-black/50 px-2 text-[11px] backdrop-blur-sm transition-colors ${s.userVote === "like" ? "text-accent" : "text-white/70 hover:text-accent"}`}
                  >
                    <span>{"\uD83D\uDC4D"}</span><span>{s.likes}</span>
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); productStats.vote(pid, "dislike"); }}
                    className={`flex h-7 items-center gap-1 rounded-full bg-black/50 px-2 text-[11px] backdrop-blur-sm transition-colors ${s.userVote === "dislike" ? "text-danger" : "text-white/70 hover:text-danger"}`}
                  >
                    <span>{"\uD83D\uDC4E"}</span><span>{s.dislikes}</span>
                  </button>
                </div>

                {/* Views -- bottom right */}
                <div className="absolute bottom-2.5 right-2.5 z-10 flex h-7 items-center gap-1 rounded-full bg-black/50 px-2.5 text-[11px] text-white/70 backdrop-blur-sm">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{s.views}</span>
                </div>

                {/* Trending badge -- top left of image */}
                {isTrending && (
                  <span className="absolute left-2.5 bottom-2.5 z-10 rounded-full bg-[#FE4205] px-2 py-0.5 text-[10px] font-semibold text-white">
                    {"\uD83D\uDD25"}
                  </span>
                )}
              </Link>

              {/* Card body */}
              <div className="p-4">
                <Link href={`/products/${product.id}`} className="block">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-accent">
                    {product.name}
                  </h3>
                </Link>
                <p className="mt-1 text-xs text-text-muted">{product.category}</p>

                {product.quality && qualityBadgeStyles[product.quality] && (
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${qualityBadgeStyles[product.quality]}`}>
                    {product.quality}
                  </span>
                )}

                {/* Price + Check */}
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Price</p>
                    {product.price_cny != null ? (
                      <p className="font-heading text-base font-bold text-white">{formatPrice(product)}</p>
                    ) : (
                      <p className="font-heading text-base font-bold text-text-muted">Multi</p>
                    )}
                  </div>
                  <Link
                    href={`/products/${product.id}`}
                    className="rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs font-medium text-accent transition-all hover:border-accent/40 hover:bg-accent/5"
                  >
                    Check &rarr;
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-10">
        <Pagination
          totalItems={filtered.length}
          itemsPerPage={PRODUCTS_PER_PAGE}
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-text-secondary">No products found. Try adjusting your filters.</p>
        </div>
      )}

    </div>
  );
}
