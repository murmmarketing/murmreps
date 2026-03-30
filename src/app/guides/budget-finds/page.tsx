import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Best Budget Finds Under ¥200 — Cheap Reps That Look Expensive | MurmReps",
  description:
    "The best rep finds under ¥200 (under $30). Shoes, hoodies, bags, accessories — all handpicked and quality-checked.",
};

interface Product {
  id: number;
  name: string;
  brand: string;
  price_cny: number;
  price_eur: number | null;
  image: string;
  views: number;
  category: string;
}

const categoryGroups: {
  label: string;
  emoji: string;
  cats: string[];
  verdict: string;
}[] = [
  {
    label: "Shoes",
    emoji: "👟",
    cats: ["Shoes", "Boots", "Slides & Sandals"],
    verdict:
      "Budget shoes under ¥200 are hit or miss on materials but designs are spot-on. Nike and Adidas basics are safe bets.",
  },
  {
    label: "Tops",
    emoji: "👕",
    cats: ["Shirts", "Polos", "Hoodies", "Sweaters", "Jerseys", "Long Sleeves", "Tank Tops", "Tops"],
    verdict:
      "T-shirts are the safest budget buy. Print quality is great even at ¥79. Size up 1-2 sizes.",
  },
  {
    label: "Bottoms",
    emoji: "👖",
    cats: ["Pants", "Shorts"],
    verdict:
      "Budget shorts are excellent value. Jeans under ¥200 can be thinner — check QC for denim weight.",
  },
  {
    label: "Outerwear",
    emoji: "🧥",
    cats: ["Jackets"],
    verdict:
      "Hard to find quality outerwear under ¥200, but windbreakers and light jackets work. Avoid budget puffers.",
  },
  {
    label: "Accessories",
    emoji: "⌚",
    cats: [
      "Belts", "Hats & Caps", "Scarves & Gloves", "Sunglasses", "Glasses",
      "Necklaces", "Bracelets", "Earrings", "Rings", "Watches",
      "Phone Cases", "Socks & Underwear", "Keychains",
    ],
    verdict:
      "Best budget category. Belts, caps, and sunglasses under ¥100 are nearly identical to retail.",
  },
  {
    label: "Bags",
    emoji: "👜",
    cats: ["Bags", "Wallets"],
    verdict:
      "Budget bags work for daily beaters. Don't expect 1:1 leather but designs and hardware are solid.",
  },
];

async function fetchBudgetProducts() {
  const results: Record<string, Product[]> = {};

  await Promise.all(
    categoryGroups.map(async (group) => {
      const { data } = await supabase
        .from("products")
        .select("id, name, brand, price_cny, price_eur, image, views, category")
        .in("category", group.cats)
        .lt("price_cny", 200)
        .gt("price_cny", 0)
        .not("image", "is", null)
        .neq("image", "")
        .order("score", { ascending: false })
        .limit(6);

      results[group.label] = (data as Product[]) || [];
    })
  );

  return results;
}

