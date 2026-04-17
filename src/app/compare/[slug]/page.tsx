import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface AgentData {
  name: string;
  shipping: string;
  price: string;
  service: string;
  payments: string;
  beginner: string;
  qcSpeed: string;
  returns: string;
  verdict: string;
  referral: string;
  pros: string[];
  cons: string[];
  description: string;
}

const AGENTS: Record<string, AgentData> = {
  kakobuy: {
    name: "KakoBuy",
    shipping: "Fast (7-15 days)",
    price: "Competitive",
    service: "Excellent",
    payments: "PayPal, Card, Wise",
    beginner: "★★★★★",
    qcSpeed: "12-24 hours",
    returns: "Free returns",
    verdict: "Best overall, especially for beginners",
    referral: "https://ikako.vip/r/6gkjt",
    pros: ["Fastest QC photos in the industry (12-24 hours)", "Free returns on most items", "Clean, modern interface that's easy to navigate", "Competitive shipping rates across all lines", "Excellent English-speaking customer support", "Accepts PayPal, credit cards, and Wise"],
    cons: ["Newer agent compared to Superbuy", "Slightly higher service fee on some items"],
    description: "KakoBuy has quickly become the most popular shopping agent for buying reps. Their standout feature is speed — QC photos typically arrive within 12-24 hours, and their interface is the cleanest in the business. Free returns, competitive pricing, and excellent customer support make them the default choice for most buyers in 2026.",
  },
  superbuy: {
    name: "Superbuy",
    shipping: "Good (10-20 days)",
    price: "Average",
    service: "Good",
    payments: "PayPal, Card",
    beginner: "★★★★☆",
    qcSpeed: "24-48 hours",
    returns: "Paid returns",
    verdict: "Established and reliable",
    referral: "https://www.superbuy.com/en/page/login?partnercode=Eg87dv&type=register",
    pros: ["Most established agent, operating since 2012", "Large warehouse network for reliability", "Good shipping line selection", "Strong track record with customs"],
    cons: ["Higher service fees than competitors", "Slower QC photos (24-48 hours)", "Interface feels dated compared to KakoBuy", "Returns are not free"],
    description: "Superbuy is the OG shopping agent — they've been around since 2012 and have built a reputation for reliability. While they're no longer the cheapest or fastest option, their experience and infrastructure mean fewer surprises. A solid choice for buyers who value stability over cutting-edge features.",
  },
  cnfans: {
    name: "CnFans",
    shipping: "Budget (12-25 days)",
    price: "Cheapest shipping",
    service: "Average",
    payments: "PayPal, Card",
    beginner: "★★★☆☆",
    qcSpeed: "24-48 hours",
    returns: "Paid returns",
    verdict: "Best for budget shipping",
    referral: "https://cnfans.com/register?ref=17439797",
    pros: ["Cheapest shipping rates available", "Good for heavy hauls where shipping cost matters most", "Multiple budget shipping lines", "Low service fees"],
    cons: ["Slower shipping times overall", "QC photo quality can be inconsistent", "Customer support response times vary", "Interface is functional but basic"],
    description: "CnFans positions itself as the budget-friendly agent. If your priority is minimizing shipping costs — especially on heavy hauls — CnFans delivers. Their shipping rates undercut most competitors, though you trade off some speed and polish for those savings.",
  },
  mulebuy: {
    name: "MuleBuy",
    shipping: "Good EU routes",
    price: "Competitive",
    service: "Good",
    payments: "PayPal, Card, Wise",
    beginner: "★★★★☆",
    qcSpeed: "24-36 hours",
    returns: "Free returns (some items)",
    verdict: "Best for European buyers",
    referral: "https://mulebuy.com/register?ref=201054809",
    pros: ["Excellent European shipping lines", "Competitive pricing for EU destinations", "Clean interface with good UX", "Wise payment option for lower fees"],
    cons: ["Smaller agent, less established", "Fewer shipping options outside Europe", "Warehouse capacity can be limited during peak"],
    description: "MuleBuy has carved out a niche as the go-to agent for European buyers. Their EU-specific shipping lines offer better rates and faster delivery times to Europe than most competitors. If you're based in the EU, MuleBuy should be on your shortlist.",
  },
  acbuy: {
    name: "ACBuy",
    shipping: "Average",
    price: "Good value",
    service: "Average",
    payments: "PayPal, Card",
    beginner: "★★★☆☆",
    qcSpeed: "24-48 hours",
    returns: "Paid returns",
    verdict: "Solid mid-range option",
    referral: "https://www.acbuy.com/login?loginStatus=register&code=RJLAUE",
    pros: ["Good balance of price and service", "Decent shipping line selection", "Straightforward ordering process", "Low service fees"],
    cons: ["Nothing exceptional — average across the board", "Slower QC photos than KakoBuy", "Customer support can be slow during peak times", "Returns are not free"],
    description: "ACBuy is a dependable mid-range agent that does everything adequately without excelling in any particular area. Their pricing is fair, shipping is reliable, and the interface works. If you're looking for a no-frills agent that gets the job done, ACBuy fits the bill.",
  },
  oopbuy: {
    name: "OopBuy",
    shipping: "Good (10-18 days)",
    price: "Competitive",
    service: "Good",
    payments: "PayPal, Card",
    beginner: "★★★★☆",
    qcSpeed: "24-36 hours",
    returns: "Free returns (limited)",
    verdict: "Rising newcomer with good features",
    referral: "",
    pros: ["Modern interface and good mobile experience", "Competitive pricing on popular shipping lines", "Growing quickly with active development", "Good QC photo quality"],
    cons: ["Newest agent, less proven track record", "Smaller community for support", "Limited shipping line options compared to established agents", "Some features still in development"],
    description: "OopBuy is one of the newer agents making waves in the rep community. They've launched with a modern interface, competitive pricing, and a focus on user experience. While they lack the track record of established agents, their rapid growth and active feature development make them worth watching.",
  },
  lovegobuy: {
    name: "LoveGoBuy",
    shipping: "Average",
    price: "Competitive",
    service: "Good",
    payments: "PayPal, Card",
    beginner: "★★★☆☆",
    qcSpeed: "24-48 hours",
    returns: "Paid returns",
    verdict: "Good selection of shipping lines",
    referral: "https://www.lovegobuy.com/?invite_code=5C3H94",
    pros: ["Wide selection of shipping lines", "Competitive pricing", "Active community presence", "Regular promotions and coupons"],
    cons: ["Interface could be more polished", "QC photos sometimes lack detail", "Customer support hours limited"],
    description: "LoveGoBuy offers a solid range of shipping lines and competitive pricing. They're particularly strong on promotions and community engagement, regularly offering coupons and discounts through their social channels.",
  },
  joyagoo: {
    name: "JoyaGoo",
    shipping: "Average",
    price: "Average",
    service: "Average",
    payments: "PayPal, Card",
    beginner: "★★★☆☆",
    qcSpeed: "24-48 hours",
    returns: "Paid returns",
    verdict: "Functional option for experienced buyers",
    referral: "https://joyagoo.com/register?ref=300914828",
    pros: ["Decent pricing structure", "Multiple payment options", "Straightforward ordering process"],
    cons: ["Less polished interface", "Average shipping speeds", "Smaller community for troubleshooting", "Limited English support at times"],
    description: "JoyaGoo is a functional agent that handles the basics well. While it lacks the polish and feature set of top-tier agents, experienced buyers who know what they're doing may find it adequate for their needs.",
  },
  sugargoo: {
    name: "SugarGoo",
    shipping: "Good",
    price: "Competitive",
    service: "Good community",
    payments: "PayPal, Card",
    beginner: "★★★★☆",
    qcSpeed: "24-36 hours",
    returns: "Free returns (limited)",
    verdict: "Strong community support",
    referral: "https://sugargoo.com",
    pros: ["Active and helpful community on Reddit/Discord", "Competitive shipping rates", "Good QC photo quality", "Regular feature updates"],
    cons: ["Interface can be confusing for beginners", "Some shipping lines are slow", "Occasional delays during peak seasons"],
    description: "SugarGoo has built one of the strongest communities in the rep space. Their subreddit and Discord are packed with helpful users, making it easy to get advice and troubleshoot issues. Pricing is competitive and QC quality is consistently good.",
  },
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
  const title = `${AGENTS[a].name} vs ${AGENTS[b].name} 2026 — Which Agent is Better? | MurmReps`;
  const desc = `Detailed comparison of ${AGENTS[a].name} vs ${AGENTS[b].name} for buying reps in 2026. Compare shipping speed, pricing, QC photos, returns, customer service, and more.`;
  return {
    title,
    description: desc,
    openGraph: { title, description: desc },
    alternates: { canonical: `/compare/${slug}` },
  };
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
    { label: "QC Photo Speed", a: a.qcSpeed, b: b.qcSpeed },
    { label: "Returns Policy", a: a.returns, b: b.returns },
    { label: "Payment Methods", a: a.payments, b: b.payments },
    { label: "Beginner Friendly", a: a.beginner, b: b.beginner },
  ];

  const otherComparisons = AGENT_KEYS
    .filter((k) => k !== aKey && k !== bKey && k !== "kakobuy")
    .slice(0, 4)
    .map((k) => ({ slug: `kakobuy-vs-${k}`, label: `KakoBuy vs ${AGENTS[k].name}` }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${a.name} vs ${b.name} — Which Agent is Better in 2026?`,
            author: { "@type": "Organization", name: "MurmReps" },
            publisher: { "@type": "Organization", name: "MurmReps" },
          }),
        }}
      />

      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/guides/agent-comparison" className="hover:text-accent transition-colors">Agent Comparison</Link>
        <span className="mx-2">/</span>
        <span className="text-[#d4d4d8]">{a.name} vs {b.name}</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
        {a.name} vs {b.name}
      </h1>
      <p className="mt-2 text-lg text-text-secondary">
        Which shopping agent is better for buying reps in 2026? Here&apos;s our detailed comparison.
      </p>

      {/* Introduction */}
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-text-secondary">
        <p>
          Choosing between {a.name} and {b.name} comes down to what matters most to you — speed, price,
          ease of use, or specific features. We&apos;ve used both agents extensively and compared them across
          every metric that matters: shipping speed, pricing, QC photo quality, return policies, customer
          service, and overall user experience.
        </p>
        <p>
          Both agents let you buy from Weidian, Taobao, and 1688 sellers — the difference is in how smooth
          the process is and how much you&apos;ll pay along the way.
        </p>
      </div>

      {/* Comparison table */}
      <h2 className="mt-10 font-heading text-2xl font-bold text-white">Side-by-Side Comparison</h2>
      <div className="mt-4 overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#141414]">
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase" />
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

      {/* Agent descriptions */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-subtle bg-surface p-6">
          <h2 className="font-heading text-xl font-bold text-white">{a.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{a.description}</p>
          <h3 className="mt-5 text-sm font-semibold text-green-400">Pros</h3>
          <ul className="mt-2 space-y-1.5">
            {a.pros.map((p) => (
              <li key={p} className="flex gap-2 text-sm text-text-secondary">
                <span className="shrink-0 text-green-400">✓</span>{p}
              </li>
            ))}
          </ul>
          <h3 className="mt-5 text-sm font-semibold text-red-400">Cons</h3>
          <ul className="mt-2 space-y-1.5">
            {a.cons.map((c) => (
              <li key={c} className="flex gap-2 text-sm text-text-secondary">
                <span className="shrink-0 text-red-400">✗</span>{c}
              </li>
            ))}
          </ul>
          {a.referral && (
            <a href={a.referral} target="_blank" rel="noopener noreferrer"
              className="mt-5 inline-block rounded-btn bg-accent px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
              Try {a.name} →
            </a>
          )}
        </div>

        <div className="rounded-xl border border-subtle bg-surface p-6">
          <h2 className="font-heading text-xl font-bold text-white">{b.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{b.description}</p>
          <h3 className="mt-5 text-sm font-semibold text-green-400">Pros</h3>
          <ul className="mt-2 space-y-1.5">
            {b.pros.map((p) => (
              <li key={p} className="flex gap-2 text-sm text-text-secondary">
                <span className="shrink-0 text-green-400">✓</span>{p}
              </li>
            ))}
          </ul>
          <h3 className="mt-5 text-sm font-semibold text-red-400">Cons</h3>
          <ul className="mt-2 space-y-1.5">
            {b.cons.map((c) => (
              <li key={c} className="flex gap-2 text-sm text-text-secondary">
                <span className="shrink-0 text-red-400">✗</span>{c}
              </li>
            ))}
          </ul>
          {b.referral && (
            <a href={b.referral} target="_blank" rel="noopener noreferrer"
              className="mt-5 inline-block rounded-btn border border-subtle bg-void px-5 py-2 text-sm font-semibold text-white transition-colors hover:border-accent hover:text-accent">
              Try {b.name} →
            </a>
          )}
        </div>
      </div>

      {/* Detailed breakdown */}
      <h2 className="mt-10 font-heading text-2xl font-bold text-white">Detailed Breakdown</h2>
      <div className="mt-4 space-y-6 text-sm leading-relaxed text-text-secondary">
        <div>
          <h3 className="font-semibold text-white">Shipping Speed &amp; Options</h3>
          <p className="mt-2">
            {a.name} offers {a.shipping.toLowerCase()} shipping while {b.name} provides {b.shipping.toLowerCase()} options.
            Both support popular lines like EMS, DHL, and FedEx. The actual delivery time depends more on your
            destination country and the shipping line you choose than the agent itself — but agents with better
            carrier relationships tend to get packages processed faster.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-white">QC Photos</h3>
          <p className="mt-2">
            {a.name} typically delivers QC photos in {a.qcSpeed}, compared to {b.qcSpeed} for {b.name}.
            Faster QC means you can build and ship your haul quicker. Both agents provide standard QC sets
            (multiple angles, close-ups of key details), but {a.name}&apos;s speed gives it an edge for
            impatient buyers.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-white">Returns Policy</h3>
          <p className="mt-2">
            {a.name}&apos;s policy: {a.returns}. {b.name}&apos;s policy: {b.returns}. Free returns are a significant
            advantage — they let you order confidently knowing you can return items that don&apos;t meet
            expectations without losing money on domestic shipping fees.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-white">Customer Service</h3>
          <p className="mt-2">
            {a.name} rates {a.service.toLowerCase()} for customer service while {b.name} rates {b.service.toLowerCase()}.
            When things go wrong — missing items, seller disputes, customs issues — responsive customer support
            makes all the difference. Both agents offer live chat and ticket systems.
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-10 rounded-xl bg-[#141414] border border-[rgba(255,255,255,0.06)] p-6">
        <h2 className="text-lg font-bold text-white">Our Recommendation</h2>
        <p className="mt-3 text-sm text-text-secondary leading-relaxed">
          For most buyers, we recommend <strong className="text-white">KakoBuy</strong>. It has the cleanest
          interface, fastest QC photos, free returns, and excellent customer service. Whether you&apos;re
          building your first haul or your twentieth, KakoBuy makes the process smooth and reliable.
        </p>
        {aKey === "kakobuy" && (
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            {b.name} is a solid alternative{bKey === "superbuy" ? " with a longer track record" : bKey === "cnfans" ? " if budget shipping is your top priority" : bKey === "mulebuy" ? " especially for European buyers" : ""}.
            But for the best overall experience, KakoBuy wins.
          </p>
        )}
        {aKey !== "kakobuy" && (
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            Between {a.name} and {b.name} specifically, {a.name} has a slight edge with {a.verdict.toLowerCase()}.
            But if you haven&apos;t committed to either yet, KakoBuy is worth trying first.
          </p>
        )}
        <a href="https://ikako.vip/r/6gkjt" target="_blank" rel="noopener noreferrer"
          className="mt-4 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(254,66,5,0.3)]">
          Try KakoBuy →
        </a>
      </div>

      {/* Related comparisons */}
      <h2 className="mt-10 font-heading text-xl font-bold text-white">More Comparisons</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {otherComparisons.map((c) => (
          <Link key={c.slug} href={`/compare/${c.slug}`}
            className="rounded-xl bg-[#141414] border border-[rgba(255,255,255,0.06)] p-4 hover:bg-[#1a1a1a] transition-colors">
            <p className="text-sm font-semibold text-white">{c.label}</p>
            <p className="text-xs text-text-muted">Detailed comparison →</p>
          </Link>
        ))}
      </div>

      {/* Internal links */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/guides/agent-comparison" className="rounded-xl bg-[#141414] border border-[rgba(255,255,255,0.06)] p-4 flex-1 hover:bg-[#1a1a1a] transition-colors">
          <p className="text-sm font-semibold text-white">Full Agent Comparison</p>
          <p className="text-xs text-text-muted">Compare all 8 agents side by side</p>
        </Link>
        <Link href="/how-to-buy-reps" className="rounded-xl bg-[#141414] border border-[rgba(255,255,255,0.06)] p-4 flex-1 hover:bg-[#1a1a1a] transition-colors">
          <p className="text-sm font-semibold text-white">How to Buy Reps</p>
          <p className="text-xs text-text-muted">Complete beginner guide</p>
        </Link>
      </div>
    </div>
  );
}
