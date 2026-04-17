import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Weidian Sellers 2026 — Trusted Stores",
  description:
    "The best Weidian sellers for shoes, clothing, and accessories in 2026. Verified stores with consistent quality, real QC photos, and direct agent links.",
  openGraph: {
    title: "Best Weidian Sellers 2026 — Trusted Stores",
    description:
      "The best Weidian sellers for shoes, clothing, and accessories in 2026. Verified stores with consistent quality.",
  },
  alternates: { canonical: "/best-weidian-sellers" },
};

const sellers = [
  { name: "Top Dreamer (TD)", specialty: "Best batch Jordan, Dunk, Yeezy", price: "¥150-500", rating: 5, link: "https://weidian.com/?userid=1866271861" },
  { name: "A1 Top", specialty: "Budget to mid-tier sneakers, huge catalog", price: "¥100-400", rating: 4, link: "https://weidian.com/?userid=1624885820" },
  { name: "Passerby", specialty: "Budget sneakers, excellent value", price: "¥60-200", rating: 4, link: "https://weidian.com/?userid=1814230492" },
  { name: "Cappuccino", specialty: "Mid-tier Dunks and Jordans", price: "¥100-300", rating: 4, link: "https://weidian.com/?userid=1621765644" },
  { name: "Old Chen Putian", specialty: "Budget Dunks and Air Force 1s", price: "¥60-150", rating: 3, link: "" },
  { name: "GTR", specialty: "Budget to mid sneakers, fast shipping", price: "¥80-250", rating: 4, link: "" },
  { name: "Philanthropist", specialty: "Budget Jordans and Dunks", price: "¥70-200", rating: 3, link: "" },
  { name: "CSJ/Pure Original", specialty: "Mid-tier to best batch sneakers", price: "¥200-500", rating: 4, link: "" },
];

