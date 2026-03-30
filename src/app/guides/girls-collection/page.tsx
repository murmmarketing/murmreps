import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Girls Collection: Complete Guide to Women's Rep Finds | MurmReps",
  description:
    "2,500+ handpicked women's rep finds. Bags, shoes, jewelry, clothing from Chanel, Dior, Hermes, Louis Vuitton and more.",
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
  brands: string;
  tip: string;
}[] = [
  {
    label: "Bags",
    emoji: "👜",
    cats: ["Bags", "Wallets"],
    brands: "Louis Vuitton, Chanel, Dior, Hermes, Goyard",
    tip: "Budget for everyday, mid-tier for statement pieces. Check hardware close-ups in QC.",
  },
  {
    label: "Shoes",
    emoji: "👠",
    cats: ["Sneakers", "Shoes", "Boots", "Slides & Sandals"],
    brands: "Hermes Oran, Dior, Chanel, Miu Miu",
    tip: "Size down 1 from EU sizing. Always check sole quality in QC photos.",
  },
  {
    label: "Jewelry",
    emoji: "💎",
    cats: ["Necklaces", "Bracelets", "Earrings", "Rings"],
    brands: "Van Cleef & Arpels, Vivienne Westwood, Chanel, Louis Vuitton",
    tip: "Even budget jewelry pieces look stunning. Check if silver or stainless steel before buying.",
  },
  {
    label: "Accessories",
    emoji: "🧣",
    cats: [
      "Scarves & Gloves", "Hats & Caps", "Belts", "Sunglasses",
      "Watches", "Phone Cases", "Keychains & Accessories",
    ],
    brands: "Hermes scarves, Miu Miu caps, Celine, Loewe",
    tip: "Luxury scarves are some of the best reps available. Silk quality is excellent even at budget tier.",
  },
  {
    label: "Clothing",
    emoji: "👗",
    cats: [
      "T-Shirts", "Shirts", "Hoodies", "Sweaters", "Crewnecks",
      "Jackets", "Coats & Puffers", "Vests",
      "Pants", "Jeans", "Shorts", "Tracksuits",
    ],
    brands: "Acne Studios, Miu Miu, Jacquemus, Loewe",
    tip: "Size up 1-2 from Western sizing. Knitwear is the safest bet — quality is consistently great.",
  },
];

async function fetchGirlsProducts() {
  const results: Record<string, Product[]> = {};

  await Promise.all(
    categoryGroups.map(async (group) => {
      const { data } = await supabase
        .from("products")
        .select("id, name, brand, price_cny, price_eur, image, views, category")
        .in("category", group.cats)
        .in("collection", ["girls", "both"])
        .not("image", "is", null)
        .neq("image", "")
        .order("score", { ascending: false })
        .limit(4);

      results[group.label] = (data as Product[]) || [];
    })
  );

  return results;
}

