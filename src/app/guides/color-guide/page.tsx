"use client";
import { useState } from "react";
import Link from "next/link";

const colors = [
  { name: "Black", hex: "#1a1a1a", pairs: [{ n: "White", h: "#F5F5F5" }, { n: "Grey", h: "#808080" }, { n: "Cream", h: "#F5F5DC" }, { n: "Red", h: "#8B0000" }, { n: "Navy", h: "#1B3A5C" }, { n: "Olive", h: "#556B2F" }], tonal: [{ n: "Charcoal", h: "#333" }, { n: "Dark Grey", h: "#555" }, { n: "Jet", h: "#0a0a0a" }], tip: "The safest base. Goes with everything. Mix textures (leather, cotton, knit) to avoid looking flat.", avoid: "All-black without texture variation looks flat." },
  { name: "White", hex: "#F5F5F5", pairs: [{ n: "Black", h: "#1a1a1a" }, { n: "Navy", h: "#1B3A5C" }, { n: "Camel", h: "#C4A882" }, { n: "Grey", h: "#808080" }, { n: "Light Blue", h: "#ADD8E6" }, { n: "Olive", h: "#556B2F" }], tonal: [{ n: "Cream", h: "#FFFDD0" }, { n: "Ivory", h: "#FFFFF0" }, { n: "Off-White", h: "#FAF0E6" }], tip: "All-white tonal outfits are huge in 2026. Mix cream, ivory, and pure white.", avoid: "Can wash out very pale skin tones." },
  { name: "Navy", hex: "#1B3A5C", pairs: [{ n: "White", h: "#F5F5F5" }, { n: "Cream", h: "#F5F5DC" }, { n: "Camel", h: "#C4A882" }, { n: "Grey", h: "#808080" }, { n: "Pink", h: "#E8518D" }, { n: "Burgundy", h: "#800020" }], tonal: [{ n: "Light Blue", h: "#6699CC" }, { n: "Navy", h: "#1B3A5C" }, { n: "Dark Navy", h: "#0a1929" }], tip: "Best alternative to black. Navy + camel = old money energy.", avoid: "Navy + black together — too close, looks like a mistake." },
  { name: "Grey", hex: "#808080", pairs: [{ n: "Black", h: "#1a1a1a" }, { n: "White", h: "#F5F5F5" }, { n: "Navy", h: "#1B3A5C" }, { n: "Pink", h: "#E8518D" }, { n: "Burgundy", h: "#800020" }, { n: "Yellow", h: "#DAA520" }], tonal: [{ n: "Light Grey", h: "#D3D3D3" }, { n: "Medium", h: "#808080" }, { n: "Charcoal", h: "#333" }], tip: "Ultimate neutral. A pop of color (red cap, blue shoes) makes grey outfits alive.", avoid: "Head-to-toe medium grey looks washed out. Vary shades." },
  { name: "Beige", hex: "#C4A882", pairs: [{ n: "Navy", h: "#1B3A5C" }, { n: "Brown", h: "#8B4513" }, { n: "White", h: "#F5F5F5" }, { n: "Olive", h: "#556B2F" }, { n: "Black", h: "#1a1a1a" }, { n: "Burgundy", h: "#800020" }], tonal: [{ n: "Cream", h: "#FFFDD0" }, { n: "Sand", h: "#C2B280" }, { n: "Camel", h: "#C19A6B" }], tip: "2026 power move. Earth tones dominate. Full beige tonal = peak old money.", avoid: "Too much beige without contrast looks bland." },
  { name: "Brown", hex: "#8B4513", pairs: [{ n: "Cream", h: "#F5F5DC" }, { n: "Navy", h: "#1B3A5C" }, { n: "White", h: "#F5F5F5" }, { n: "Olive", h: "#556B2F" }, { n: "Rust", h: "#B7410E" }, { n: "Black", h: "#1a1a1a" }], tonal: [{ n: "Tan", h: "#D2B48C" }, { n: "Brown", h: "#8B4513" }, { n: "Chocolate", h: "#3E2723" }], tip: "Brown + cream is the easiest luxury combo. Brown shoes/belt anchors any neutral outfit.", avoid: "Brown + black works in streetwear if intentional." },
  { name: "Olive", hex: "#556B2F", pairs: [{ n: "Black", h: "#1a1a1a" }, { n: "Cream", h: "#F5F5DC" }, { n: "Brown", h: "#8B4513" }, { n: "White", h: "#F5F5F5" }, { n: "Grey", h: "#808080" }, { n: "Rust", h: "#B7410E" }], tonal: [{ n: "Sage", h: "#9CAF88" }, { n: "Olive", h: "#556B2F" }, { n: "Forest", h: "#228B22" }], tip: "Military essential. Olive cargo + black tee + white sneakers = 2026 go-to.", avoid: "Olive + bright green reads costume." },
  { name: "Burgundy", hex: "#800020", pairs: [{ n: "Black", h: "#1a1a1a" }, { n: "Navy", h: "#1B3A5C" }, { n: "Grey", h: "#808080" }, { n: "White", h: "#F5F5F5" }, { n: "Cream", h: "#F5F5DC" }, { n: "Camel", h: "#C4A882" }], tonal: [{ n: "Rose", h: "#BC8F8F" }, { n: "Burgundy", h: "#800020" }, { n: "Wine", h: "#4A0000" }], tip: "Statement neutral. Burgundy hoodie + black pants + white shoes is fire. One burgundy piece max.", avoid: "Burgundy + red — too close, looks unintentional." },
  { name: "Pink", hex: "#E8518D", pairs: [{ n: "Black", h: "#1a1a1a" }, { n: "Navy", h: "#1B3A5C" }, { n: "White", h: "#F5F5F5" }, { n: "Grey", h: "#808080" }, { n: "Olive", h: "#556B2F" }, { n: "Cream", h: "#F5F5DC" }], tonal: [{ n: "Blush", h: "#FFB6C1" }, { n: "Dusty", h: "#D4899E" }, { n: "Hot Pink", h: "#FF69B4" }], tip: "Dusty pink is huge in 2026 for all genders. Pink + black is safest. Pink + navy is underrated.", avoid: "Multiple bright pinks — one piece keeps it confident." },
  { name: "Orange", hex: "#CC5500", pairs: [{ n: "Black", h: "#1a1a1a" }, { n: "Navy", h: "#1B3A5C" }, { n: "Cream", h: "#F5F5DC" }, { n: "Olive", h: "#556B2F" }, { n: "White", h: "#F5F5F5" }, { n: "Brown", h: "#8B4513" }], tonal: [{ n: "Peach", h: "#FFDAB9" }, { n: "Rust", h: "#B7410E" }, { n: "Burnt", h: "#CC5500" }], tip: "Best as accent — orange beanie, rust jacket, orange sneakers. Rust is an earth tone essential.", avoid: "Orange as full outfit is overwhelming. One piece max." },
];

