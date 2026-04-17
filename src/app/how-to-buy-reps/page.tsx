import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Buy Reps in 2026 — Complete Beginner Guide",
  description:
    "Step-by-step guide to buying reps in 2026. Learn how shopping agents work, which agent to pick, how to find items, place orders, check QC photos, and ship your haul.",
  openGraph: {
    title: "How to Buy Reps in 2026 — Complete Beginner Guide",
    description:
      "Step-by-step guide to buying reps in 2026. Learn how shopping agents work, which agent to pick, and how to build your first haul.",
  },
  alternates: { canonical: "/how-to-buy-reps" },
};

export default function HowToBuyReps() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Buy Reps in 2026",
            description: "Complete beginner guide to buying reps using a shopping agent.",
            step: [
              { "@type": "HowToStep", name: "Sign up for an agent", text: "Create a free account with KakoBuy or another agent." },
              { "@type": "HowToStep", name: "Find items", text: "Browse MurmReps or Weidian/Taobao for products." },
              { "@type": "HowToStep", name: "Add to cart", text: "Paste product links into your agent and add to cart." },
              { "@type": "HowToStep", name: "Pay", text: "Pay via PayPal, card, or Wise." },
              { "@type": "HowToStep", name: "QC photos", text: "Review quality check photos before shipping." },
              { "@type": "HowToStep", name: "Ship", text: "Choose a shipping line and wait for delivery." },
            ],
          }),
        }}
      />

      <h1 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
        How to Buy Reps in 2026
      </h1>
      <p className="mt-2 text-lg text-text-secondary">
        The complete beginner guide — from your first find to your doorstep
      </p>

      <div className="mt-8 space-y-4 text-sm leading-relaxed text-text-secondary">
        <p>
          Buying reps has never been easier, but the process can seem confusing at first. Chinese sellers on
          Weidian and Taobao don&apos;t ship internationally — instead, you use a &quot;shopping agent&quot; as a
          middleman. The agent buys items on your behalf, sends you quality check (QC) photos, and ships everything
          to your door in one package.
        </p>
        <p>
          This guide walks you through every step. By the end, you&apos;ll know exactly how to build your first haul.
        </p>
      </div>

      {/* Step 1 */}
      <h2 className="mt-12 font-heading text-2xl font-bold text-white">Step 1: Choose a Shopping Agent</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
        <p>
          A shopping agent is a service that buys items from Chinese sellers, inspects them, and ships them
          internationally. Think of them as your personal shopper in China. The most popular agents in 2026 are:
        </p>
        <div className="rounded-xl border border-subtle bg-surface p-5">
          <p className="font-semibold text-white">Our recommendation: KakoBuy</p>
          <p className="mt-1">
            KakoBuy is the best agent for beginners and experienced buyers alike. Clean interface, fast QC photos
            (usually within 24 hours), free returns, competitive shipping rates, and excellent English-speaking
            customer support. It accepts PayPal, credit cards, and Wise.
          </p>
          <a href="https://ikako.vip/r/6gkjt" target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-block rounded-btn bg-accent px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
            Sign up for KakoBuy →
          </a>
        </div>
        <p>
          Not sure which agent is right for you? Check our{" "}
          <Link href="/guides/agent-comparison" className="text-accent hover:underline">full agent comparison</Link> or
          see how agents compare head-to-head on our{" "}
          <Link href="/compare/kakobuy-vs-superbuy" className="text-accent hover:underline">comparison pages</Link>.
        </p>
      </div>

      {/* Step 2 */}
      <h2 className="mt-12 font-heading text-2xl font-bold text-white">Step 2: Find Items You Want</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
        <p>There are three main ways to find rep items:</p>
        <div className="space-y-3">
          <div className="rounded-lg border border-subtle bg-surface p-4">
            <p className="font-semibold text-white">MurmReps (recommended)</p>
            <p className="mt-1">
              Browse our <Link href="/products" className="text-accent hover:underline">15,000+ finds</Link> with
              QC photos, quality ratings, and one-click agent links. The easiest way to find verified products.
            </p>
          </div>
          <div className="rounded-lg border border-subtle bg-surface p-4">
            <p className="font-semibold text-white">Weidian &amp; Taobao</p>
            <p className="mt-1">
              Browse Chinese marketplaces directly. Weidian is best for shoes, Taobao for clothing. Use our{" "}
              <Link href="/converter" className="text-accent hover:underline">link converter</Link> to turn any
              Weidian/Taobao link into a KakoBuy link.
            </p>
          </div>
          <div className="rounded-lg border border-subtle bg-surface p-4">
            <p className="font-semibold text-white">Reddit &amp; Discord</p>
            <p className="mt-1">
              Communities like r/FashionReps and r/RepSneakers share finds daily. Copy links and paste
              them into our converter or directly into your agent.
            </p>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <h2 className="mt-12 font-heading text-2xl font-bold text-white">Step 3: Add Items to Your Agent</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
        <p>
          Once you have a product link, paste it into KakoBuy&apos;s search bar. The product details will load
          automatically — select your size, color, and quantity. Add to cart. Repeat for all items you want.
        </p>
        <p>
          <strong className="text-white">Pro tip:</strong> Build a haul of 3-8 items before shipping. Shipping
          costs are charged by weight, so one large package is much cheaper per item than multiple small ones.
        </p>
      </div>

      {/* Step 4 */}
      <h2 className="mt-12 font-heading text-2xl font-bold text-white">Step 4: Pay for Your Items</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
        <p>
          KakoBuy accepts PayPal, credit/debit cards, and Wise (bank transfer). PayPal is the most popular
          option since it offers buyer protection. After paying, your agent places the order with the Chinese
          seller. Items typically arrive at the agent&apos;s warehouse within 3-7 days.
        </p>
      </div>

      {/* Step 5 */}
      <h2 className="mt-12 font-heading text-2xl font-bold text-white">Step 5: Check QC Photos</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
        <p>
          This is the best part of using an agent. Once your items arrive at the warehouse, you&apos;ll receive
          detailed QC (quality check) photos. You can inspect the item for flaws, wrong colors, or sizing issues
          before it ships internationally.
        </p>
        <p>
          If something looks off, you can return it — KakoBuy offers free returns on most items. Use our{" "}
          <Link href="/qc" className="text-accent hover:underline">QC checker tool</Link> to compare your photos
          against retail.
        </p>
      </div>

      {/* Step 6 */}
      <h2 className="mt-12 font-heading text-2xl font-bold text-white">Step 6: Ship Your Haul</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
        <p>
          Once all your items are in the warehouse and you&apos;re happy with the QC photos, submit your package
          for international shipping. You&apos;ll choose a shipping line based on speed and budget:
        </p>
        <div className="overflow-x-auto rounded-xl border border-subtle">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Speed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              <tr><td className="px-4 py-3 text-white">EMS</td><td className="px-4 py-3 text-text-secondary">10-20 days</td><td className="px-4 py-3 text-text-secondary">Medium</td><td className="px-4 py-3 text-text-secondary">Most hauls, good balance</td></tr>
              <tr><td className="px-4 py-3 text-white">DHL/FedEx</td><td className="px-4 py-3 text-text-secondary">5-10 days</td><td className="px-4 py-3 text-text-secondary">High</td><td className="px-4 py-3 text-text-secondary">Fast delivery, light packages</td></tr>
              <tr><td className="px-4 py-3 text-white">SAL</td><td className="px-4 py-3 text-text-secondary">20-40 days</td><td className="px-4 py-3 text-text-secondary">Low</td><td className="px-4 py-3 text-text-secondary">Budget shipping, heavy hauls</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Track your package using our <Link href="/tracking" className="text-accent hover:underline">parcel tracker</Link>.
          Most hauls arrive within 2-3 weeks.
        </p>
      </div>

      <h2 className="mt-12 font-heading text-2xl font-bold text-white">Tips for Your First Haul</h2>
      <div className="mt-4 space-y-2 text-sm text-text-secondary">
        <ul className="ml-4 list-disc space-y-2">
          <li><strong className="text-white">Start small:</strong> 3-5 items for your first haul. Learn the process before going big.</li>
          <li><strong className="text-white">Check size charts:</strong> Chinese sizing runs small. Always measure and compare to the seller&apos;s size chart.</li>
          <li><strong className="text-white">Use trusted sellers:</strong> Stick to our <Link href="/sellers" className="text-accent hover:underline">verified sellers list</Link> to avoid quality issues.</li>
          <li><strong className="text-white">Remove boxes to save weight:</strong> Shoe boxes add 300-500g each. Removing them saves significant shipping costs.</li>
          <li><strong className="text-white">Declare correctly:</strong> Your agent handles customs declarations. Follow their recommended values.</li>
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-8 text-center">
        <h3 className="font-heading text-xl font-bold text-white">Ready to Start?</h3>
        <p className="mt-2 text-sm text-gray-400">Sign up with KakoBuy and browse 15,000+ finds</p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <a href="https://ikako.vip/r/6gkjt" target="_blank" rel="noopener noreferrer"
            className="rounded-xl bg-accent px-6 py-3 font-medium text-white transition-colors hover:opacity-90">
            Sign Up with KakoBuy →
          </a>
          <Link href="/products" className="rounded-xl border border-white/20 px-6 py-3 font-medium text-white transition-colors hover:bg-white/5">
            Browse Finds →
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/guides/how-to-buy-reps-kakobuy" className="text-accent hover:underline">Detailed KakoBuy guide →</Link>
        <Link href="/kakobuy-spreadsheet" className="text-accent hover:underline">KakoBuy spreadsheet →</Link>
        <Link href="/best-weidian-sellers" className="text-accent hover:underline">Best Weidian sellers →</Link>
        <Link href="/guides/sizing-guide" className="text-accent hover:underline">Sizing guide →</Link>
      </div>
    </div>
  );
}