export default async function BudgetFindsPage() {
  const productsByGroup = await fetchBudgetProducts();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/guides" className="transition-colors hover:text-accent">
          Guides
        </Link>
        <span>/</span>
        <span className="text-[#d4d4d8]">Budget Finds Under ¥200</span>
      </nav>

      {/* Title */}
      <h1 className="font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
        Best Budget Finds Under ¥200
      </h1>
      <p className="mt-4 text-lg text-text-secondary">
        Cheap reps that look expensive. Every product here is under ¥200
        (~€27) and handpicked from 19,000+ finds.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-muted">
        <span>6 min read</span>
        <span>·</span>
        <span>By Murm</span>
        <span>·</span>
        <span>Last updated: March 2026</span>
      </div>

      {/* KakoBuy banner */}
      <div className="mt-8 rounded-xl border border-accent/30 bg-gradient-to-r from-accent/20 to-accent/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-white">
              Buy any of these through KakoBuy
            </p>
            <p className="text-sm text-text-secondary">
              Click any product → hit KakoBuy → done. Free QC photos included.
            </p>
          </div>
          <a
            href="https://ikako.vip/r/6gkjt"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:shadow-[0_0_20px_rgba(254,66,5,0.3)]"
          >
            Sign up free →
          </a>
        </div>
      </div>

      {/* Category sections */}
      {categoryGroups.map((group) => {
        const products = productsByGroup[group.label] || [];
        if (products.length === 0) return null;

        const filterCat = group.cats[0];

        return (
          <section key={group.label} className="mt-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {group.emoji} {group.label}
              </h2>
              <Link
                href={`/products?category=${encodeURIComponent(filterCat)}&maxPrice=200`}
                className="text-sm text-accent hover:text-accent/80 transition-colors"
              >
                View all →
              </Link>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group overflow-hidden rounded-xl bg-[#141414] transition-colors hover:bg-[#1a1a1a]"
                >
                  <div className="aspect-square overflow-hidden bg-[#0e0e0e]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <p className="mb-1 text-sm font-semibold text-white line-clamp-2 leading-tight">
                      {p.name}
                    </p>
                    <p className="mb-2 text-xs text-text-muted">
                      {p.brand} · {p.views} views
                    </p>
                    <p className="font-bold text-accent">
                      ¥{p.price_cny}{" "}
                      <span className="text-xs font-normal text-text-muted">
                        ~€{(p.price_cny / 7.5).toFixed(2)}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Verdict */}
            <div className="mt-3 rounded-xl bg-[#141414] p-4">
              <p className="text-sm leading-relaxed text-[#d4d4d8]">
                <strong className="text-white">Verdict:</strong> {group.verdict}
              </p>
            </div>
          </section>
        );
      })}

      {/* Girls crosslink */}
      <div className="mt-12 rounded-xl bg-[#141414] p-5">
        <p className="mb-1 font-semibold text-white">
          Looking for women&apos;s budget finds?
        </p>
        <p className="text-sm text-[#d4d4d8]">
          Check out our{" "}
          <Link href="/guides/girls-collection" className="text-pink-500 hover:underline">
            Girls Collection guide
          </Link>{" "}
          — 2,500+ curated women&apos;s finds including budget picks.
        </p>
      </div>

      {/* Budget tips */}
      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold text-white">
          Budget shopping tips
        </h2>
        <div className="space-y-4">
          <div className="rounded-xl bg-[#141414] p-5">
            <p className="mb-1 font-semibold text-white">🎯 Start small</p>
            <p className="text-sm text-[#d4d4d8]">
              Your first haul should be 3-5 budget items. Learn the process
              before going big. Total cost: ~$20-40 + shipping.
            </p>
          </div>
          <div className="rounded-xl bg-[#141414] p-5">
            <p className="mb-1 font-semibold text-white">📦 Bundle your haul</p>
            <p className="text-sm text-[#d4d4d8]">
              Shipping 1 item costs almost the same as shipping 5. Fill your
              haul with budget pieces to get the most bang for your buck.
            </p>
          </div>
          <div className="rounded-xl bg-[#141414] p-5">
            <p className="mb-1 font-semibold text-white">📸 Always check QC</p>
            <p className="text-sm text-[#d4d4d8]">
              Budget doesn&apos;t mean blind buy. KakoBuy gives you free QC
              photos — use them. Return anything that looks off.
            </p>
          </div>
          <div className="rounded-xl bg-[#141414] p-5">
            <p className="mb-1 font-semibold text-white">
              💎 Accessories are best value
            </p>
            <p className="text-sm text-[#d4d4d8]">
              Belts, caps, sunglasses, and jewelry have the highest
              quality-to-price ratio at budget tier. Start here.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <div className="mt-12 mb-12 rounded-xl bg-gradient-to-r from-[#FE4205] to-[#c2410c] p-8 text-center">
        <h2 className="text-2xl font-bold text-white">
          Ready to build a budget haul?
        </h2>
        <p className="mt-2 text-white/80">
          Sign up to KakoBuy and start shopping for under ¥200 per item.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="https://ikako.vip/r/6gkjt"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-white px-8 py-3 font-bold text-[#FE4205] transition-colors hover:bg-zinc-100"
          >
            Sign up to KakoBuy →
          </a>
          <Link
            href="/products?maxPrice=200"
            className="rounded-lg border border-white/20 bg-white/10 px-8 py-3 font-semibold text-white transition-colors hover:bg-white/20"
          >
            Browse budget finds
          </Link>
        </div>
      </div>

      {/* Related */}
      <div className="border-t border-[rgba(255,255,255,0.08)] pt-8">
        <h3 className="mb-4 text-lg font-bold text-white">More guides</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/guides/how-to-buy-reps-kakobuy"
            className="rounded-xl bg-[#141414] p-5 transition-colors hover:bg-[#1a1a1a]"
          >
            <p className="mb-1 font-semibold text-white">
              How to Buy Reps Using KakoBuy
            </p>
            <p className="text-sm text-text-muted">
              Step-by-step beginner tutorial
            </p>
          </Link>
          <Link
            href="/guides/girls-collection"
            className="rounded-xl bg-[#141414] p-5 transition-colors hover:bg-[#1a1a1a]"
          >
            <p className="mb-1 font-semibold text-white">
              Girls Collection Guide
            </p>
            <p className="text-sm text-text-muted">
              2,500+ curated women&apos;s finds
            </p>
          </Link>
        </div>
      </div>
    </article>
  );
}