const formulas = [
  { name: "The Failsafe", colors: ["#1a1a1a", "#F5F5F5", "#808080"], desc: "Black + White + Grey. Can't mess this up." },
  { name: "Old Money", colors: ["#FFFDD0", "#C4A882", "#8B4513"], desc: "Cream + Beige + Brown. Quiet luxury." },
  { name: "Streetwear Core", colors: ["#1a1a1a", "#808080", "#8B0000"], desc: "Black + Grey + One Pop Color." },
  { name: "Earth Tones", colors: ["#556B2F", "#8B4513", "#F5F5DC"], desc: "Olive + Brown + Cream. 2026's dominant palette." },
  { name: "Monochrome", colors: ["#D3D3D3", "#808080", "#333333"], desc: "One color family, different shades and textures." },
  { name: "Navy Anchor", colors: ["#1B3A5C", "#F5F5F5", "#C4A882"], desc: "Navy + White + Camel. Timeless." },
  { name: "Dark Aesthetic", colors: ["#1a1a1a", "#0a0a0a", "#C0C0C0"], desc: "All Black + Silver/Chrome accessories." },
  { name: "Summer Clean", colors: ["#F5F5F5", "#ADD8E6", "#F5F5DC"], desc: "White + Light Blue + Beige. Effortless warm weather." },
];

const rules = [
  { title: "3 Colors Max", text: "Limit your outfit to 3 colors. More looks chaotic. Less looks boring. Three is the sweet spot." },
  { title: "Warm vs Cool", text: "Warm colors (brown, beige, rust, olive, cream) go together. Cool colors (navy, grey, black, white, blue) go together. Mixing works with one crossover piece." },
  { title: "Match Your Metals", text: "Silver jewelry with cool tones (black, navy, grey). Gold with warm tones (cream, brown, beige). Don't mix metals." },
  { title: "Shoes Anchor Everything", text: "Match shoes to one of your 3 outfit colors, or go neutral (black, white, grey)." },
  { title: "One Statement Piece", text: "Bold graphic top = neutral bottom. Loud shoes = quiet everything else." },
  { title: "Contrast Top & Bottom", text: "Dark bottom + light top (or vice versa). Avoid same darkness head to toe unless intentional monochrome." },
  { title: "Proportions Rule Colors", text: "Oversized hoodie + slim pants = balanced. Match silhouette game to color game." },
];

