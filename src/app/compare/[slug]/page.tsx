import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const AGENTS: Record<string, { name: string; shipping: string; price: string; service: string; payments: string; beginner: string; verdict: string }> = {
  kakobuy: { name: "KakoBuy", shipping: "Fast (7-15 days)", price: "Competitive", service: "Excellent", payments: "PayPal, Card, Wise", beginner: "★★★★★", verdict: "Best overall, especially for beginners" },
  superbuy: { name: "Superbuy", shipping: "Good (10-20 days)", price: "Average", service: "Good", payments: "PayPal, Card", beginner: "★★★★☆", verdict: "Established and reliable" },
  cnfans: { name: "CnFans", shipping: "Budget (12-25 days)", price: "Cheapest shipping", service: "Average", payments: "PayPal, Card", beginner: "★★★☆☆", verdict: "Best for budget shipping" },
  mulebuy: { name: "MuleBuy", shipping: "Good EU routes", price: "Competitive", service: "Good", payments: "PayPal, Card, Wise", beginner: "★★★★☆", verdict: "Best for European buyers" },
  acbuy: { name: "ACBuy", shipping: "Average", price: "Good value", service: "Average", payments: "PayPal, Card", beginner: "★★★☆☆", verdict: "Solid mid-range option" },
  lovegobuy: { name: "LoveGoBuy", shipping: "Average", price: "Competitive", service: "Good", payments: "PayPal, Card", beginner: "★★★☆☆", verdict: "Good selection of shipping lines" },
  joyagoo: { name: "JoyaGoo", shipping: "Average", price: "Average", service: "Average", payments: "PayPal, Card", beginner: "★★★☆☆", verdict: "Good for new users" },
  sugargoo: { name: "SugarGoo", shipping: "Good", price: "Competitive", service: "Good community", payments: "PayPal, Card", beginner: "★★★★☆", verdict: "Strong community support" },
};

const AGENT_KEYS = Object.keys(AGENTS);

function parseSlug(slug: string): [string, string] | null {
  const match = slug.match(/^(.+)-vs-(.+)$/);
  if (!match) return null;
  const [, a, b] = match;
  if (AGENTS[a] && AGENTS[b] && a !== b) return [a, b];
  return null;
}

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pair = parseSlug(slug);
  if (!pair) return { title: "Not Found" };
  const [a, b] = pair;
  const title = `${AGENTS[a].name} vs ${AGENTS[b].name} 2026 — Comparison & Review | MurmReps`;
  const desc = `Compare ${AGENTS[a].name} and ${AGENTS[b].name} for buying reps. See shipping speed, pricing, customer service, and which is better for beginners.`;
  return { title, description: desc, openGraph: { title, description: desc } };
}

export function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (let i = 0; i < AGENT_KEYS.length; i++) {
    for (let j = i + 1; j < AGENT_KEYS.length; j++) {
      params.push({ slug: `${AGENT_KEYS[i]}-vs-${AGENT_KEYS[j]}` });
    }
  }
  return params;
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const pair = parseSlug(slug);
  if (!pair) notFound();
  const [aKey, bKey] = pair;
  const a = AGENTS[aKey];
  const b = AGENTS[bKey];

  const rows = [
    { label: "Shipping Speed", a: a.shipping, b: b.shipping },
    { label: "Pricing", a: a.price, b: b.price },
    { label: "Customer Service", a: a.service, b: b.service },
    { label: "Payment Methods", a: a.payments, b: b.payments },
    { label: "Beginner Friendly", a: a.beginner, b: b.beginner },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/guides/agent-comparison" className="hover:text-accent transition-colors">Agent Comparison</Link>
        <span className="mx-2">/</span>
        <span className="text-[#d4d4d8]">{a.name} vs {b.name}</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold text-white mb-2">
        {a.name} vs {b.name}
      </h1>
      <p className="text-text-secondary mb-8">
        Updated 2026. Which shopping agent is better for buying reps?
      </p>

      {/* Comparison table */}
      <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)] mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#141414]">
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase"></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-accent uppercase">{a.name}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">{b.name}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-[rgba(255,255,255,0.04)]">
                <td className="px-4 py-3 text-text-muted font-medium">{row.label}</td>
                <td className="px-4 py-3 text-white">{row.a}</td>
                <td className="px-4 py-3 text-[#d4d4d8]">{row.b}</td>
              </tr>
            ))}
            <tr className="border-t border-[rgba(255,255,255,0.04)] bg-[#141414]">
              <td className="px-4 py-3 text-text-muted font-medium">Verdict</td>
              <td className="px-4 py-3 text-accent font-semibold">{a.verdict}</td>
              <td className="px-4 py-3 text-[#d4d4d8]">{b.verdict}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-xl bg-[#141414] border border-[rgba(255,255,255,0.06)] p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-3">Our recommendation</h2>
        <p className="text-sm text-text-secondary leading-relaxed mb-4">
          For most buyers, we recommend <strong className="text-white">KakoBuy</strong>. It has the cleanest interface,
          fastest QC photos, free returns, and excellent customer service. Whether you&apos;re building your first haul
          or your twentieth, KakoBuy makes the process smooth.
        </p>
        <a href="https://ikako.vip/r/6gkjt" target="_blank" rel="noopener noreferrer"
          className="inline-block rounded-lg bg-accent px-6 py-3 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(254,66,5,0.3)]">
          Try KakoBuy →
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/guides/agent-comparison" className="rounded-xl bg-[#141414] border border-[rgba(255,255,255,0.06)] p-4 flex-1 hover:bg-[#1a1a1a] transition-colors">
          <p className="text-sm font-semibold text-white">Full Agent Comparison</p>
          <p className="text-xs text-text-muted">Compare all 8 agents side by side</p>
        </Link>
        <Link href="/guides/how-to-buy-reps-kakobuy" className="rounded-xl bg-[#141414] border border-[rgba(255,255,255,0.06)] p-4 flex-1 hover:bg-[#1a1a1a] transition-colors">
          <p className="text-sm font-semibold text-white">How to Buy Guide</p>
          <p className="text-xs text-text-muted">Step-by-step beginner tutorial</p>
        </Link>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: `${a.name} vs ${b.name} — Comparison & Review 2026`,
        author: { "@type": "Organization", name: "MurmReps" },
        publisher: { "@type": "Organization", name: "MurmReps" },
      }) }} />
    </div>
  );
}