export default async function GirlsCollectionGuidePage() {
  const productsByGroup = await fetchGirlsProducts();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/guides" className="transition-colors hover:text-pink-500">
          Guides
        </Link>
        <span>/</span>
        <span className="text-[#d4d4d8]">Girls Collection</span>
      </nav>

      {/* Title */}
      <h1 className="font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
        Girls Collection:{" "}
        <span className="text-pink-500">Complete Guide</span>
      </h1>
      <p className="mt-4 text-lg text-text-secondary">
        2,500+ handpicked women&apos;s rep finds. Bags, shoes, jewelry,
        clothing from the biggest luxury brands — all curated and
        quality-checked.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-muted">
        <span>5 min read</span>
        <span>·</span>
        <span>By Murm</span>
        <span>·</span>
        <span>Last updated: March 2026</span>
      </div>

      {/* Pink banner */}
      <div className="mt-8 rounded-xl border border-pink-500/30 bg-gradient-to-r from-pink-500/20 to-pink-500/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-white">
              Browse the full Girls Collection
            </p>
            <p className="text-sm text-text-secondary">
              2,500+ curated finds with filters, photos, and agent links.
            </p>
          </div>
          <Link
            href="/girls"
            className="whitespace-nowrap rounded-lg bg-pink-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-600"
          >
            Shop For Her →
          </Link>
        </div>
      </div>

      {/* Category sections */}
      {categoryGroups.map((group) => {
        const products = productsByGroup[group.label] || [];
        if (products.length === 0) return null;

        return (
          <section key={group.label} className="mt-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {group.emoji} {group.label}
              </h2>
              <Link
                href={`/girls?category=${encodeURIComponent(group.cats[0])}`}
                className="text-sm text-pink-500 hover:text-pink-400 transition-colors"
              >
                View all →
              </Link>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 gap-3">
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
                    <p className="text-sm font-bold text-pink-500">
                      {p.price_cny > 0 ? (
                        <>
                          ¥{p.price_cny}{" "}
                          <span className="text-xs font-normal text-text-muted">
                            ~€{(p.price_cny / 7.5).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        "Multi"
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Brands + tip */}
            <div className="mt-3 space-y-2">
              <div className="rounded-xl bg-[#141414] p-4">
                <p className="text-sm text-[#d4d4d8]">
                  <strong className="text-white">Top brands:</strong>{" "}
                  {group.brands}
                </p>
              </div>
              <div className="rounded-xl bg-[#141414] p-4">
                <p className="text-sm text-[#d4d4d8]">
                  <strong className="text-white">Buying tip:</strong>{" "}
                  {group.tip}
                </p>
              </div>
            </div>
          </section>
        );
      })}

      {/* How to shop */}
      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold text-white">
          How to shop the Girls Collection
        </h2>
        <div className="space-y-3">
          <div className="border-l-2 border-pink-500 pl-5">
            <div className="rounded-xl bg-[#141414] p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-500 text-sm font-bold text-white">
                  1
                </span>
                <h3 className="font-semibold text-white">
                  Browse the collection
                </h3>
              </div>
              <p className="text-sm text-[#d4d4d8]">
                Go to{" "}
                <Link href="/girls" className="text-pink-500 hover:underline">
                  murmreps.com/girls
                </Link>{" "}
                and filter by category, brand, or price. Every product has
                photos and community ratings.
              </p>
            </div>
          </div>
          <div className="border-l-2 border-pink-500 pl-5">
            <div className="rounded-xl bg-[#141414] p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-500 text-sm font-bold text-white">
                  2
                </span>
                <h3 className="font-semibold text-white">
                  Click a product you love
                </h3>
              </div>
              <p className="text-sm text-[#d4d4d8]">
                Open the product page. See all the photos, price comparisons,
                and agent buttons.
              </p>
            </div>
          </div>
          <div className="border-l-2 border-pink-500 pl-5">
            <div className="rounded-xl bg-[#141414] p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-500 text-sm font-bold text-white">
                  3
                </span>
                <h3 className="font-semibold text-white">
                  Buy through KakoBuy
                </h3>
              </div>
              <p className="text-sm text-[#d4d4d8]">
                Hit the KakoBuy button to buy. Not sure how? Read our{" "}
                <Link
                  href="/guides/how-to-buy-reps-kakobuy"
                  className="text-accent hover:underline"
                >
                  step-by-step buying guide
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Budget crosslink */}
      <div className="mt-10 rounded-xl bg-[#141414] p-5">
        <p className="mb-1 font-semibold text-white">On a budget?</p>
        <p className="text-sm text-[#d4d4d8]">
          Check our{" "}
          <Link href="/guides/budget-finds" className="text-accent hover:underline">
            Budget Finds Under ¥200 guide
          </Link>{" "}
          for the best cheap reps across every category.
        </p>
      </div>

      {/* Final CTA */}
      <div className="mt-12 mb-12 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 p-8 text-center">
        <h2 className="text-2xl font-bold text-white">
          Ready to shop the Girls Collection?
        </h2>
        <p className="mt-2 text-white/80">
          2,500+ curated finds waiting for you.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/girls"
            className="rounded-lg bg-white px-8 py-3 font-bold text-pink-500 transition-colors hover:bg-zinc-100"
          >
            Shop For Her →
          </Link>
          <a
            href="https://ikako.vip/r/6gkjt"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/20 bg-white/10 px-8 py-3 font-semibold text-white transition-colors hover:bg-white/20"
          >
            Sign up to KakoBuy
          </a>
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
            href="/guides/budget-finds"
            className="rounded-xl bg-[#141414] p-5 transition-colors hover:bg-[#1a1a1a]"
          >
            <p className="mb-1 font-semibold text-white">
              Budget Finds Under ¥200
            </p>
            <p className="text-sm text-text-muted">
              Cheap reps that look expensive
            </p>
          </Link>
        </div>
      </div>
    </article>
  );
}
