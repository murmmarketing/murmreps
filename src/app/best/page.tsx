import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Reps by Brand 2026 | MurmReps",
  description:
    "Find the best reps by brand. Chrome Hearts, Nike, Balenciaga, Louis Vuitton and more.",
  openGraph: {
    title: "Best Reps by Brand 2026 | MurmReps",
    description:
      "Find the best reps by brand. Chrome Hearts, Nike, Balenciaga, Louis Vuitton and more.",
  },
  alternates: { canonical: "/best" },
};

const BRANDS = [
  { slug: "chrome-hearts", name: "Chrome Hearts", tagline: "Gothic jewelry & leather goods", count: 850 },
  { slug: "nike", name: "Nike", tagline: "Dunks, AF1, Tech Fleece & more", count: 3200 },
  { slug: "louis-vuitton", name: "Louis Vuitton", tagline: "Monogram bags, belts & sneakers", count: 1400 },
  { slug: "balenciaga", name: "Balenciaga", tagline: "Track runners & oversized luxury", count: 900 },
  { slug: "supreme", name: "Supreme", tagline: "Box logos & streetwear collabs", count: 600 },
  { slug: "gucci", name: "Gucci", tagline: "GG pattern, belts & sneakers", count: 1100 },
  { slug: "dior", name: "Dior", tagline: "B22, B23 sneakers & Oblique bags", count: 700 },
  { slug: "stussy", name: "Stussy", tagline: "Surf culture graphic tees", count: 350 },
  { slug: "acne-studios", name: "Acne Studios", tagline: "Scandinavian minimalist staples", count: 250 },
  { slug: "rick-owens", name: "Rick Owens", tagline: "Geobaskets & dark avant-garde", count: 400 },
  { slug: "prada", name: "Prada", tagline: "Triangle logo bags & sneakers", count: 650 },
  { slug: "hermes", name: "Hermes", tagline: "H belts, scarves & sandals", count: 500 },
  { slug: "burberry", name: "Burberry", tagline: "Check pattern scarves & outerwear", count: 450 },
  { slug: "ralph-lauren", name: "Ralph Lauren", tagline: "Old money polos & knitwear", count: 300 },
  { slug: "off-white", name: "Off-White", tagline: "Diagonal stripes & bold graphics", count: 550 },
  { slug: "vivienne-westwood", name: "Vivienne Westwood", tagline: "Saturn orb jewelry & punk luxury", count: 400 },
  { slug: "moncler", name: "Moncler", tagline: "Luxury puffer jackets & vests", count: 350 },
  { slug: "new-balance", name: "New Balance", tagline: "550, 2002R & collab sneakers", count: 500 },
  { slug: "adidas", name: "Adidas", tagline: "Sambas, Campus & Yeezy", count: 1800 },
  { slug: "jordan", name: "Jordan", tagline: "Jordan 1, 4, 11 & more", count: 2500 },
  { slug: "bape", name: "BAPE", tagline: "Shark hoodies & camo streetwear", count: 450 },
];

export default function BestBrandsIndex() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
        Best Reps by Brand
      </h1>
      <p className="mt-2 text-lg text-text-secondary">
        Browse the best replica finds for {BRANDS.length} popular brands, ranked by quality and community feedback.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BRANDS.map((b) => (
          <Link
            key={b.slug}
            href={`/best/${b.slug}`}
            className="group flex flex-col gap-1 rounded-xl border border-subtle bg-[#141414] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-[0_0_20px_rgba(254,66,5,0.08)]"
          >
            <h2 className="font-heading text-base font-semibold text-white group-hover:text-accent transition-colors">
              {b.name}
            </h2>
            <p className="text-sm text-text-secondary">{b.tagline}</p>
            <p className="mt-2 text-xs text-text-muted">{b.count.toLocaleString()}+ products</p>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-xl bg-gradient-to-r from-[#FE4205] to-[#c2410c] p-8 text-center">
        <h2 className="text-xl font-bold text-white">New to reps?</h2>
        <p className="mt-2 text-white/80">Read our beginner guide and sign up to KakoBuy to get started.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link href="/guides/how-to-buy-reps-kakobuy" className="inline-block rounded-lg bg-white px-6 py-3 font-bold text-[#FE4205]">
            Read the Guide
          </Link>
          <a href="https://ikako.vip/r/6gkjt" target="_blank" rel="noopener noreferrer"
            className="inline-block rounded-lg border-2 border-white px-6 py-3 font-bold text-white hover:bg-white/10 transition-colors">
            Sign up to KakoBuy →
          </a>
        </div>
      </div>
    </div>
  );
}
