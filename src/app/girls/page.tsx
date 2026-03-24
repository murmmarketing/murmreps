"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useWishlist } from "@/lib/useWishlist";
import { usePreferences } from "@/lib/usePreferences";
import { girlsItemIds } from "@/data/girls-ids";

type Sort = "popular" | "price-asc" | "price-desc";

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
}

const PINK = "#E8518D";
const PRODUCTS_PER_PAGE = 24;

function GirlsPageInner() {
  const searchParams = useSearchParams();
  const { formatPrice } = usePreferences();
  const { has: isWishlisted, toggle: toggleWishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("All Categories");
  const [sort, setSort] = useState<Sort>("popular");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch girls products
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("views", { ascending: false });

      if (data) {
        // Filter to girls products by matching item IDs from source_link
        const girlsProducts = data.filter((p: Product) => {
          if (!p.source_link) return false;
          const m = p.source_link.match(/itemID=(\d+)/i) || p.source_link.match(/[?&]id=(\d+)/);
          return m && girlsItemIds.has(m[1]);
        });
        setProducts(girlsProducts);
      }
      setLoading(false);
    })();
  }, []);

  // Get categories that exist in girls products
  const availableCategories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ["All Categories", ...Array.from(cats).sort()];
  }, [products]);

  // Filter and sort
  const filtered = useMemo(() => {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }
    if (category !== "All Categories") {
      result = result.filter((p) => p.category === category);
    }
    if (sort === "price-asc") result.sort((a, b) => (a.price_cny ?? 9999999) - (b.price_cny ?? 9999999));
    else if (sort === "price-desc") result.sort((a, b) => (b.price_cny ?? 0) - (a.price_cny ?? 0));
    else result.sort((a, b) => (b.views || 0) - (a.views || 0));
    return result;
  }, [products, search, category, sort]);

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  useEffect(() => setCurrentPage(1), [search, category, sort]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, rgba(232,81,141,0.1) 0%, transparent 60%), #0a0a0a`,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 sm:pb-12 sm:pt-20">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
              For <span style={{ color: PINK }}>Her</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-[#9CA3AF]">
              Curated finds for women — bags, accessories, shoes, clothing and more.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        {/* Search */}
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6C757D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search brands, items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#141414] pl-10 pr-4 text-sm text-white placeholder-[#6C757D] outline-none transition-colors focus:border-[rgba(232,81,141,0.3)]"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-12 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 text-sm text-white outline-none"
          >
            <option value="popular">Most Popular</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>

        {/* Category pills */}
        <div className="hide-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="flex-shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-colors"
              style={{
                background: category === cat ? PINK : "#141414",
                color: category === cat ? "#fff" : "#9CA3AF",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Result count */}
        <p className="mb-4 text-right text-sm text-[#6C757D]">
          Showing {paginated.length} of {filtered.length} products
        </p>

        {/* Product grid */}
        {loading ? (
          <div className="py-20 text-center text-[#6C757D]">Loading...</div>
        ) : paginated.length === 0 ? (
          <div className="py-20 text-center text-[#6C757D]">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginated.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(232,81,141,0.2)]"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0a0a]">
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
                      <span className="text-xs font-medium text-white/20">{product.brand}</span>
                    </div>
                  )}

                  {/* Wishlist button */}
                  <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(String(product.id)); }}
                    className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(0,0,0,0.5)]"
                  >
                    <svg className="h-4 w-4" fill={isWishlisted(String(product.id)) ? PINK : "none"} stroke={PINK} strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>

                  {/* View count */}
                  {product.views > 0 && (
                    <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-[rgba(0,0,0,0.6)] px-2 py-0.5 text-[10px] text-white">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {product.views}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="line-clamp-1 text-[14px] font-semibold text-white">{product.name}</h3>
                  <p className="mt-1 text-sm text-[#9CA3AF]">{product.category}</p>
                  <p className="mt-1 text-[16px] font-bold text-white">
                    {product.price_cny != null ? formatPrice(product) : <span className="text-gray-500">Multi</span>}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={currentPage === 1}
                className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#1a1a1a] px-3 py-2 text-sm text-[#9CA3AF] transition-colors hover:bg-[#1f1f1f] disabled:opacity-40"
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
                      background: currentPage === page ? PINK : "#1a1a1a",
                      color: currentPage === page ? "#fff" : "#9CA3AF",
                    }}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#1a1a1a] px-3 py-2 text-sm text-[#9CA3AF] transition-colors hover:bg-[#1f1f1f] disabled:opacity-40"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GirlsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <GirlsPageInner />
    </Suspense>
  );
}
