import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Reps by Category 2026 | MurmReps",
  description:
    "Browse the best replica finds by category. Shoes, hoodies, bags, jewelry, jackets, and more — ranked by the community.",
  openGraph: {
    title: "Best Reps by Category 2026 | MurmReps",
    description:
      "Browse the best replica finds by category. Shoes, hoodies, bags, jewelry, jackets, and more.",
  },
  alternates: { canonical: "/best-rep" },
};

const CATEGORIES = [
  {
    slug: "shoes",
    name: "Shoes",
    emoji: "👟",
    description:
      "Dunks, Jordans, Balenciagas, and more. The most popular rep category.",
  },
  {
    slug: "hoodies",
    name: "Hoodies",
    emoji: "🧥",
    description:
      "Chrome Hearts, Supreme, Balenciaga — heavyweight blanks and premium prints.",
  },
  {
    slug: "bags",
    name: "Bags",
    emoji: "👜",
    description:
      "Louis Vuitton, Gucci, Prada designer bags at a fraction of retail.",
  },
  {
    slug: "jewelry",
    name: "Jewelry",
    emoji: "💍",
    description:
      "Chrome Hearts, Vivienne Westwood rings, necklaces, and bracelets.",
  },
  {
    slug: "jackets",
    name: "Jackets",
    emoji: "🧥",
    description:
      "Moncler puffers, North Face nuptses, and designer outerwear.",
  },
  {
    slug: "pants",
    name: "Pants & Jeans",
    emoji: "👖",
    description:
      "Gallery Dept jeans, Tech Fleece joggers, Represent cargos.",
  },
  {
    slug: "watches",
    name: "Watches",
    emoji: "⌚",
    description:
      "Rolex, AP, Cartier, and Omega replicas across all movement tiers.",
  },
  {
    slug: "sneakers",
    name: "Sneakers Under $30",
    emoji: "💰",
    description:
      "The best budget sneakers under 230 yuan. Great daily beaters.",
  },
  {
    slug: "accessories",
    name: "Accessories",
    emoji: "🕶️",
    description:
      "Belts, hats, sunglasses, and wallets from top designer brands.",
  },
  {
    slug: "t-shirts",
    name: "T-Shirts",
    emoji: "👕",
    description:
      "Graphic tees and designer t-shirts from Supreme, Balenciaga, and more.",
  },
];

export default function BestRepIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-white mb-4">
        Best Reps by Category 2026
      </h1>
      <p className="text-text-secondary leading-relaxed mb-8">
        Explore the top replica finds across every major category. Each page
        features community-ranked products, top brands, budget and premium
        picks, and buying guides.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/best-rep/${cat.slug}`}
            className="group rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 transition-all hover:border-accent/20"
          >
            <span className="text-2xl">{cat.emoji}</span>
            <h2 className="font-heading text-base font-semibold text-white mt-2 group-hover:text-accent transition-colors">
              Best Rep {cat.name}
            </h2>
            <p className="text-sm text-text-muted mt-1 leading-relaxed">
              {cat.description}
            </p>
          </Link>
        ))}
      </div>

      {/* ── CTA ── */}
      <div className="mt-12 rounded-xl bg-gradient-to-r from-[#FE4205] to-[#c2410c] p-8 text-center">
        <h2 className="text-xl font-bold text-white">
          Start shopping with KakoBuy
        </h2>
        <p className="mt-2 text-white/80">
          The easiest way to buy reps with QC photos and worldwide shipping.
        </p>
        <a
          href="https://ikako.vip/r/6gkjt"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-bold text-[#FE4205]"
        >
          Sign up to KakoBuy →
        </a>
      </div>
    </div>
  );
}
