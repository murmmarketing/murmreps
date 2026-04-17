import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agent Comparison: Which Shopping Agent Should You Use?",
  description:
    "Compare all 8 shopping agents side by side — KakoBuy, Superbuy, CnFans, MuleBuy, ACBuy, LoveGoBuy, JoyaGoo, SugarGoo. Find the best agent for your needs.",
};

const agents = [
  {
    name: "KakoBuy",
    bestFor: "Overall best",
    speed: "Fast",
    cost: "Mid",
    qc: "Free",
    returns: "Free",
    rating: 5,
    pick: true,
  },
  {
    name: "Superbuy",
    bestFor: "Experience",
    speed: "Good",
    cost: "Mid",
    qc: "Free",
    returns: "Paid",
    rating: 4,
  },
  {
    name: "CnFans",
    bestFor: "Budget shipping",
    speed: "Slow",
    cost: "Cheapest",
    qc: "Free",
    returns: "Free",
    rating: 4,
  },
  {
    name: "MuleBuy",
    bestFor: "Europe",
    speed: "Good",
    cost: "EU rates",
    qc: "Free",
    returns: "Free",
    rating: 4,
  },
  {
    name: "ACBuy",
    bestFor: "Value",
    speed: "Mid",
    cost: "Mid",
    qc: "Free",
    returns: "Free",
    rating: 3,
  },
  {
    name: "LoveGoBuy",
    bestFor: "Selection",
    speed: "Mid",
    cost: "Mid",
    qc: "Free",
    returns: "Free",
    rating: 3,
  },
  {
    name: "JoyaGoo",
    bestFor: "New users",
    speed: "Mid",
    cost: "Mid",
    qc: "Free",
    returns: "Free",
    rating: 3,
  },
  {
    name: "SugarGoo",
    bestFor: "Community",
    speed: "Good",
    cost: "Mid",
    qc: "Free",
    returns: "Free",
    rating: 3,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <span className="text-xs tracking-wide text-accent">
      {"★".repeat(count)}
      {"☆".repeat(5 - count)}
    </span>
  );
}

export default function AgentComparisonPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/guides" className="transition-colors hover:text-accent">
          Guides
        </Link>
        <span>/</span>
        <span className="text-[#d4d4d8]">Agent Comparison</span>
      </nav>

      {/* Title */}
      <h1 className="font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
        Agent Comparison: Which Shopping Agent Should You Use?
      </h1>
      <p className="mt-4 text-lg text-text-secondary">
        A side-by-side comparison of all 8 shopping agents. Speed, cost,
        service, and which one is right for you.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-muted">
        <span>5 min read</span>
        <span>·</span>
        <span>By Murm</span>
        <span>·</span>
        <span>Last updated: March 2026</span>
      </div>

      {/* Intro */}
      <section className="mt-10 mb-10">
        <h2 className="mb-4 text-2xl font-bold text-white">
          What is a shopping agent?
        </h2>
        <p className="mb-4 leading-relaxed text-[#d4d4d8]">
          A <strong className="text-white">shopping agent</strong> is a
          middleman service that buys products from Chinese marketplaces on your
          behalf. Since most Chinese sellers (on Weidian, Taobao, 1688) don&apos;t
          ship internationally, you need an agent to buy, inspect, and ship your
          items to you.
        </p>
        <p className="leading-relaxed text-[#d4d4d8]">
          All agents work the same way: you paste a product link, they buy it,
          take quality check photos, and ship everything together. The
          differences are in <strong className="text-white">price</strong>,{" "}
          <strong className="text-white">speed</strong>,{" "}
          <strong className="text-white">customer service</strong>, and{" "}
          <strong className="text-white">shipping options</strong>.
        </p>
      </section>

      {/* Comparison Table */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-white">
          Full comparison table
        </h2>
        <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[#141414]">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Agent
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Best For
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Speed
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  QC
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Returns
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr
                  key={a.name}
                  className={`border-b border-[rgba(255,255,255,0.04)] ${
                    a.pick
                      ? "bg-accent/5"
                      : "hover:bg-[rgba(255,255,255,0.02)]"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {a.name}
                    {a.pick && (
                      <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                        #1 Pick
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#d4d4d8]">{a.bestFor}</td>
                  <td className="px-4 py-3 text-[#d4d4d8]">{a.speed}</td>
                  <td className="px-4 py-3 text-[#d4d4d8]">{a.cost}</td>
                  <td className="px-4 py-3 text-green-400">{a.qc}</td>
                  <td className="px-4 py-3 text-[#d4d4d8]">
                    {a.returns === "Free" ? (
                      <span className="text-green-400">Free</span>
                    ) : (
                      a.returns
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Stars count={a.rating} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Our Pick */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-white">
          Our pick: KakoBuy
        </h2>
        <div className="rounded-xl border border-accent/30 bg-gradient-to-r from-accent/20 to-accent/5 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <p className="text-lg font-bold text-white">KakoBuy</p>
              <Stars count={5} />
            </div>
          </div>
          <p className="mb-4 leading-relaxed text-[#d4d4d8]">
            After testing all 8 agents extensively, KakoBuy consistently comes
            out on top. Here&apos;s why:
          </p>
          <ul className="mb-6 space-y-2 text-sm text-[#d4d4d8]">
            {[
              "Cleanest, most intuitive interface — perfect for first-time buyers",
              "Free HD QC photos within 24 hours",
              "Free returns on any item, no questions asked",
              "24/7 live chat support with real humans",
              "Competitive shipping rates with multiple line options",
              "Used by 80% of the MurmReps community",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-accent">✓</span> {item}
              </li>
            ))}
          </ul>
          <a
            href="https://ikako.vip/r/6gkjt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-accent px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(254,66,5,0.3)]"
          >
            Sign up to KakoBuy →
          </a>
        </div>
      </section>

      {/* When to pick other agents */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-white">
          When to consider other agents
        </h2>
        <div className="space-y-4">
          <div className="rounded-xl bg-[#141414] p-5">
            <p className="mb-1 font-semibold text-white">
              CnFans — if shipping cost is everything
            </p>
            <p className="text-sm text-[#d4d4d8]">
              CnFans consistently has the cheapest shipping rates. If
              you&apos;re building large hauls (5kg+) and don&apos;t mind
              waiting a bit longer, the savings add up.
            </p>
          </div>
          <div className="rounded-xl bg-[#141414] p-5">
            <p className="mb-1 font-semibold text-white">
              MuleBuy — if you&apos;re in Europe
            </p>
            <p className="text-sm text-[#d4d4d8]">
              MuleBuy specializes in EU shipping routes and triangle shipping,
              which virtually eliminates customs risk for European buyers.
            </p>
          </div>
          <div className="rounded-xl bg-[#141414] p-5">
            <p className="mb-1 font-semibold text-white">
              Superbuy — if you want the most established platform
            </p>
            <p className="text-sm text-[#d4d4d8]">
              Superbuy has been around the longest and has the most polished
              platform. Good choice if you value a proven track record over
              price.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <div className="mb-12 rounded-xl bg-gradient-to-r from-[#FE4205] to-[#c2410c] p-8 text-center">
        <h2 className="text-2xl font-bold text-white">
          Ready to start buying?
        </h2>
        <p className="mt-2 text-white/80">
          Sign up to KakoBuy and browse 15,000+ finds on MurmReps.
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
            href="/guides/how-to-buy-reps-kakobuy"
            className="rounded-lg border border-white/20 bg-white/10 px-8 py-3 font-semibold text-white transition-colors hover:bg-white/20"
          >
            Read the full buying guide
          </Link>
        </div>
      </div>

      {/* Related Guides */}
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
