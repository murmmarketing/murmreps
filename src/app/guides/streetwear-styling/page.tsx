import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Style Streetwear in 2026 — Outfit Guide",
  description: "Complete streetwear styling guide. 6 outfit formulas, layering system, shoe pairing guide, accessory tips, and common mistakes to avoid.",
};

const formulas = [
  { name: "Classic Streetwear", items: ["Fitted crew-neck tee (white or black)", "Oversized hoodie (grey, navy, or forest green)", "Straight-leg jeans (medium or dark wash)", "Retro runners (NB 550, Samba, Cortez)"], note: "Fitted tee visible at neckline creates contrast with oversized hoodie." },
  { name: "All Black Monochrome", items: ["Black oversized tee or hoodie", "Black straight/slim pants", "Black sneakers (AF1, Dunk Low)", "Silver chain + silver ring"], note: "Mix textures: cotton, nylon, denim. Texture prevents flat monochrome." },
  { name: "Earth Tone Workwear", items: ["Cream/beige tee", "Olive cargo pants or brown Carhartt", "Brown boots or NB 990", "Brown belt + beanie"], note: "2026 earth tone palette. Feels expensive without trying." },
  { name: "Old Money Casual", items: ["Polo or cashmere crewneck", "Tailored chinos or clean jeans", "Clean white sneakers", "Simple watch + leather belt"], note: "Less is more. Quality basics, perfect fit, zero logos." },
  { name: "Hypebeast Statement", items: ["Bold graphic hoodie (Chrome Hearts, Supreme)", "Simple black pants", "Statement sneakers (Jordan 4, Yeezy)", "One accessory (cap or chain)"], note: "Let the hoodie and shoes talk. Everything else quiet." },
  { name: "Summer Minimal", items: ["Oversized solid tee (white, grey, pastel)", "Tailored shorts (above knee)", "Clean slides or low-tops", "Sunglasses + simple watch"], note: "Shorts should be tailored, not basketball length." },
];

const mistakes = [
  "All oversized everything → sloppy, not streetwear",
  "Multiple brand logos visible → looks tryhard",
  "Exact color matching (same blue shirt + blue pants) → uniform",
  "Ignoring proportions → top and bottom should contrast in fit",
  "Too many accessories → pick 2-3 max",
  "Graphics AND bold colors AND statement shoes → pick ONE hero",
];

