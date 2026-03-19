"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import Script from "next/script";

const agentCards = [
  {
    name: "KakoBuy",
    recommended: true,
    description: "Best app, great for beginners, fast QC photos",
    url: "https://ikako.vip/r/6gkjt",
  },
  {
    name: "Superbuy",
    recommended: false,
    description: "Largest user base, 4.7\u2605 Trustpilot, very reliable",
    url: "https://www.superbuy.com/en/page/login?partnercode=Eg87dv&type=register",
  },
  {
    name: "CnFans",
    recommended: false,
    description: "Huge community, 13K+ reviews, good prices",
    url: "https://cnfans.com/register?ref=17439797",
  },
  {
    name: "MuleBuy",
    recommended: false,
    description: "Fast growing, 4.7\u2605, competitive shipping",
    url: "https://mulebuy.com/register?ref=201054809",
  },
  {
    name: "ACBuy",
    recommended: false,
    description: "Popular on Reddit, 4.6\u2605, clean interface",
    url: "https://www.acbuy.com/login?loginStatus=register&code=RJLAUE",
  },
  {
    name: "LoveGoBuy",
    recommended: false,
    description: "Best shipping prices, budget-friendly",
    url: "https://www.lovegobuy.com/?invite_code=5C3H94",
  },
  {
    name: "JoyaGoo",
    recommended: false,
    description: "Good for budget hauls, growing fast",
    url: "https://joyagoo.com/register?ref=300914828",
  },
  {
    name: "SugarGoo",
    recommended: false,
    description: "Solid all-rounder, good for first haul",
    url: "https://sugargoo.com",
  },
];

const flowSteps = [
  "You",
  "Agent",
  "Chinese Seller",
  "Warehouse",
  "Your Door",
];

interface Step {
  title: string;
  content: React.ReactNode;
}

function Tip({ text }: { text: string }) {
  return (
    <div className="mt-4 flex items-start gap-3 rounded-card border border-accent/30 bg-accent/5 p-4">
      <svg
        className="mt-0.5 h-4 w-4 shrink-0 text-accent"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      <p className="text-sm text-text-secondary">{text}</p>
    </div>
  );
}

