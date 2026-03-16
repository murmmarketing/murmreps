import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Rep Agents 2026 \u2014 Compare KakoBuy, Superbuy, CnFans & More | MurmReps",
  description:
    "Compare the top 8 rep agents side by side. Ratings, shipping costs, and features for KakoBuy, Superbuy, CnFans, MuleBuy, ACBuy and more.",
  openGraph: {
    title: "Best Rep Agents 2026 \u2014 Compare KakoBuy, Superbuy, CnFans & More | MurmReps",
    description:
      "Compare the top 8 rep agents side by side. Ratings, shipping costs, and features.",
    url: "/agents",
  },
  twitter: {
    title: "Best Rep Agents 2026 \u2014 Compare KakoBuy, Superbuy, CnFans & More | MurmReps",
    description:
      "Compare the top 8 rep agents side by side. Ratings, shipping costs, and features.",
  },
  alternates: { canonical: "/agents" },
};

const agents = [
  {
    name: "KakoBuy",
    trustpilot: "4.5\u2605",
    bestFor: "Beginners",
    shipping: "Fast",
    pros: "Great app, easy to use, fast QC",
    url: "https://ikako.vip/r/6gkjt",
    pick: true,
  },
  {
    name: "Superbuy",
    trustpilot: "4.7\u2605",
    bestFor: "Reliability",
    shipping: "Medium",
    pros: "Largest platform, very stable",
    url: "https://www.superbuy.com/en/page/login?partnercode=Eg87dv&type=register",
    pick: false,
  },
  {
    name: "CnFans",
    trustpilot: "4.2\u2605",
    bestFor: "Community",
    shipping: "Fast",
    pros: "Huge community, 13K reviews",
    url: "https://cnfans.com/register?ref=17439797",
    pick: false,
  },
  {
    name: "MuleBuy",
    trustpilot: "4.7\u2605",
    bestFor: "Growing",
    shipping: "Fast",
    pros: "Competitive prices, modern UI",
    url: "https://mulebuy.com/register?ref=201054809",
    pick: false,
  },
  {
    name: "ACBuy",
    trustpilot: "4.6\u2605",
    bestFor: "Reddit users",
    shipping: "Medium",
    pros: "Popular on Reddit, clean UI",
    url: "https://www.acbuy.com/login?loginStatus=register&code=RJLAUE",
    pick: false,
  },
  {
    name: "LoveGoBuy",
    trustpilot: "4.3\u2605",
    bestFor: "Budget",
    shipping: "Medium",
    pros: "Cheapest shipping prices",
    url: "https://www.lovegobuy.com/?invite_code=5C3H94",
    pick: false,
  },
  {
    name: "JoyaGoo",
    trustpilot: "4.1\u2605",
    bestFor: "Budget hauls",
    shipping: "Medium",
    pros: "Good for small hauls",
    url: "https://joyagoo.com/register?ref=300914828",
    pick: false,
  },
  {
    name: "SugarGoo",
    trustpilot: "4.4\u2605",
    bestFor: "All-round",
    shipping: "Medium",
    pros: "Solid features, reliable",
    url: "https://sugargoo.com",
    pick: false,
  },
];

export default function AgentsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Hero */}
      <div className="text-center">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
          Find the best agent{" "}
          <span className="text-accent">for your haul.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
          All agents buy from the same Chinese marketplaces. The difference is in
          service, shipping prices, and features.
        </p>
      </div>

      {/* Desktop table */}
      <div className="mt-12 hidden overflow-hidden rounded-card border border-subtle lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-subtle bg-surface">
              <th className="px-5 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider text-text-muted">
                Agent
              </th>
              <th className="px-5 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider text-text-muted">
                Trustpilot
              </th>
              <th className="px-5 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider text-text-muted">
                Best for
              </th>
              <th className="px-5 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider text-text-muted">
                Shipping
              </th>
              <th className="px-5 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider text-text-muted">
                Pros
              </th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr
                key={agent.name}
                className={`border-b border-subtle last:border-b-0 ${
                  agent.pick ? "border-l-2 border-l-accent bg-accent/[0.03]" : ""
                }`}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-white">
                      {agent.name}
                    </span>
                    {agent.pick && (
                      <span className="rounded-pill bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                        \u2B50 Our pick
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-warning">{agent.trustpilot}</td>
                <td className="px-5 py-4 text-text-secondary">
                  {agent.bestFor}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-pill px-2.5 py-0.5 text-xs font-medium ${
                      agent.shipping === "Fast"
                        ? "bg-verified/10 text-verified"
                        : "bg-[rgba(255,255,255,0.06)] text-text-secondary"
                    }`}
                  >
                    {agent.shipping}
                  </span>
                </td>
                <td className="px-5 py-4 text-text-secondary">{agent.pros}</td>
                <td className="px-5 py-4">
                  <a
                    href={agent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-btn border border-accent px-4 py-1.5 text-xs font-semibold text-accent transition-all duration-200 hover:bg-accent hover:text-white"
                  >
                    Sign up
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-12 space-y-4 lg:hidden">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className={`rounded-card border bg-surface p-5 ${
              agent.pick ? "border-accent" : "border-[rgba(255,255,255,0.06)]"
            }`}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-base font-semibold text-white">
                {agent.name}
              </h3>
              {agent.pick && (
                <span className="rounded-pill bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                  \u2B50 Our pick
                </span>
              )}
              <span className="ml-auto text-sm text-warning">
                {agent.trustpilot}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
              <div>
                <span className="text-text-muted">Best for:</span>{" "}
                <span className="text-text-secondary">{agent.bestFor}</span>
              </div>
              <div>
                <span className="text-text-muted">Shipping:</span>{" "}
                <span
                  className={
                    agent.shipping === "Fast"
                      ? "text-verified"
                      : "text-text-secondary"
                  }
                >
                  {agent.shipping}
                </span>
              </div>
            </div>
            <p className="mt-2 text-sm text-text-secondary">{agent.pros}</p>
            <a
              href={agent.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center rounded-btn border border-accent px-5 py-2 text-sm font-semibold text-accent transition-all duration-200 hover:bg-accent hover:text-white"
            >
              Sign up
            </a>
          </div>
        ))}
      </div>

      {/* Recommendation card */}
      <div className="mt-16 rounded-card border border-accent bg-surface p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[12px] bg-accent">
          <span className="font-heading text-2xl font-black text-white">K</span>
        </div>
        <h2 className="font-heading text-xl font-bold text-white">
          Our recommendation
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-text-secondary">
          We recommend KakoBuy for most people. Great app, fast QC photos, and
          beginner-friendly interface.
        </p>
        <a
          href="https://ikako.vip/r/6gkjt"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-12 items-center rounded-btn bg-accent px-8 font-heading text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,107,53,0.15)]"
        >
          Sign up for KakoBuy
        </a>
      </div>

      {/* FAQ */}
      <div className="mt-16 rounded-card border border-subtle bg-surface p-6">
        <h3 className="font-heading text-lg font-semibold text-white">
          Can I use multiple agents?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Yes! Many experienced buyers use 2–3 agents to compare shipping prices
          or because certain sellers work better with certain agents.
        </p>
      </div>
    </div>
  );
}
