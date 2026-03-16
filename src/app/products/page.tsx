"use client";

import { useState, useMemo } from "react";
import products from "@/data/products.json";
import BuyModal from "@/components/BuyModal";

type Category = "All" | "Shoes" | "Streetwear" | "Bags & Acc" | "Jewelry";
type Tier = "all" | "budget" | "mid" | "premium";
type Sort = "price-asc" | "price-desc" | "name-asc";

const categories: Category[] = [
  "All",
  "Shoes",
  "Streetwear",
  "Bags & Acc",
  "Jewelry",
];

const tierLabels: Record<string, string> = {
  all: "All",
  budget: "\u{1F4B0} Budget (<\u00A550)",
  mid: "\u{1F4B0}\u{1F4B0} Mid (\u00A550-149)",
  premium: "\u{1F4B0}\u{1F4B0}\u{1F4B0} Premium (\u00A5150+)",
};

const tierColors: Record<string, string> = {
  budget: "bg-verified/10 text-verified",
  mid: "bg-accent/10 text-accent",
  premium: "bg-danger/10 text-danger",
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [tier, setTier] = useState<Tier>("all");
  const [sort, setSort] = useState<Sort>("price-asc");
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof products)[0] | null
  >(null);

  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    if (tier !== "all") {
      result = result.filter((p) => p.tier === tier);
    }

    result.sort((a, b) => {
      if (sort === "price-asc") return a.price_cny - b.price_cny;
      if (sort === "price-desc") return b.price_cny - a.price_cny;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [search, category, tier, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-card border border-subtle bg-surface py-3 pl-12 pr-4 text-sm text-white placeholder-text-muted outline-none transition-colors focus:border-accent/50"
        />
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-pill px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
              category === c
                ? "bg-accent text-white"
                : "border border-subtle bg-surface text-text-secondary hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="ml-auto rounded-btn border border-subtle bg-surface px-3 py-1.5 text-xs text-text-secondary outline-none"
        >
          <option value="price-asc">Price low→high</option>
          <option value="price-desc">Price high→low</option>
          <option value="name-asc">Name A-Z</option>
        </select>
      </div>

      {/* Tier filter */}
      <div className="mt-3 flex flex-wrap gap-2">
        {(Object.keys(tierLabels) as Tier[]).map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className={`rounded-pill px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
              tier === t
                ? "bg-accent text-white"
                : "border border-subtle bg-surface text-text-secondary hover:text-white"
            }`}
          >
            {tierLabels[t]}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="group rounded-card border border-[rgba(255,255,255,0.06)] bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-[0_0_20px_rgba(255,107,53,0.05)]"
          >
            {/* Image placeholder */}
            <div className="mb-4 flex h-40 items-center justify-center rounded-btn bg-void">
              <svg
                className="h-10 w-10 text-text-muted/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                />
              </svg>
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
              <span className="font-heading text-xl font-bold text-white">
                ¥{product.price_cny}
              </span>
              <span className="ml-2 text-xs text-text-secondary">
                ${product.price_usd} / €{product.price_eur}
              </span>
            </div>

            <button
              onClick={() => setSelectedProduct(product)}
              className="mt-4 w-full rounded-btn bg-accent py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,107,53,0.15)]"
            >
              Buy
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-text-secondary">
            No products found. Try adjusting your filters.
          </p>
        </div>
      )}

      <BuyModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