export default function BestWeidianSellers() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Best Weidian Sellers 2026 — Trusted Stores for Reps",
            author: { "@type": "Organization", name: "MurmReps" },
            publisher: { "@type": "Organization", name: "MurmReps" },
          }),
        }}
      />

      <h1 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Best Weidian Sellers 2026
      </h1>
      <p className="mt-2 text-lg text-text-secondary">
        Trusted stores with consistent quality — verified through real orders and QC reviews
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-text-secondary">
        <p>
          Weidian is the largest marketplace for rep sneakers, and finding reliable sellers can be overwhelming.
          This guide lists the best Weidian sellers in 2026, verified through hundreds of real orders, QC photo
          reviews, and community feedback across Reddit, Discord, and our own testing.
        </p>
        <p>
          Every seller on this list has been active for at least 6 months with consistent quality. We track
          return rates, QC accuracy, and shipping speed. Sellers that drop in quality get removed.
        </p>
      </div>

      <h2 className="mt-10 font-heading text-2xl font-bold text-white">Top Weidian Shoe Sellers</h2>
      <div className="mt-6 space-y-4">
        {sellers.map((seller) => (
          <div key={seller.name} className="rounded-card border border-subtle bg-surface p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-base font-semibold text-white">{seller.name}</h3>
                <p className="mt-1 text-sm text-text-secondary">{seller.specialty}</p>
                <p className="mt-1 text-xs text-text-muted">{seller.price}</p>
              </div>
              <div className="flex gap-0.5 text-xs">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < seller.rating ? "text-yellow-400" : "text-white/10"}>★</span>
                ))}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {seller.link && (
                <a href={seller.link} target="_blank" rel="noopener noreferrer"
                  className="rounded-btn border border-subtle bg-void px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-accent hover:text-accent">
                  View Store →
                </a>
              )}
              <Link href={`/products?q=${encodeURIComponent(seller.name.split(" ")[0])}`}
                className="rounded-btn border border-subtle bg-void px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-accent hover:text-accent">
                Find products →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-12 font-heading text-2xl font-bold text-white">How to Buy from Weidian Sellers</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-text-secondary">
        <p>
          You can&apos;t buy directly from Weidian — you need a shopping agent like KakoBuy to handle the
          purchase, quality check, and international shipping. Here&apos;s how it works:
        </p>
        <div className="space-y-3">
          <div className="flex gap-3"><span className="text-accent font-bold">1.</span><p><strong className="text-white">Copy the Weidian link</strong> — Find the product you want and copy its URL</p></div>
          <div className="flex gap-3"><span className="text-accent font-bold">2.</span><p><strong className="text-white">Paste into KakoBuy</strong> — Use our <Link href="/converter" className="text-accent hover:underline">link converter</Link> or paste directly into KakoBuy</p></div>
          <div className="flex gap-3"><span className="text-accent font-bold">3.</span><p><strong className="text-white">Add to cart &amp; pay</strong> — KakoBuy buys the item from the seller for you</p></div>
          <div className="flex gap-3"><span className="text-accent font-bold">4.</span><p><strong className="text-white">QC photos</strong> — You receive real photos to check quality before shipping internationally</p></div>
          <div className="flex gap-3"><span className="text-accent font-bold">5.</span><p><strong className="text-white">Ship your haul</strong> — Choose a shipping line and get your items delivered in 7-20 days</p></div>
        </div>
      </div>

      <h2 className="mt-12 font-heading text-2xl font-bold text-white">Budget vs Mid-Tier vs Best Batch</h2>
      <div className="mt-4 text-sm leading-relaxed text-text-secondary">
        <p className="mb-4">
          Weidian sellers typically operate in price tiers. Understanding these tiers helps you pick the right
          seller for your budget and expectations.
        </p>
        <div className="overflow-x-auto rounded-xl border border-subtle">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Tier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Quality</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              <tr><td className="px-4 py-3 text-white">Budget</td><td className="px-4 py-3 text-text-secondary">¥60-200</td><td className="px-4 py-3 text-text-secondary">Decent shape, basic materials</td><td className="px-4 py-3 text-text-secondary">Beaters, testing new styles</td></tr>
              <tr><td className="px-4 py-3 text-white">Mid-Tier</td><td className="px-4 py-3 text-text-secondary">¥200-400</td><td className="px-4 py-3 text-text-secondary">Good materials, accurate details</td><td className="px-4 py-3 text-text-secondary">Daily wear, most people</td></tr>
              <tr><td className="px-4 py-3 text-white">Best Batch</td><td className="px-4 py-3 text-text-secondary">¥400+</td><td className="px-4 py-3 text-text-secondary">Retail-like, 1:1 accuracy</td><td className="px-4 py-3 text-text-secondary">Accuracy-focused buyers</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4">
          Check our <Link href="/best-batch" className="text-accent hover:underline">batch comparison pages</Link> for
          detailed comparisons of specific shoes across all tiers.
        </p>
      </div>

      <h2 className="mt-12 font-heading text-2xl font-bold text-white">Red Flags to Watch For</h2>
      <div className="mt-4 space-y-2 text-sm text-text-secondary">
        <p>Not every Weidian seller is trustworthy. Avoid sellers who:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Have very few sales or reviews</li>
          <li>Use only stock photos (no real product shots)</li>
          <li>Don&apos;t accept returns or exchanges</li>
          <li>Have prices that seem too good to be true (¥30 Jordans = terrible quality)</li>
          <li>Were recently created (less than 3 months old)</li>
        </ul>
        <p className="mt-3">
          Stick to the sellers listed above and you&apos;ll avoid 99% of problems. For a complete list including
          Taobao and Yupoo sellers, check our <Link href="/sellers" className="text-accent hover:underline">full
          trusted sellers page</Link>.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-8 text-center">
        <h3 className="font-heading text-xl font-bold text-white">Ready to Buy from Weidian?</h3>
        <p className="mt-2 text-sm text-gray-400">Sign up with KakoBuy for the easiest way to shop Weidian sellers</p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <a href="https://ikako.vip/r/6gkjt" target="_blank" rel="noopener noreferrer"
            className="rounded-xl bg-accent px-6 py-3 font-medium text-white transition-colors hover:opacity-90">
            Sign Up with KakoBuy →
          </a>
          <Link href="/sellers" className="rounded-xl border border-white/20 px-6 py-3 font-medium text-white transition-colors hover:bg-white/5">
            View All Sellers
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/kakobuy-spreadsheet" className="text-accent hover:underline">KakoBuy spreadsheet →</Link>
        <Link href="/guides/how-to-buy-reps-kakobuy" className="text-accent hover:underline">How to buy reps →</Link>
        <Link href="/best-batch" className="text-accent hover:underline">Best batch comparisons →</Link>
        <Link href="/converter" className="text-accent hover:underline">Link converter →</Link>
      </div>
    </div>
  );
}
