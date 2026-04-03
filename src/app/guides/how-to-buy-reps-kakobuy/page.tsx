import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Buy Reps Using KakoBuy — Step by Step Guide | MurmReps",
  description:
    "Complete beginner guide to buying replica clothing and shoes using KakoBuy. Step-by-step tutorial with screenshots. Updated 2026.",
};

function StepCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-l-2 border-accent pl-5 mb-6">
      <div className="rounded-xl bg-[#141414] p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
            {step}
          </span>
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        <div className="text-sm text-[#d4d4d8]">{children}</div>
      </div>
    </div>
  );
}

function TipCard({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-[#141414] p-5">
      <p className="mb-1 font-semibold text-white">
        {emoji} {title}
      </p>
      <p className="text-sm text-[#d4d4d8]">{children}</p>
    </div>
  );
}

function FaqCard({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-[#141414] p-5">
      <p className="mb-2 font-semibold text-white">{question}</p>
      <p className="text-sm text-[#d4d4d8]">{children}</p>
    </div>
  );
}

const tocItems = [
  { id: "what-is-kakobuy", label: "1. What is KakoBuy?" },
  { id: "create-account", label: "2. Create your KakoBuy account" },
  { id: "find-products", label: "3. Find products on MurmReps" },
  { id: "add-to-cart", label: "4. Add to cart & pay" },
  { id: "qc-photos", label: "5. Review QC photos" },
  { id: "ship", label: "6. Ship your haul" },
  { id: "tips", label: "7. Pro tips for your first haul" },
  { id: "faq", label: "8. FAQ" },
];

export default function KakoBuyGuidePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/guides" className="transition-colors hover:text-accent">
          Guides
        </Link>
        <span>/</span>
        <span className="text-[#d4d4d8]">How to Buy Reps Using KakoBuy</span>
      </nav>

      {/* Title */}
      <h1 className="font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
        How to Buy Reps Using KakoBuy
      </h1>
      <p className="mt-4 text-lg text-text-secondary">
        The complete beginner&apos;s guide to buying your first haul. Updated
        March 2026.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-muted">
        <span>8 min read</span>
        <span>·</span>
        <span>By Murm</span>
        <span>·</span>
        <span>Last updated: March 2026</span>
      </div>

      {/* KakoBuy CTA banner */}
      <div className="mt-8 rounded-xl border border-accent/30 bg-gradient-to-r from-accent/20 to-accent/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-white">
              Ready to start? Sign up to KakoBuy
            </p>
            <p className="text-sm text-text-secondary">
              Best for beginners. Free QC photos. Easy returns.
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

      {/* Table of Contents */}
      <div className="mt-10 rounded-xl bg-[#141414] p-6">
        <h2 className="mb-3 text-lg font-bold text-white">In this guide</h2>
        <ol className="space-y-2 text-sm">
          {tocItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="text-text-secondary transition-colors hover:text-accent"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </div>

      {/* ===== Section 1: What is KakoBuy ===== */}
      <section id="what-is-kakobuy" className="mt-12 mb-12">
        <h2 className="mb-4 text-2xl font-bold text-white">
          1. What is KakoBuy?
        </h2>
        <p className="mb-4 leading-relaxed text-[#d4d4d8]">
          KakoBuy is a{" "}
          <strong className="text-white">shopping agent</strong> — a middleman
          service that buys products from Chinese marketplaces (like Weidian and
          Taobao) on your behalf and ships them to you internationally.
        </p>
        <p className="mb-4 leading-relaxed text-[#d4d4d8]">
          You can&apos;t buy directly from most Chinese sellers because they
          don&apos;t ship overseas. That&apos;s where KakoBuy comes in. You
          paste a product link, they buy it, take QC (quality check) photos for
          you, and then ship everything together in one package.
        </p>
        <div className="rounded-xl bg-[#141414] p-5">
          <p className="mb-2 font-semibold text-white">
            Why we recommend KakoBuy:
          </p>
          <ul className="space-y-2 text-sm text-[#d4d4d8]">
            {[
              "Cleanest interface — easiest to use for beginners",
              "Free QC photos within 24 hours",
              "Free returns if quality doesn't match",
              "Best customer service in the rep community",
              "Competitive shipping rates worldwide",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-accent">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== Section 2: Create Account ===== */}
      <section id="create-account" className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-white">
          2. Create your KakoBuy account
        </h2>
        <StepCard step={1} title="Go to KakoBuy">
          <p className="mb-3">
            Click the link below to open KakoBuy. Using our link supports
            MurmReps at no extra cost to you.
          </p>
          <a
            href="https://ikako.vip/r/6gkjt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
          >
            Open KakoBuy →
          </a>
        </StepCard>
        <StepCard step={2} title="Sign up with email or Google">
          Click &quot;Register&quot; in the top right. You can use your email or
          sign in with Google. No phone number needed.
        </StepCard>
        <StepCard step={3} title="Top up your balance">
          Go to &quot;My Account&quot; → &quot;Top Up&quot;. Add funds using
          PayPal, credit card, or Wise. Start with $50-100 for your first haul.
          You only pay for what you buy.
        </StepCard>
      </section>

      {/* ===== Section 3: Find Products ===== */}
      <section id="find-products" className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-white">
          3. Find products on MurmReps
        </h2>
        <p className="mb-4 leading-relaxed text-[#d4d4d8]">
          This is where MurmReps makes everything easy. Instead of browsing
          sketchy Chinese websites yourself, we&apos;ve curated 15,000+
          verified finds for you.
        </p>
        <StepCard step={1} title="Browse MurmReps">
          <p>
            Go to{" "}
            <Link href="/products" className="text-accent hover:underline">
              murmreps.com/products
            </Link>{" "}
            and search or filter by category. Every product has photos, prices,
            and view counts so you know what&apos;s popular.
          </p>
        </StepCard>
        <StepCard step={2} title="Click a product you like">
          Open any product page. You&apos;ll see the price, photos, and buttons
          for all 8 shopping agents.
        </StepCard>
        <StepCard step={3} title='Click "KakoBuy"'>
          Hit the KakoBuy button. This opens the product directly on
          KakoBuy&apos;s website — already loaded with all the product details.
        </StepCard>
      </section>

      {/* ===== Section 4: Add to Cart ===== */}
      <section id="add-to-cart" className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-white">
          4. Add to cart & pay
        </h2>
        <p className="mb-4 leading-relaxed text-[#d4d4d8]">
          On KakoBuy, select your size and color, then click &quot;Add to
          cart&quot; or &quot;Buy now&quot;. KakoBuy will purchase the item from
          the Chinese seller using your topped-up balance.
        </p>
        <TipCard emoji="💡" title="Pro tip: Build a haul">
          Don&apos;t ship items one by one — that&apos;s expensive. Add 5-10
          items to your cart, pay for all of them, and ship everything together.
          You&apos;ll save 50-70% on shipping.
        </TipCard>
      </section>

      {/* ===== Section 5: QC Photos ===== */}
      <section id="qc-photos" className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-white">
          5. Review QC photos
        </h2>
        <p className="mb-4 leading-relaxed text-[#d4d4d8]">
          After KakoBuy buys your items, they arrive at their warehouse in China
          (usually 2-5 days). KakoBuy then takes detailed photos of each item
          and sends them to you.
        </p>
        <p className="mb-4 leading-relaxed text-[#d4d4d8]">
          This is your chance to check the quality before shipping. Look for:
        </p>
        <ul className="mb-4 space-y-2 text-[#d4d4d8]">
          {[
            "Correct color and pattern",
            "Logo placement and stitching",
            "Materials look right",
            "No obvious defects or stains",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-accent">·</span> {item}
            </li>
          ))}
        </ul>
        <TipCard emoji="↩️" title="Not happy? Return it for free">
          If the QC photos don&apos;t look right, you can return the item to the
          seller for free through KakoBuy. No questions asked.
        </TipCard>
      </section>

      {/* ===== Section 6: Ship ===== */}
      <section id="ship" className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-white">
          6. Ship your haul
        </h2>
        <p className="mb-4 leading-relaxed text-[#d4d4d8]">
          Once all your items are in the warehouse and you&apos;ve approved the
          QC photos, it&apos;s time to ship.
        </p>
        <StepCard step={1} title="Select items to ship">
          Go to &quot;My Warehouse&quot; and select the items you want to ship
          together.
        </StepCard>
        <StepCard step={2} title="Choose shipping line">
          KakoBuy offers multiple shipping options. Budget lines (10-25 days) are
          cheapest. Express lines (7-15 days) cost more but arrive faster. Pick
          based on your patience vs budget.
        </StepCard>
        <StepCard step={3} title="Enter your address & pay shipping">
          Add your delivery address, pay the shipping fee, and you&apos;re done.
          KakoBuy gives you a tracking number so you can follow your package.
        </StepCard>

        <div className="mt-2 rounded-xl bg-[#141414] p-5">
          <p className="mb-2 font-semibold text-white">
            📦 Typical shipping costs
          </p>
          <div className="overflow-x-auto">
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)] text-text-muted">
                  <th className="py-2 text-left">Haul size</th>
                  <th className="py-2 text-left">Budget line</th>
                  <th className="py-2 text-left">Express line</th>
                </tr>
              </thead>
              <tbody className="text-[#d4d4d8]">
                <tr className="border-b border-[rgba(255,255,255,0.04)]">
                  <td className="py-2">2-3 items (~1kg)</td>
                  <td className="py-2">$15-25</td>
                  <td className="py-2">$25-40</td>
                </tr>
                <tr className="border-b border-[rgba(255,255,255,0.04)]">
                  <td className="py-2">5-8 items (~3kg)</td>
                  <td className="py-2">$30-50</td>
                  <td className="py-2">$50-80</td>
                </tr>
                <tr>
                  <td className="py-2">10+ items (~5kg)</td>
                  <td className="py-2">$45-70</td>
                  <td className="py-2">$70-120</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== Section 7: Pro Tips ===== */}
      <section id="tips" className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-white">
          7. Pro tips for your first haul
        </h2>
        <div className="space-y-4">
          <TipCard emoji="🎯" title="Start small">
            Your first haul should be 3-5 items. Learn the process before going
            big.
          </TipCard>
          <TipCard emoji="📏" title="Size up">
            Chinese sizing runs small. Go 1-2 sizes up from your normal size.
            Check size charts on each product page.
          </TipCard>
          <TipCard emoji="💰" title="Use MurmReps to compare">
            Every product on MurmReps shows the price across all 8 agents.
            KakoBuy usually has the best combo of price + service.
          </TipCard>
          <TipCard emoji="📸" title="Always check QC">
            Never skip QC photos. It&apos;s free and takes 1 minute. Better to
            return a bad item than pay to ship it.
          </TipCard>
          <TipCard emoji="🔗" title="Use the link converter">
            Found a product somewhere else? Paste it into MurmReps&apos;{" "}
            <Link href="/converter" className="text-accent hover:underline">
              link converter tool
            </Link>{" "}
            to get the KakoBuy link instantly.
          </TipCard>
        </div>
      </section>

      {/* ===== Section 8: FAQ ===== */}
      <section id="faq" className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-white">
          8. Frequently asked questions
        </h2>
        <div className="space-y-4">
          <FaqCard question="Is it safe to buy reps?">
            Yes. Millions of people buy reps through agents every year. With QC
            photos and free returns, you&apos;re protected from bad purchases.
            The only risk is customs, which is rare with proper shipping.
          </FaqCard>
          <FaqCard question="How long does the whole process take?">
            From ordering to delivery: 2-5 days for items to reach the
            warehouse, 1-2 days for QC photos, and 7-25 days for shipping.
            Total: 2-4 weeks depending on your shipping line.
          </FaqCard>
          <FaqCard question="What if I get the wrong size?">
            You can return items from the warehouse for free before shipping.
            Once shipped, returns are harder. That&apos;s why sizing up and
            checking size charts matters.
          </FaqCard>
          <FaqCard question="Why use MurmReps instead of browsing Weidian/Taobao directly?">
            MurmReps curates 15,000+ finds so you don&apos;t have to navigate
            Chinese websites. Every product has been sourced from trusted
            sellers, with view counts and likes from the community. Plus, our
            link converter generates agent links instantly.
          </FaqCard>
          <FaqCard question="Will my package get seized by customs?">
            Very unlikely. KakoBuy and other agents know how to declare packages
            properly. If you&apos;re in the EU, triangle shipping (through a
            European warehouse) virtually eliminates customs risk.
          </FaqCard>
        </div>
      </section>

      {/* Final CTA */}
      <div className="mb-12 rounded-xl bg-gradient-to-r from-[#FE4205] to-[#c2410c] p-8 text-center">
        <h2 className="text-2xl font-bold text-white">
          Ready to start your first haul?
        </h2>
        <p className="mt-2 text-white/80">
          Join 2,300+ repfam members already using MurmReps + KakoBuy.
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
            href="/products"
            className="rounded-lg border border-white/20 bg-white/10 px-8 py-3 font-semibold text-white transition-colors hover:bg-white/20"
          >
            Browse products
          </Link>
        </div>
      </div>

      {/* Related Guides */}
      <div className="border-t border-[rgba(255,255,255,0.08)] pt-8">
        <h3 className="mb-4 text-lg font-bold text-white">See also</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/guides/agent-comparison"
            className="rounded-xl bg-[#141414] p-5 transition-colors hover:bg-[#1a1a1a]"
          >
            <p className="mb-1 font-semibold text-white">
              Agent Comparison Guide
            </p>
            <p className="text-sm text-text-muted">
              Compare all 8 agents side by side
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
          <Link
            href="/guides"
            className="rounded-xl bg-[#141414] p-5 transition-colors hover:bg-[#1a1a1a]"
          >
            <p className="mb-1 font-semibold text-white">View all guides</p>
            <p className="text-sm text-text-muted">
              Everything you need to know
            </p>
          </Link>
        </div>
      </div>
    </article>
  );
}