export default function StreetwearStylingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Style Streetwear in 2026",
    description: "Complete streetwear styling guide with outfit formulas, layering, and tips.",
    step: [
      { "@type": "HowToStep", name: "Pick a formula", text: "Choose from 6 proven outfit formulas." },
      { "@type": "HowToStep", name: "Layer properly", text: "Use the base-mid-outer layering system." },
      { "@type": "HowToStep", name: "Pair shoes", text: "Match sneakers to your outfit style." },
      { "@type": "HowToStep", name: "Add accessories", text: "One or two accessories complete the look." },
    ],
  };
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/guides" className="hover:text-accent transition-colors">Guides</Link>
        <span className="mx-2">/</span><span className="text-[#d4d4d8]">Streetwear Styling</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">How to Style Streetwear in 2026</h1>
      <p className="mt-3 text-lg text-text-secondary">From beginner basics to advanced outfit building.</p>
      <p className="mt-1 text-sm text-text-muted">8 min read · Updated 2026</p>

      {/* 5 Rules */}
      <h2 className="mt-12 mb-4 text-2xl font-bold text-white">The 5 Streetwear Rules</h2>
      <div className="space-y-4">
        {[
          { n: "1", title: "One Loud Piece Per Outfit", text: "Pick your hero: graphic hoodie, bold sneakers, or statement jacket. Everything else stays neutral. Multiple loud pieces compete and cancel each other." },
          { n: "2", title: "Balance Proportions", text: "Oversized top → slim/straight bottom. Fitted top → wider bottom. Never oversized everywhere (sloppy) or fitted everywhere (not streetwear)." },
          { n: "3", title: "Sneakers Make or Break It", text: "Chunky shoes (Jordan 4, AF1, NB 990) → straight/tapered pants. Slim shoes (Samba, Dunk Low) → relaxed/wide-leg pants." },
          { n: "4", title: "One Logo at a Time", text: "Don't stack Supreme + Nike + Gucci + Chrome Hearts. Feature ONE brand, keep the rest plain. Not a brand buffet." },
          { n: "5", title: "Neutral Base, Color Accent", text: "Build on black, white, grey, or navy. Add one color piece. Easiest way to look put-together." },
        ].map((r) => (
          <div key={r.n} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">{r.n}</span>
              <h3 className="font-semibold text-white">{r.title}</h3>
            </div>
            <p className="text-sm text-text-secondary">{r.text}</p>
          </div>
        ))}
      </div>

      {/* 6 Formulas */}
      <h2 className="mt-12 mb-4 text-2xl font-bold text-white">6 Outfit Formulas</h2>
      <div className="space-y-4">
        {formulas.map((f) => (
          <div key={f.name} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
            <h3 className="text-lg font-bold text-white mb-3">{f.name}</h3>
            <ul className="space-y-1.5 mb-3">
              {f.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-accent mt-0.5">·</span>{item}
                </li>
              ))}
            </ul>
            <p className="text-xs text-text-muted italic">{f.note}</p>
          </div>
        ))}
      </div>

      {/* Layering */}
      <h2 className="mt-12 mb-4 text-2xl font-bold text-white">3-Layer System</h2>
      <div className="space-y-3">
        {[
          { layer: "Base", desc: "Fitted tee or tank — visible at neckline and hem", color: "#FE4205" },
          { layer: "Character", desc: "Hoodie, flannel, knit vest — the identity piece", color: "#f97316" },
          { layer: "Frame", desc: "Jacket, bomber, denim jacket — leave open to show layers", color: "#fb923c" },
        ].map((l) => (
          <div key={l.layer} className="rounded-xl bg-[#141414] p-5" style={{ borderLeft: `4px solid ${l.color}` }}>
            <h3 className="text-sm font-bold text-white">{l.layer} Layer</h3>
            <p className="mt-1 text-sm text-text-secondary">{l.desc}</p>
          </div>
        ))}
        <p className="text-xs text-text-muted">Rule: Vary textures (cotton base, fleece mid, nylon outer). One oversized layer max.</p>
      </div>

      {/* Shoe Guide */}
      <h2 className="mt-12 mb-4 text-2xl font-bold text-white">Shoe Pairing Guide</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { shoes: "Chunky (Jordan 4, AF1, NB 990)", pants: "Straight or tapered pants" },
          { shoes: "Slim (Samba, Cortez, Dunk Low)", pants: "Relaxed or wide-leg pants" },
          { shoes: "Boots (Combat, Chelsea)", pants: "Slim or straight pants" },
          { shoes: "Slides / Sandals", pants: "Shorts or relaxed pants only" },
        ].map((s) => (
          <div key={s.shoes} className="rounded-xl bg-[#141414] border border-[rgba(255,255,255,0.06)] p-4">
            <p className="text-sm font-semibold text-white">{s.shoes}</p>
            <p className="text-xs text-text-muted mt-1">→ {s.pants}</p>
          </div>
        ))}
      </div>

      {/* Accessories */}
      <h2 className="mt-12 mb-4 text-2xl font-bold text-white">Accessories Guide</h2>
      <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
        <div className="space-y-3 text-sm text-text-secondary">
          <p><strong className="text-white">Chain:</strong> Silver with cool outfits, gold with warm. One chain is enough.</p>
          <p><strong className="text-white">Cap/Beanie:</strong> Match to one outfit color. The finishing touch.</p>
          <p><strong className="text-white">Belt:</strong> Match to shoe color (brown + brown, black + black).</p>
          <p><strong className="text-white">Watch:</strong> Simple face. Matches your metal (silver or gold).</p>
          <p><strong className="text-white">Sunglasses:</strong> Black frames safest. Tortoise for earth tones.</p>
          <p><strong className="text-white">Rings:</strong> Match chain metal. 2-3 accessories total max.</p>
        </div>
      </div>

      {/* Mistakes */}
      <h2 className="mt-12 mb-4 text-2xl font-bold text-white">Common Mistakes</h2>
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
        <ul className="space-y-2">{mistakes.map((m) => <li key={m} className="flex items-start gap-2 text-sm text-text-secondary"><span className="text-red-400">✗</span>{m}</li>)}</ul>
      </div>

      {/* CTA */}
      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/products" className="rounded-lg bg-accent px-6 py-3 text-sm font-bold text-white hover:shadow-[0_0_20px_rgba(254,66,5,0.3)] transition-all">Browse products →</Link>
        <Link href="/guides/color-guide" className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-6 py-3 text-sm text-text-secondary hover:text-white transition-colors">Color guide →</Link>
        <Link href="/guides/sizing-guide" className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-6 py-3 text-sm text-text-secondary hover:text-white transition-colors">Sizing guide →</Link>
      </div>
    </article>
  );
}
