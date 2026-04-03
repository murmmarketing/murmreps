"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { useToast } from "@/components/Toast";

function Section({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-5 text-left">
        <span className="text-sm font-semibold text-white">{title}</span>
        <svg className={`h-4 w-4 shrink-0 text-accent transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div className="overflow-hidden transition-all duration-200" style={{ maxHeight: open ? 2000 : 0, opacity: open ? 1 : 0 }}>
        <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function CheckItem({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <li className="flex items-start gap-2"><span className={ok ? "text-green-400" : "text-red-400"}>{ok ? "✅" : "❌"}</span><span>{children}</span></li>;
}

function QCPageInner() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const urlProduct = searchParams.get("product") || "";
  const urlBrand = searchParams.get("brand") || "";

  const [searchQuery, setSearchQuery] = useState(urlBrand && urlProduct ? `${urlBrand} ${urlProduct}` : "");

  // QC Request Generator
  const [reqName, setReqName] = useState(urlProduct || "");
  const [reqAgent, setReqAgent] = useState("KakoBuy");
  const [reqPrice, setReqPrice] = useState("");
  const [reqLink, setReqLink] = useState("");

  const generatedPost = reqName ? `[QC] ${reqName} from ${reqAgent}${reqPrice ? ` — ¥${reqPrice}` : ""}

${reqLink ? `W2C: ${reqLink}\n` : ""}Agent: ${reqAgent}${reqPrice ? `\nPrice: ¥${reqPrice}` : ""}

Please help me QC this. Looking for opinions on:
- Overall shape and silhouette
- Logo/branding accuracy
- Stitching quality
- Color accuracy
- Any major flaws?

GL or RL?` : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
          QC Photos — Your Quality Safety Net
        </h1>
        <p className="mt-3 text-text-secondary">
          Before your agent ships anything, they photograph it so you can check the quality.
        </p>
      </div>

      {/* 3-step cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {[
          { step: "1", icon: "🛒", title: "Buy through an agent", desc: "Find a product on MurmReps and click an agent button" },
          { step: "2", icon: "📸", title: "Agent takes QC photos", desc: "Your item arrives at the warehouse and gets photographed within 3-7 days" },
          { step: "3", icon: "✅", title: "Review and decide", desc: "Check the photos, then GL (ship it) or RL (return it for free)" },
        ].map((s) => (
          <div key={s.step} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="mb-1 text-xs font-bold text-accent">Step {s.step}</div>
            <h3 className="text-sm font-semibold text-white mb-1">{s.title}</h3>
            <p className="text-xs text-text-muted">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* How to Read QC Photos */}
      <h2 className="font-heading text-xl font-bold text-white mb-4">How to Read QC Photos</h2>
      <div className="space-y-3 mb-12">
        <Section title="👟 Shoes">
          <ul className="space-y-2">
            <li>• <strong className="text-white">Stitching alignment</strong> — compare left vs right shoe, check for symmetry</li>
            <li>• <strong className="text-white">Logo placement</strong> — is it centered? Compare to retail photos online</li>
            <li>• <strong className="text-white">Sole color and shape</strong> — should match retail exactly</li>
            <li>• <strong className="text-white">Box label</strong> — check size, style code matches what you ordered</li>
            <li>• <strong className="text-white">Common flaws:</strong> uneven swooshes, wrong shade, sloppy glue marks</li>
          </ul>
        </Section>
        <Section title="👕 Clothing">
          <ul className="space-y-2">
            <li>• <strong className="text-white">Tags</strong> — brand tag, size tag, wash tag (should match retail)</li>
            <li>• <strong className="text-white">Print/embroidery</strong> — sharp lines, no bleeding, correct colors</li>
            <li>• <strong className="text-white">Stitching</strong> — clean, no loose threads, consistent spacing</li>
            <li>• <strong className="text-white">Color accuracy</strong> — compare to retail product photos</li>
            <li>• <strong className="text-white">Blank quality</strong> — ask agent to weigh it (heavier = thicker fabric)</li>
          </ul>
        </Section>
        <Section title="👜 Bags">
          <ul className="space-y-2">
            <li>• <strong className="text-white">Hardware</strong> — zippers, clasps, engraved logos should be crisp</li>
            <li>• <strong className="text-white">Stitching</strong> — even, consistent color, no skipped stitches</li>
            <li>• <strong className="text-white">Alignment</strong> — patterns should line up at seams</li>
            <li>• <strong className="text-white">Interior</strong> — correct lining color and material</li>
            <li>• <strong className="text-white">Stamp/logo</strong> — correct font, depth, and positioning</li>
          </ul>
        </Section>
        <Section title="💎 Jewelry">
          <ul className="space-y-2">
            <li>• <strong className="text-white">Engravings</strong> — sharp, correct font and depth</li>
            <li>• <strong className="text-white">Clasp/closure</strong> — smooth operation, correct branding</li>
            <li>• <strong className="text-white">Color accuracy</strong> — gold/silver tone should match retail</li>
            <li>• <strong className="text-white">Weight</strong> — ask agent to weigh it (too light = cheap materials)</li>
          </ul>
        </Section>
        <Section title="✅ GL vs ❌ RL — When to Ship vs Return" defaultOpen>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-4">
              <p className="text-green-400 font-semibold mb-2">✅ GL (Green Light — Ship it)</p>
              <ul className="space-y-1 text-xs">
                <CheckItem ok>Minor flaws only visible up close</CheckItem>
                <CheckItem ok>Correct overall shape and color</CheckItem>
                <CheckItem ok>Clean stitching</CheckItem>
                <CheckItem ok>Accurate logos and branding</CheckItem>
              </ul>
            </div>
            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-4">
              <p className="text-red-400 font-semibold mb-2">❌ RL (Red Light — Return it)</p>
              <ul className="space-y-1 text-xs">
                <CheckItem ok={false}>Wrong color or material</CheckItem>
                <CheckItem ok={false}>Misaligned or crooked logos</CheckItem>
                <CheckItem ok={false}>Major stitching issues</CheckItem>
                <CheckItem ok={false}>Missing details or wrong shape</CheckItem>
              </ul>
            </div>
          </div>
        </Section>
      </div>

      {/* Where to Find QC Photos */}
      <h2 className="font-heading text-xl font-bold text-white mb-4">Find QC Photos</h2>

      {/* Search box */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a product (e.g. Chrome Hearts Hoodie)"
            className="flex-1 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-3 text-sm text-white placeholder-text-muted outline-none focus:border-accent/50" />
        </div>
        {searchQuery.length > 2 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href={`https://www.reddit.com/r/FashionReps/search/?q=${encodeURIComponent(searchQuery + " QC")}&sort=new`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4 transition-colors hover:border-accent/20">
              <span className="text-xl">🔍</span>
              <div>
                <p className="text-sm font-semibold text-white">Search Reddit</p>
                <p className="text-xs text-text-muted">r/FashionReps QC posts</p>
              </div>
            </a>
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery + " rep review QC")}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4 transition-colors hover:border-accent/20">
              <span className="text-xl">▶️</span>
              <div>
                <p className="text-sm font-semibold text-white">Search YouTube</p>
                <p className="text-xs text-text-muted">Video reviews and QC checks</p>
              </div>
            </a>
          </div>
        )}
      </div>

      {/* Source cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
          <p className="text-sm font-semibold text-white mb-1">📸 Your Agent</p>
          <p className="text-xs text-text-secondary mb-3">Buy through KakoBuy and QC photos appear in your dashboard within 3-7 days. Free HD photos included.</p>
          <a href="https://ikako.vip/r/6gkjt" target="_blank" rel="noopener noreferrer"
            className="inline-block rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(254,66,5,0.3)]">
            Buy with KakoBuy →
          </a>
        </div>
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
          <p className="text-sm font-semibold text-white mb-1">💬 QC Subreddits</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              { name: "r/FashionReps", url: "https://reddit.com/r/FashionReps" },
              { name: "r/Repsneakers", url: "https://reddit.com/r/Repsneakers" },
              { name: "r/RepLadies", url: "https://reddit.com/r/RepLadies" },
              { name: "r/DesignerReps", url: "https://reddit.com/r/DesignerReps" },
            ].map((sub) => (
              <a key={sub.name} href={sub.url} target="_blank" rel="noopener noreferrer"
                className="rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1 text-xs text-text-secondary hover:text-white hover:border-accent/30 transition-colors">
                {sub.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* QC Request Generator */}
      <h2 className="font-heading text-xl font-bold text-white mb-4">QC Request Generator</h2>
      <p className="text-sm text-text-secondary mb-4">Generate a formatted QC request post for Reddit.</p>

      <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 space-y-3 mb-4">
        <input type="text" value={reqName} onChange={(e) => setReqName(e.target.value)} placeholder="Product name *"
          className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder-text-muted outline-none focus:border-accent/50" />
        <div className="grid grid-cols-2 gap-3">
          <select value={reqAgent} onChange={(e) => setReqAgent(e.target.value)}
            className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50">
            {["KakoBuy", "Superbuy", "CnFans", "MuleBuy", "ACBuy", "LoveGoBuy", "JoyaGoo", "SugarGoo"].map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <input type="text" value={reqPrice} onChange={(e) => setReqPrice(e.target.value)} placeholder="Price ¥ (optional)"
            className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder-text-muted outline-none focus:border-accent/50" />
        </div>
        <input type="text" value={reqLink} onChange={(e) => setReqLink(e.target.value)} placeholder="W2C link (optional)"
          className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder-text-muted outline-none focus:border-accent/50" />
      </div>

      {generatedPost && (
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 mb-12">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">Generated Post</span>
            <button onClick={() => { navigator.clipboard.writeText(generatedPost); showToast("Copied!"); }}
              className="text-sm text-accent hover:text-accent/80 transition-colors">Copy</button>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#d4d4d8]">{generatedPost}</pre>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="rounded-xl bg-gradient-to-r from-[#FE4205] to-[#c2410c] p-8 text-center">
        <h2 className="text-xl font-bold text-white">Get QC photos on every purchase</h2>
        <p className="mt-2 text-white/80">KakoBuy includes free HD QC photos within 3-7 days. Free returns if you RL.</p>
        <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
          <a href="https://ikako.vip/r/6gkjt" target="_blank" rel="noopener noreferrer"
            className="rounded-lg bg-white px-6 py-3 font-bold text-[#FE4205] hover:bg-zinc-100 transition-colors">
            Sign up to KakoBuy →
          </a>
          <Link href="/products" className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/20 transition-colors">
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function QCPage() {
  return <Suspense><QCPageInner /></Suspense>;
}