function buildSteps(): Step[] {
  return [
    {
      title: "What is an agent?",
      content: (
        <>
          <p className="text-text-secondary leading-relaxed">
            An agent is a middleman service that buys products from Chinese
            marketplaces (Taobao, Weidian, 1688) on your behalf, takes quality
            check photos, and ships them to you internationally. You can&apos;t
            buy directly from these sites outside China &mdash; agents make it
            possible.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {flowSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <span className="rounded-pill bg-surface px-4 py-2 text-sm font-medium text-white">
                  {step}
                </span>
                {i < flowSteps.length - 1 && (
                  <svg
                    className="h-4 w-4 shrink-0 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
          <Tip text="Think of an agent like a personal shopper in China. They handle everything — buying, quality checking, and shipping." />
        </>
      ),
    },
    {
      title: "Pick an agent",
      content: (
        <>
          <p className="mb-6 text-text-secondary">
            Sign up for one (or more) of these agents. We recommend KakoBuy for
            beginners.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {agentCards.map((agent) => (
              <div
                key={agent.name}
                className={`rounded-card border bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 ${
                  agent.recommended
                    ? "border-accent"
                    : "border-[rgba(255,255,255,0.06)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-sm font-semibold text-white">
                    {agent.name}
                  </h3>
                  {agent.recommended && (
                    <span className="rounded-pill bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  {agent.description}
                </p>
                <a
                  href={agent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-3 inline-flex items-center rounded-btn px-4 py-1.5 text-xs font-semibold text-white transition-all duration-200 ${
                    agent.recommended
                      ? "bg-accent hover:shadow-[0_0_20px_rgba(254,66,5,0.15)]"
                      : "bg-[rgba(255,255,255,0.06)] hover:bg-accent"
                  }`}
                >
                  Sign up
                </a>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      title: "Find a product",
      content: (
        <>
          <p className="text-text-secondary leading-relaxed">
            Products are listed on Chinese marketplaces: <strong className="text-white">Taobao</strong>,{" "}
            <strong className="text-white">Weidian</strong>, and{" "}
            <strong className="text-white">1688</strong>. Browse our curated
            collection or find links on Reddit communities like r/FashionReps.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-btn bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(254,66,5,0.15)]"
            >
              Browse products
            </Link>
            <Link
              href="/converter"
              className="inline-flex items-center gap-2 rounded-btn border border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-accent/30"
            >
              Link converter
            </Link>
          </div>
          <Tip text="Use our link converter to quickly turn any Taobao/Weidian link into agent buy links." />
        </>
      ),
    },
    {
      title: "Copy the link",
      content: (
        <>
          <p className="text-text-secondary leading-relaxed">
            Found something you like? Copy the full product URL from the
            marketplace. On Weidian, tap the share button and copy the link. On
            Taobao, copy from the browser address bar.
          </p>
          <div className="mt-6 rounded-card border border-subtle bg-void p-4">
            <p className="break-all font-mono text-xs text-text-muted">
              https://weidian.com/item.html?itemID=7637305464
            </p>
          </div>
          <Tip text="The link should contain an item ID number. If it's a search results page, click into the specific product first." />
        </>
      ),
    },
    {
      title: "Paste in your agent",
      content: (
        <>
          <p className="text-text-secondary leading-relaxed">
            Go to your agent&apos;s website and find the search bar (usually at
            the top). Paste the full product URL and hit enter. The agent will
            load the product details including price, available sizes, and
            colors.
          </p>
          <Tip text="Check the price in \u00A5 (yuan). \u00A5100 \u2248 $14 \u2248 \u20AC13. Most agents show converted prices automatically." />
        </>
      ),
    },
    {
      title: "Add to cart & select size",
      content: (
        <>
          <p className="text-text-secondary leading-relaxed">
            Select your size and color, then add the item to your cart. For
            shoes, Chinese sizes are usually EU sizes. For clothing, always
            check the size chart &mdash; Chinese sizing runs smaller than
            Western brands.
          </p>
          <Tip text="Measure a piece of clothing that fits you well and compare to the seller's size chart. Don't just go by S/M/L." />
          <Tip text="Add a note for the agent if you need specific details like 'size EU 44' or 'color: black'." />
        </>
      ),
    },
    {
      title: "Place your order",
      content: (
        <>
          <p className="text-text-secondary leading-relaxed">
            Once your cart is ready, checkout and pay the agent. They&apos;ll
            place the order with the Chinese seller on your behalf. Most agents
            accept PayPal, credit cards, and other international payment
            methods.
          </p>
          <Tip text="You're paying the agent, not the seller directly. The agent handles all communication with the seller in Chinese." />
        </>
      ),
    },
    {
      title: "Wait for QC photos",
      content: (
        <>
          <p className="text-text-secondary leading-relaxed">
            Your items will arrive at the agent&apos;s warehouse in China,
            usually within <strong className="text-white">3&ndash;7 days</strong>. The agent takes
            detailed QC (quality check) photos and uploads them to your account.
          </p>
          <p className="mt-4 text-text-secondary leading-relaxed">
            Review the photos carefully. If something looks wrong:
          </p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-verified">GL</span>
              <span className="text-text-secondary">
                = Green Light (looks good, keep it)
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-danger">RL</span>
              <span className="text-text-secondary">
                = Red Light (flawed, return/exchange it)
              </span>
            </div>
          </div>
          <Tip text="Most agents offer free returns to the seller if the item doesn't match the listing. Check stitching, logos, tags, and shape." />
          <div className="mt-4">
            <Link
              href="/qc"
              className="inline-flex items-center gap-2 rounded-btn border border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-accent/30"
            >
              QC Photo Checker
            </Link>
          </div>
        </>
      ),
    },
    {
      title: "Ship internationally",
      content: (
        <>
          <p className="text-text-secondary leading-relaxed">
            Once all items in your warehouse are GL&apos;d, submit a parcel for
            international shipping. You&apos;ll choose a shipping line and
            declare a customs value.
          </p>
          <Tip text="Pick a shipping line based on speed vs cost. Budget lines (SAL, China Post) take 15\u201330 days. Fast lines (EMS, FedEx) take 7\u201315 days." />
          <Tip text="Declare a value under $12\u201315 for most countries to avoid customs duties." />
          <Tip text="Remove shoe boxes and unnecessary packaging to save weight \u2014 you pay by weight!" />
        </>
      ),
    },
    {
      title: "Track your parcel",
      content: (
        <>
          <p className="text-text-secondary leading-relaxed">
            After shipping, you&apos;ll receive a tracking number. Use it to
            follow your package. Expect{" "}
            <strong className="text-white">7&ndash;30 days</strong> depending on
            your shipping line and destination.
          </p>
          <div className="mt-6">
            <Link
              href="/tracking"
              className="inline-flex items-center gap-2 rounded-btn bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(254,66,5,0.15)]"
            >
              Track your parcel
            </Link>
          </div>
          <Tip text="Don't panic if tracking doesn't update for a few days \u2014 that's normal, especially when the parcel is in transit between countries." />
        </>
      ),
    },
    {
      title: "You made it!",
      content: (
        <>
          <p className="text-lg font-medium text-white">
            Congrats on your first haul!
          </p>
          <p className="mt-3 text-text-secondary leading-relaxed">
            You&apos;ve successfully ordered reps from China. Share your haul
            with the community and help others get started.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://instagram.com/murmreps"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-btn border border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-accent/30"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              @murmreps on IG
            </a>
            <a
              href="https://discord.gg/8r5EFMRg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-btn border border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-accent/30"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
              </svg>
              Join our Discord
            </a>
          </div>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-btn bg-accent px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(254,66,5,0.15)]"
            >
              Browse more products &rarr;
            </Link>
          </div>
        </>
      ),
    },
  ];
}

export default function GuidePage() {
  const [current, setCurrent] = useState(0);
  const [confettiFired, setConfettiFired] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const steps = buildSteps();
  const total = steps.length;
  const progress = ((current + 1) / total) * 100;

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < total) {
        setCurrent(index);
        contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [total]
  );

  // Fire confetti on last step
  useEffect(() => {
    if (current === total - 1 && !confettiFired) {
      setConfettiFired(true);
      const timer = setTimeout(() => {
        const confetti = (window as unknown as Record<string, unknown>)
          .confetti as
          | ((opts: Record<string, unknown>) => void)
          | undefined;
        if (confetti) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#FE4205", "#ffffff", "#1DB954", "#F59E0B"],
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [current, total, confettiFired]);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"
        strategy="lazyOnload"
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-right text-[11px] font-medium text-text-muted">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Mobile step dots */}
        <div className="mb-6 flex items-center justify-center gap-1.5 md:hidden">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-200 ${
                i === current
                  ? "w-6 bg-accent"
                  : i < current
                    ? "w-2 bg-accent/40"
                    : "w-2 bg-surface"
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden w-56 shrink-0 md:block">
            <nav className="sticky top-24 space-y-1">
              {steps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`flex w-full items-center gap-3 rounded-btn px-3 py-2 text-left text-sm transition-all duration-200 ${
                    i === current
                      ? "bg-accent/10 font-semibold text-accent"
                      : i < current
                        ? "text-text-secondary hover:text-white"
                        : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      i === current
                        ? "bg-accent text-white"
                        : i < current
                          ? "bg-accent/20 text-accent"
                          : "bg-surface text-text-muted"
                    }`}
                  >
                    {i < current ? (
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="truncate">{step.title}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            <div ref={contentRef} className="overflow-hidden">
              <div className="mb-2">
                <span className="font-heading text-[48px] font-extrabold leading-none text-accent">
                  {String(current + 1).padStart(2, "0")}
                </span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-white">
                {steps[current].title}
              </h2>
              <div className="mt-6">{steps[current].content}</div>
            </div>

            {/* Bottom nav */}
            <div className="mt-10 flex items-center justify-between border-t border-subtle pt-6">
              <button
                onClick={() => goTo(current - 1)}
                disabled={current === 0}
                className={`flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  current === 0
                    ? "cursor-not-allowed text-text-muted"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
                Previous
              </button>

              <span className="text-xs font-medium text-text-muted">
                Step {current + 1} of {total}
              </span>

              <button
                onClick={() => goTo(current + 1)}
                disabled={current === total - 1}
                className={`flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  current === total - 1
                    ? "cursor-not-allowed text-text-muted"
                    : "bg-accent text-white hover:shadow-[0_0_20px_rgba(254,66,5,0.15)]"
                }`}
              >
                Next
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