function Swatch({ hex, name, size = "md" }: { hex: string; name?: string; size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const isDark = hex.toLowerCase().replace("#", "").match(/^[0-3]/);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${s} rounded-full border-2 ${isDark ? "border-white/30" : "border-white/10"}`} style={{ background: hex }} />
      {name && <span className="text-[10px] text-text-muted">{name}</span>}
    </div>
  );
}

export default function ColorGuidePage() {
  const [openRule, setOpenRule] = useState<number | null>(null);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/guides" className="hover:text-accent transition-colors">Guides</Link>
        <span className="mx-2">/</span><span className="text-[#d4d4d8]">Color Coordination</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">Color Coordination Guide</h1>
      <p className="mt-3 text-lg text-text-secondary">Stop guessing. Match colors like a stylist.</p>
      <p className="mt-1 text-sm text-text-muted">5 min read · Updated 2026</p>

      {/* Color Matching Table */}
      <h2 className="mt-12 mb-6 text-2xl font-bold text-white">Color Pairings</h2>
      <div className="space-y-6">
        {colors.map((c) => (
          <div key={c.name} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-12 w-12 rounded-full border border-white/10 shrink-0" style={{ background: c.hex }} />
              <h3 className="text-lg font-bold text-white">{c.name}</h3>
            </div>
            <div className="mb-3">
              <p className="text-xs text-text-muted mb-2">Pairs well with:</p>
              <div className="flex flex-wrap gap-3">{c.pairs.map((p) => <Swatch key={p.n} hex={p.h} name={p.n} />)}</div>
            </div>
            <div className="mb-3">
              <p className="text-xs text-text-muted mb-2">Tonal range:</p>
              <div className="flex gap-3">{c.tonal.map((t) => <Swatch key={t.n} hex={t.h} name={t.n} size="sm" />)}</div>
            </div>
            <p className="text-sm text-text-secondary">{c.tip}</p>
            <p className="mt-1 text-xs text-red-400/70">Avoid: {c.avoid}</p>
          </div>
        ))}
      </div>

      {/* Outfit Color Formulas */}
      <h2 className="mt-12 mb-6 text-2xl font-bold text-white">Outfit Color Formulas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {formulas.map((f) => (
          <div key={f.name} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
            <div className="flex gap-2 mb-3">{f.colors.map((h, i) => <div key={i} className="h-8 w-8 rounded-full border border-white/10" style={{ background: h }} />)}</div>
            <h3 className="text-sm font-bold text-white">{f.name}</h3>
            <p className="mt-1 text-xs text-text-secondary">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Rules */}
      <h2 className="mt-12 mb-4 text-2xl font-bold text-white">The Rules</h2>
      <div className="space-y-2">
        {rules.map((r, i) => (
          <div key={i} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] overflow-hidden">
            <button onClick={() => setOpenRule(openRule === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left">
              <span className="text-sm font-semibold text-white">{r.title}</span>
              <svg className={`h-4 w-4 text-accent transition-transform ${openRule === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
            {openRule === i && <p className="px-4 pb-4 text-sm text-text-secondary">{r.text}</p>}
          </div>
        ))}
      </div>

      {/* Shop by Color */}
      <h2 className="mt-12 mb-4 text-2xl font-bold text-white">Shop by Color</h2>
      <div className="flex flex-wrap gap-2">
        {["Black", "White", "Navy", "Grey", "Beige", "Brown", "Olive", "Burgundy", "Pink"].map((c) => (
          <Link key={c} href={`/products?q=${c.toLowerCase()}`} className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2 text-sm text-text-secondary hover:text-white hover:border-accent/30 transition-colors">
            Shop {c} →
          </Link>
        ))}
      </div>

      {/* Seasonal */}
      <h2 className="mt-12 mb-4 text-2xl font-bold text-white">2026 Seasonal Palettes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
          <h3 className="text-sm font-bold text-white mb-3">☀️ Spring/Summer</h3>
          <div className="flex flex-wrap gap-2">{["#F5F5F5", "#FFFDD0", "#ADD8E6", "#9CAF88", "#D4899E", "#C4A882", "#B19CD9"].map((h) => <div key={h} className="h-6 w-6 rounded-full border border-white/10" style={{ background: h }} />)}</div>
          <p className="mt-2 text-xs text-text-muted">White, cream, light blue, sage, dusty pink, beige, lavender</p>
        </div>
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
          <h3 className="text-sm font-bold text-white mb-3">❄️ Fall/Winter</h3>
          <div className="flex flex-wrap gap-2">{["#800020", "#556B2F", "#B7410E", "#333333", "#1B3A5C", "#3E2723", "#C19A6B"].map((h) => <div key={h} className="h-6 w-6 rounded-full border border-white/10" style={{ background: h }} />)}</div>
          <p className="mt-2 text-xs text-text-muted">Burgundy, olive, rust, charcoal, navy, chocolate, camel</p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-xl bg-gradient-to-r from-[#FE4205] to-[#c2410c] p-8 text-center">
        <h2 className="text-xl font-bold text-white">Ready to build an outfit?</h2>
        <p className="mt-2 text-white/80">Browse 15,000+ products and match your colors.</p>
        <Link href="/products" className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-bold text-[#FE4205]">Browse products →</Link>
      </div>
    </article>
  );
}
