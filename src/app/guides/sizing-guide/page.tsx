import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rep Sizing Guide — Get the Right Fit Every Time",
  description: "Chinese sizing guide for replica clothing and shoes. Size conversion charts, measuring tips, and what to do when your size doesn't fit.",
};

export default function SizingGuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Get the Right Fit for Reps",
    description: "Chinese sizing guide for replica clothing and shoes.",
    step: [
      { "@type": "HowToStep", name: "Measure yourself", text: "Take accurate body measurements in cm." },
      { "@type": "HowToStep", name: "Check the size chart", text: "Always use the seller's size chart instead of your usual size." },
      { "@type": "HowToStep", name: "Convert sizes", text: "Use conversion tables for US/EU/UK to Chinese sizing." },
      { "@type": "HowToStep", name: "Check QC photos", text: "If the fit looks off in QC photos, return before shipping." },
    ],
  };
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/guides" className="hover:text-accent transition-colors">Guides</Link>
        <span className="mx-2">/</span><span className="text-[#d4d4d8]">Sizing Guide</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">Rep Sizing Guide</h1>
      <p className="mt-3 text-lg text-text-secondary">Chinese sizing runs different. Here&apos;s how to nail it every time.</p>
      <p className="mt-1 text-sm text-text-muted">4 min read · Updated 2026</p>

      {/* General Rules */}
      <h2 className="mt-12 mb-4 text-2xl font-bold text-white">General Rules</h2>
      <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 space-y-3 text-sm text-text-secondary">
        <p>• Most Chinese sellers use <strong className="text-white">Asian sizing — size up 1-2</strong> from your Western size</p>
        <p>• Always check the size chart on the listing (your agent can translate)</p>
        <p>• Ask your agent to <strong className="text-white">measure the item in the warehouse</strong> — most do this for free</p>
        <p>• Weight ≠ quality, but heavier blanks (300g+) usually mean thicker material</p>
      </div>

      {/* Category Sizing */}
      <h2 className="mt-12 mb-4 text-2xl font-bold text-white">Category Sizing</h2>
      <div className="space-y-4">
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
          <h3 className="text-lg font-bold text-white mb-3">👕 T-Shirts</h3>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-sm">
              <thead><tr className="text-text-muted border-b border-[rgba(255,255,255,0.06)]">
                <th className="py-2 text-left">Asian</th><th className="py-2 text-left">Western</th><th className="py-2 text-left">Chest (cm)</th>
              </tr></thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-[rgba(255,255,255,0.04)]"><td className="py-2">S</td><td>XS</td><td>96-100</td></tr>
                <tr className="border-b border-[rgba(255,255,255,0.04)]"><td className="py-2">M</td><td>S</td><td>100-104</td></tr>
                <tr className="border-b border-[rgba(255,255,255,0.04)]"><td className="py-2">L</td><td>M</td><td>104-108</td></tr>
                <tr className="border-b border-[rgba(255,255,255,0.04)]"><td className="py-2">XL</td><td>L</td><td>108-112</td></tr>
                <tr><td className="py-2">XXL</td><td>XL</td><td>112-116</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-text-muted">Oversized fit? Go 2 sizes up. Regular fit? Go 1 size up. Measure your best-fitting tee for reference.</p>
        </div>

        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
          <h3 className="text-lg font-bold text-white mb-3">🧥 Hoodies & Sweaters</h3>
          <p className="text-sm text-text-secondary mb-2">Same 1-2 size up rule. Check shoulder measurement — dropped shoulders (oversized) may not need sizing up as much.</p>
          <p className="text-sm text-text-secondary">Check length to avoid crop-top surprises. Measure your torso length.</p>
        </div>

        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
          <h3 className="text-lg font-bold text-white mb-3">👖 Pants & Jeans</h3>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-sm">
              <thead><tr className="text-text-muted border-b border-[rgba(255,255,255,0.06)]">
                <th className="py-2 text-left">US Size</th><th className="py-2 text-left">CN Waist</th><th className="py-2 text-left">EU Size</th>
              </tr></thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-[rgba(255,255,255,0.04)]"><td className="py-2">28</td><td>71 cm</td><td>44</td></tr>
                <tr className="border-b border-[rgba(255,255,255,0.04)]"><td className="py-2">30</td><td>76 cm</td><td>46</td></tr>
                <tr className="border-b border-[rgba(255,255,255,0.04)]"><td className="py-2">32</td><td>81 cm</td><td>48</td></tr>
                <tr className="border-b border-[rgba(255,255,255,0.04)]"><td className="py-2">34</td><td>86 cm</td><td>50</td></tr>
                <tr><td className="py-2">36</td><td>91 cm</td><td>52</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-text-muted">Measure waist in cm. Inseam is often shorter than Western pants — check length. Denim shrinks slightly after first wash.</p>
        </div>

        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
          <h3 className="text-lg font-bold text-white mb-3">👟 Shoes</h3>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>• Most rep shoes are <strong className="text-white">TTS</strong> for popular batches</p>
            <p>• <strong className="text-white">Jordan 1, Dunk, AF1:</strong> TTS or half size up</p>
            <p>• <strong className="text-white">Yeezy 350:</strong> Half size up (runs small)</p>
            <p>• <strong className="text-white">New Balance:</strong> TTS</p>
            <p>• Measure your foot in CM and compare to the seller&apos;s size chart</p>
            <p>• When in doubt, go half size up (easier to add an insole than return)</p>
          </div>
        </div>
      </div>

      {/* How to Measure */}
      <h2 className="mt-12 mb-4 text-2xl font-bold text-white">How to Measure</h2>
      <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { point: "Chest", how: "Armpit to armpit (flat)" },
            { point: "Length", how: "Collar to hem" },
            { point: "Shoulder", how: "Seam to seam" },
            { point: "Waist", how: "Around natural waist" },
            { point: "Inseam", how: "Crotch to ankle" },
            { point: "Foot", how: "Heel to longest toe (CM)" },
          ].map((m) => (
            <div key={m.point} className="rounded-lg bg-[#1a1a1a] p-3">
              <p className="font-semibold text-white text-xs">{m.point}</p>
              <p className="text-xs text-text-muted">{m.how}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-text-muted">Pro tip: Measure your best-fitting garment flat on a table. Compare those measurements to the seller&apos;s size chart — this is more accurate than body measurements.</p>
      </div>

      {/* What if it doesn't fit */}
      <h2 className="mt-12 mb-4 text-2xl font-bold text-white">Doesn&apos;t Fit?</h2>
      <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 space-y-2 text-sm text-text-secondary">
        <p>• <strong className="text-white">Return window:</strong> most agents allow free returns within their warehouse (3-7 days)</p>
        <p>• Always check QC photos for measurements before shipping</p>
        <p>• Ask your agent to measure specific dimensions if the size chart is unclear</p>
        <p>• Exchange is usually free — you just pay the price difference if any</p>
      </div>

      {/* Links */}
      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/guides/how-to-buy-reps-kakobuy" className="rounded-lg bg-accent px-6 py-3 text-sm font-bold text-white hover:shadow-[0_0_20px_rgba(254,66,5,0.3)] transition-all">How to buy guide →</Link>
        <Link href="/guides/color-guide" className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-6 py-3 text-sm text-text-secondary hover:text-white transition-colors">Color guide →</Link>
        <Link href="/products" className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-6 py-3 text-sm text-text-secondary hover:text-white transition-colors">Browse products →</Link>
      </div>
    </article>
  );
}
