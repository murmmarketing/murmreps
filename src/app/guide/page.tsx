"use client";

import Link from "next/link";
import { useState } from "react";

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

const faqItems = [
  {
    q: "Is buying reps legal?",
    a: "Buying for personal use is legal in most countries. Reselling as authentic is illegal.",
  },
  {
    q: "How long does shipping take?",
    a: "7\u201330 days depending on shipping line and destination.",
  },
  {
    q: "What if the quality is bad?",
    a: "Check QC photos before shipping. Most agents allow free returns within the warehouse.",
  },
  {
    q: "How much does shipping cost?",
    a: "Roughly $5\u201315 per kg depending on shipping line and destination.",
  },
  {
    q: "Can I buy from any Chinese site?",
    a: "Most agents support Taobao, Weidian, and 1688. Some also support Tmall and JD.",
  },
];

const flowSteps = [
  "You",
  "Agent",
  "Chinese seller",
  "Agent warehouse",
  "Your doorstep",
];

export default function GuidePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Hero */}
      <section className="pb-16 text-center">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
          How to order reps{" "}
          <span className="text-accent">step by step.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
          Never bought from Taobao or Weidian before? This guide takes you from
          zero to your first haul in 15 minutes.
        </p>
      </section>

      {/* Section 1 — What is an agent? */}
      <Section number={null} title="What is an agent?">
        <p className="text-text-secondary leading-relaxed">
          An agent is a middleman service that buys products from Chinese
          marketplaces (Taobao, Weidian, 1688) on your behalf, does quality
          check photos, and ships them to you internationally. You can&apos;t buy
          directly from these sites outside China &mdash; agents make it
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
      </Section>

      {/* Section 2 — Pick an agent */}
      <Section number={1} title="Pick an agent">
        <p className="mb-6 text-text-secondary">
          Sign up for one (or more) of these agents. We recommend KakoBuy for
          beginners.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {agentCards.map((agent) => (
            <div
              key={agent.name}
              className={`rounded-card border bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(255,107,53,0.05)] ${
                agent.recommended
                  ? "border-accent"
                  : "border-[rgba(255,255,255,0.06)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base font-semibold text-white">
                  {agent.name}
                </h3>
                {agent.recommended && (
                  <span className="rounded-pill bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                    \u2B50 Recommended
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-text-secondary">
                {agent.description}
              </p>
              <a
                href={agent.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-4 inline-flex items-center rounded-btn px-5 py-2 text-sm font-semibold text-white transition-all duration-200 ${
                  agent.recommended
                    ? "bg-accent hover:shadow-[0_0_20px_rgba(255,107,53,0.15)]"
                    : "bg-[rgba(255,255,255,0.06)] hover:bg-accent"
                }`}
              >
                Sign up
              </a>
            </div>
          ))}
        </div>
      </Section>

      {/* Section 3 — Find a product */}
      <Section number={2} title="Find a product">
        <p className="mb-6 text-text-secondary">
          Products on Chinese marketplaces are listed on Taobao, Weidian, or
          1688. You can find links on our Products page, from Reddit communities
          like r/FashionReps, or by searching the marketplace directly.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <ActionCard
            title="Browse our finds"
            href="/products"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            }
          />
          <ActionCard
            title="Convert a link"
            href="/converter"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.44a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L5.25 9.503" />
              </svg>
            }
          />
          <ActionCard
            title="Search on Reddit"
            href="https://reddit.com/r/FashionReps"
            external
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            }
          />
        </div>
      </Section>

      {/* Section 4 — Paste the link */}
      <Section number={3} title="Paste the link in your agent">
        <p className="text-text-secondary leading-relaxed">
          Copy the product URL (Taobao/Weidian/1688 link) and paste it into your
          agent&apos;s search bar. The agent will show you the product details,
          price, and available sizes/colors. Select what you want and click Buy.
        </p>
        <div className="mt-6 rounded-card border border-subtle bg-void p-4">
          <p className="text-sm text-text-secondary">
            <span className="font-semibold text-accent">Tip:</span> Check the
            price in &yen; (yuan). &yen;100 &asymp; $14 &asymp; &euro;13. Most
            agents show converted prices too.
          </p>
        </div>
      </Section>

      {/* Section 5 — Pay and ship */}
      <Section number={4} title="Pay and ship">
        <p className="mb-6 text-text-secondary leading-relaxed">
          Your items arrive at the agent&apos;s warehouse in China (usually 3–7
          days). You&apos;ll get QC (quality check) photos. If something looks
          wrong, you can return it (most agents offer free returns). Once
          you&apos;re happy with everything, submit your parcel for
          international shipping.
        </p>
        <div className="space-y-3">
          <Tip text="Pick a shipping line based on speed vs cost. Budget lines take 15–30 days, fast lines take 7–15 days." />
          <Tip text="Declare a value under $12–15 for most countries to avoid customs taxes." />
          <Tip text="Remove shoe boxes to save weight (you pay by weight)." />
        </div>
      </Section>

      {/* Section 6 — Track and wait */}
      <Section number={5} title="Track and wait">
        <p className="text-text-secondary leading-relaxed">
          Once shipped, you&apos;ll get a tracking number. Use 17track.net to
          follow your package.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="https://17track.net"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-btn bg-surface px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-accent/10 hover:text-accent"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            17track.net
          </a>
        </div>
      </Section>

      {/* FAQ */}
      <section className="mt-20">
        <h2 className="font-heading text-2xl font-bold text-white">FAQ</h2>
        <div className="mt-6 space-y-2">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className="rounded-card border border-subtle bg-surface"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-white">
                  {item.q}
                </span>
                <svg
                  className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
              {openFaq === i && (
                <div className="border-t border-subtle px-5 pb-4 pt-3">
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: number | null;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 first:mt-0">
      <h2 className="font-heading text-2xl font-bold text-white">
        {number !== null && (
          <span className="text-accent">Step {number}: </span>
        )}
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-card border border-subtle bg-void p-4">
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

function ActionCard({
  title,
  href,
  icon,
  external,
}: {
  title: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}) {
  const className =
    "flex flex-col items-center gap-3 rounded-card border border-subtle bg-surface p-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-[0_0_20px_rgba(255,107,53,0.05)]";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-btn bg-accent/10 text-accent">
          {icon}
        </div>
        <span className="font-heading text-sm font-semibold text-white">
          {title}
        </span>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-btn bg-accent/10 text-accent">
        {icon}
      </div>
      <span className="font-heading text-sm font-semibold text-white">
        {title}
      </span>
    </Link>
  );
}
