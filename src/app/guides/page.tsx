import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guides — Learn How to Buy Reps | MurmReps",
  description:
    "Step-by-step guides on buying reps through shopping agents. Learn how to use KakoBuy, compare agents, and build your first haul.",
};

const guides = [
  {
    title: "How to Buy Reps Using KakoBuy",
    description: "Your complete beginner guide — from sign-up to delivery",
    time: "8 min read",
    href: "/guides/how-to-buy-reps-kakobuy",
    emoji: "🛒",
    live: true,
  },
  {
    title: "Agent Comparison: Which One Should You Use?",
    description: "Compare all 8 agents side by side — pricing, speed, service",
    time: "5 min read",
    href: "/guides/agent-comparison",
    emoji: "⚖️",
    live: true,
  },
  {
    title: "How to Read QC Photos",
    description: "Spot flaws before you ship — what to look for in every QC set",
    time: "4 min read",
    href: "/guides/qc-photos",
    emoji: "📸",
    live: false,
  },
  {
    title: "Shipping Guide: Lines, Costs & Times",
    description: "Pick the right shipping method for your budget and location",
    time: "6 min read",
    href: "/guides/shipping",
    emoji: "📦",
    live: false,
  },
  {
    title: "How to Use MurmReps Link Converter",
    description: "Convert any Weidian or Taobao link to all 8 agents instantly",
    time: "2 min read",
    href: "/guides/link-converter",
    emoji: "🔗",
    live: false,
  },
];

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">
          Guides
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-text-secondary">
          Everything you need to know about buying reps. Step-by-step tutorials
          from sign-up to delivery.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {guides.map((guide) => {
          const inner = (
            <div className="group relative flex h-full flex-col rounded-xl border border-[rgba(255,255,255,0.06)] bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20">
              {/* Thumbnail area */}
              <div className="flex h-36 items-center justify-center rounded-t-xl bg-[#0e0e0e]">
                <span className="text-5xl">{guide.emoji}</span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs text-text-muted">{guide.time}</span>
                  {!guide.live && (
                    <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[10px] font-medium text-text-muted">
                      Coming soon
                    </span>
                  )}
                </div>
                <h2 className="font-heading text-lg font-bold text-white">
                  {guide.title}
                </h2>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-text-secondary">
                  {guide.description}
                </p>
                <span className="mt-4 text-sm font-medium text-accent">
                  {guide.live ? "Read guide →" : "Notify me →"}
                </span>
              </div>
            </div>
          );

          return guide.live ? (
            <Link key={guide.href} href={guide.href}>
              {inner}
            </Link>
          ) : (
            <div key={guide.href} className="cursor-default opacity-60">
              {inner}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 rounded-xl bg-gradient-to-r from-[#FE4205] to-[#c2410c] p-8 text-center">
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
    </div>
  );
}
