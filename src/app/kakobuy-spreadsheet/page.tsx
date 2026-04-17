import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best KakoBuy Spreadsheet 2026 — 15,000+ Finds | MurmReps",
  description:
    "The biggest KakoBuy spreadsheet with 15,000+ rep finds. Browse shoes, clothing, bags, jewelry and more. Updated daily with QC photos, prices, and direct KakoBuy links.",
  openGraph: {
    title: "Best KakoBuy Spreadsheet 2026 — 15,000+ Finds | MurmReps",
    description:
      "The biggest KakoBuy spreadsheet with 15,000+ rep finds. Browse shoes, clothing, bags, jewelry and more.",
  },
  alternates: { canonical: "/kakobuy-spreadsheet" },
};

const categories = [
  { name: "Shoes", count: "7,000+", emoji: "👟", query: "shoes" },
  { name: "Clothing", count: "4,500+", emoji: "👕", query: "clothing" },
  { name: "Bags", count: "1,200+", emoji: "👜", query: "bags" },
  { name: "Jewelry", count: "800+", emoji: "💍", query: "jewelry" },
  { name: "Accessories", count: "600+", emoji: "🧢", query: "accessories" },
  { name: "Watches", count: "400+", emoji: "⌚", query: "watches" },
];

export default function KakoBuySpreadsheet() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Best KakoBuy Spreadsheet 2026 — 15,000+ Finds",
            author: { "@type": "Organization", name: "MurmReps" },
            publisher: { "@type": "Organization", name: "MurmReps" },
          }),
        }}
      />

      <h1 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Best KakoBuy Spreadsheet 2026
      </h1>
      <p className="mt-2 text-lg text-accent font-semibold">15,000+ verified finds with QC photos and direct links</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-text-secondary">
        <p>
          Looking for a KakoBuy spreadsheet? You&apos;re in the right place. MurmReps maintains the largest
          curated database of rep finds that work with KakoBuy — over 15,000 products across shoes, clothing,
          bags, jewelry, and accessories. Every item includes real QC photos, accurate pricing in CNY/USD/EUR,
          quality ratings, and one-click links that open directly in KakoBuy.
        </p>
        <p>
          Unlike static Google Sheets that go outdated within weeks, our spreadsheet is a live database updated
          daily. Dead links get removed, new finds get added, and prices stay current. You can search by brand,
          category, price range, or quality tier — and every product links directly to KakoBuy so you can add
          it to your cart instantly.
        </p>
      </div>

      <h2 className="mt-12 font-heading text-2xl font-bold text-white">Browse by Category</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={`/products?category=${encodeURIComponent(cat.query)}`}
            className="group flex items-center gap-4 rounded-card border border-subtle bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20"
          >
            <span className="text-3xl">{cat.emoji}</span>
            <div>
              <p className="font-heading font-semibold text-white group-hover:text-accent transition-colors">{cat.name}</p>
              <p className="text-xs text-text-muted">{cat.count} finds</p>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 font-heading text-2xl font-bold text-white">Why Use MurmReps Instead of a Google Sheet?</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-text-secondary">
        <p>
          Traditional KakoBuy spreadsheets on Reddit and Discord are static Google Sheets maintained by one
          person. They go stale fast — links die, prices change, and new finds don&apos;t get added. MurmReps
          solves all of this with a live, searchable database.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { title: "Always updated", desc: "New finds added daily, dead links removed automatically" },
            { title: "Real QC photos", desc: "Every item has actual photos — no stock images or seller pics" },
            { title: "Quality ratings", desc: "Each product scored on accuracy, materials, and value" },
            { title: "Price comparison", desc: "See prices in CNY, USD, and EUR with live conversion" },
            { title: "One-click buy", desc: "Links open directly in KakoBuy — no copy-pasting URLs" },
            { title: "Advanced search", desc: "Filter by brand, category, price range, quality tier" },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-subtle bg-surface p-4">
              <p className="font-medium text-white">{item.title}</p>
              <p className="mt-1 text-xs text-text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="mt-12 font-heading text-2xl font-bold text-white">Popular Brands in Our Database</h2>
      <p className="mt-2 text-sm text-text-secondary">
        Our spreadsheet covers all the brands you&apos;re looking for: Nike, Jordan, Adidas, New Balance,
        Balenciaga, Dior, Louis Vuitton, Gucci, Chrome Hearts, Stussy, Essentials, The North Face, and
        hundreds more. Each brand page shows all available finds sorted by quality and popularity.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Nike", "Jordan", "Adidas", "New Balance", "Balenciaga", "Dior", "Louis Vuitton", "Gucci", "Chrome Hearts", "Stussy", "Essentials", "TNF"].map((brand) => (
          <Link
            key={brand}
            href={`/products?q=${encodeURIComponent(brand)}`}
            className="rounded-pill border border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-accent hover:text-accent"
          >
            {brand}
          </Link>
        ))}
      </div>

      <h2 className="mt-12 font-heading text-2xl font-bold text-white">How to Use This Spreadsheet</h2>
      <div className="mt-4 space-y-3 text-sm text-text-secondary">
        <div className="flex gap-3">
          <span className="shrink-0 text-accent font-bold">1.</span>
          <p><strong className="text-white">Sign up for KakoBuy</strong> — Create a free account through our link to get the best shipping rates and coupons.</p>
        </div>
        <div className="flex gap-3">
          <span className="shrink-0 text-accent font-bold">2.</span>
          <p><strong className="text-white">Browse finds</strong> — Search by brand, category, or use our quality filters to find exactly what you want.</p>
        </div>
        <div className="flex gap-3">
          <span className="shrink-0 text-accent font-bold">3.</span>
          <p><strong className="text-white">Click to buy</strong> — Hit any product&apos;s KakoBuy button to open it directly in your agent. Add to cart and pay.</p>
        </div>
        <div className="flex gap-3">
          <span className="shrink-0 text-accent font-bold">4.</span>
          <p><strong className="text-white">Get QC photos</strong> — KakoBuy sends you real photos of your item before shipping. Not happy? Return for free.</p>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-12 rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-8 text-center">
        <h3 className="font-heading text-xl font-bold text-white">Start Shopping</h3>
        <p className="mt-2 text-sm text-gray-400">
          Browse 15,000+ finds or sign up with KakoBuy for exclusive coupons
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <Link href="/products" className="rounded-xl bg-accent px-6 py-3 font-medium text-white transition-colors hover:opacity-90">
            Browse All Finds →
          </Link>
          <a href="https://ikako.vip/r/6gkjt" target="_blank" rel="noopener noreferrer"
            className="rounded-xl border border-white/20 px-6 py-3 font-medium text-white transition-colors hover:bg-white/5">
            Sign Up with KakoBuy
          </a>
        </div>
      </div>

      {/* Internal links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/guides/how-to-buy-reps-kakobuy" className="text-accent hover:underline">How to buy reps with KakoBuy →</Link>
        <Link href="/sellers" className="text-accent hover:underline">Trusted sellers →</Link>
        <Link href="/best-batch" className="text-accent hover:underline">Best batch comparisons →</Link>
        <Link href="/converter" className="text-accent hover:underline">Link converter →</Link>
      </div>
    </div>
  );
}
