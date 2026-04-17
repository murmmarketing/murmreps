"use client";

import { useState } from "react";
import Link from "next/link";

interface Seller {
  name: string;
  category: string;
  platform: string;
  specialty: string;
  priceRange: string;
  rating: number;
  shopLink: string;
}

const sellers: Seller[] = [
  { name: "Top Dreamer (TD)", category: "Shoes", platform: "Weidian", specialty: "Best batch Jordan, Dunk, Yeezy", priceRange: "¥150-500", rating: 5, shopLink: "https://weidian.com/?userid=1866271861" },
  { name: "A1 Top", category: "Shoes", platform: "Weidian", specialty: "Budget to mid-tier sneakers, huge selection", priceRange: "¥100-400", rating: 4, shopLink: "https://weidian.com/?userid=1624885820" },
  { name: "Passerby", category: "Shoes", platform: "Weidian", specialty: "Budget sneakers, great value", priceRange: "¥60-200", rating: 4, shopLink: "https://weidian.com/?userid=1814230492" },
  { name: "Cappuccino", category: "Shoes", platform: "Weidian", specialty: "Mid-tier dunks, jordans", priceRange: "¥100-300", rating: 4, shopLink: "https://weidian.com/?userid=1621765644" },
  { name: "Husky Reps", category: "Clothing", platform: "Taobao/Yupoo", specialty: "TNF, Nike Tech Fleece, Essentials, basics", priceRange: "¥80-300", rating: 5, shopLink: "" },
  { name: "Hansolo", category: "Clothing", platform: "Taobao/Yupoo", specialty: "Budget streetwear, Stussy, Nike, Carhartt", priceRange: "¥50-200", rating: 4, shopLink: "" },
  { name: "Singor", category: "Clothing", platform: "Taobao/Yupoo", specialty: "Hoodies, sweaters, basics", priceRange: "¥80-250", rating: 4, shopLink: "" },
  { name: "Cloyad", category: "Clothing", platform: "Yupoo", specialty: "Designer clothing — Balenciaga, Gucci, Dior", priceRange: "¥200-600", rating: 5, shopLink: "" },
  { name: "LY Factory", category: "Clothing", platform: "Yupoo", specialty: "High-end designer — Balenciaga, LV, Dior", priceRange: "¥300-800", rating: 5, shopLink: "" },
  { name: "Survival Source", category: "Jewelry", platform: "Taobao/Yupoo", specialty: "Chrome Hearts, Vivienne Westwood, rings, chains", priceRange: "¥50-300", rating: 5, shopLink: "" },
  { name: "David925", category: "Jewelry", platform: "Taobao", specialty: "Chrome Hearts silver jewelry", priceRange: "¥100-500", rating: 5, shopLink: "" },
  { name: "Aadi", category: "Bags", platform: "Yupoo/WeChat", specialty: "LV, Gucci, Chanel bags", priceRange: "¥300-1500", rating: 5, shopLink: "" },
  { name: "Nina", category: "Bags", platform: "Yupoo/WeChat", specialty: "Budget-mid designer bags, wallets, belts", priceRange: "¥200-800", rating: 4, shopLink: "" },
];

const categories = ["All", "Shoes", "Clothing", "Jewelry", "Bags"];

const platformColors: Record<string, string> = {
  Weidian: "bg-blue-500/15 text-blue-400",
  "Taobao/Yupoo": "bg-yellow-500/15 text-yellow-400",
  Yupoo: "bg-purple-500/15 text-purple-400",
  Taobao: "bg-orange-500/15 text-orange-400",
  "Yupoo/WeChat": "bg-green-500/15 text-green-400",
};

const brandSearchMap: Record<string, string> = {
  "Top Dreamer (TD)": "jordan",
  "A1 Top": "dunk",
  Passerby: "dunk",
  Cappuccino: "jordan",
  "Husky Reps": "nike tech fleece",
  Hansolo: "stussy",
  Singor: "hoodie",
  Cloyad: "balenciaga",
  "LY Factory": "dior",
  "Survival Source": "chrome hearts",
  David925: "chrome hearts",
  Aadi: "louis vuitton",
  Nina: "gucci",
};

export default function SellersPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? sellers
      : sellers.filter((s) => s.category === activeCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Trusted Sellers
      </h1>
      <p className="mt-2 text-lg text-text-secondary">
        Best Weidian &amp; Taobao stores — verified sellers with consistent
        quality across 15,000+ finds
      </p>

      {/* Category filters */}
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-pill px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-accent text-white"
                : "border border-subtle bg-surface text-text-secondary hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Seller cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((seller) => (
          <div
            key={seller.name}
            className="rounded-card border border-subtle bg-surface p-5 transition-all duration-200 hover:border-accent/20 hover:shadow-[0_0_20px_rgba(254,66,5,0.08)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-base font-semibold text-white">
                  {seller.name}
                </h3>
                <span
                  className={`mt-1 inline-block rounded-pill px-2 py-0.5 text-[10px] font-medium ${
                    platformColors[seller.platform] ||
                    "bg-white/10 text-white"
                  }`}
                >
                  {seller.platform}
                </span>
              </div>
              <div className="flex gap-0.5 text-xs">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < seller.rating ? "text-yellow-400" : "text-white/10"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-3 text-sm text-text-secondary">
              {seller.specialty}
            </p>
            <p className="mt-1 text-xs text-text-muted">{seller.priceRange}</p>

            <div className="mt-4 flex gap-2">
              {seller.shopLink && (
                <a
                  href={seller.shopLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-btn border border-subtle bg-void px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-accent hover:text-accent"
                >
                  View Store →
                </a>
              )}
              <Link
                href={`/products?q=${encodeURIComponent(brandSearchMap[seller.name] || seller.name)}`}
                className="rounded-btn border border-subtle bg-void px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-accent hover:text-accent"
              >
                Find products →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* SEO content */}
      <section className="mt-16 space-y-6">
        <h2 className="font-heading text-2xl font-bold text-white">
          How we verify sellers
        </h2>
        <p className="text-sm leading-relaxed text-text-secondary">
          Every seller on this list has been vetted through real orders, QC photo
          reviews, and community feedback. We track consistency over hundreds of
          orders — not just one lucky haul. Sellers are re-evaluated regularly
          and removed if quality drops.
        </p>
        <h2 className="font-heading text-2xl font-bold text-white">
          Budget vs mid-tier vs best batch
        </h2>
        <p className="text-sm leading-relaxed text-text-secondary">
          Budget sellers (¥60-200) are great for beaters and testing. Mid-tier
          (¥200-400) gives you solid daily-wear quality. Best batch (¥400+) is
          for accuracy-focused buyers who want 1:1 details. Check our{" "}
          <Link href="/best-batch" className="text-accent hover:underline">
            batch comparison pages
          </Link>{" "}
          for specific shoes.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/products" className="text-accent hover:underline">Browse all finds →</Link>
        <Link href="/how-to-buy-reps" className="text-accent hover:underline">How to buy reps →</Link>
        <Link href="/kakobuy-spreadsheet" className="text-accent hover:underline">KakoBuy spreadsheet →</Link>
        <Link href="/best-weidian-sellers" className="text-accent hover:underline">Best Weidian sellers →</Link>
      </div>
    </div>
  );
}
