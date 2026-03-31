"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

// ==================== TYPES ====================
interface ContentResult {
  platform: string;
  title?: string;
  body: string;
  subreddit?: string;
  hashtags?: string;
  videoIdea?: string;
  contentType?: string;
}

interface BrandOption { name: string; count: number; }

interface Product {
  id: number;
  name: string;
  brand: string;
  price_cny: number;
  image: string;
  category: string;
}

interface SavedOutfit {
  products: Product[];
  preset: string;
  timestamp: number;
}

interface PresetConfig {
  name: string;
  vibe: string;
  description: string;
  brands?: string[];
  collection?: string;
}

// ==================== CONSTANTS ====================
type Tab = "reddit" | "tiktok" | "instagram" | "discord" | "outfits";

const tabLabels: Record<Tab, string> = {
  reddit: "Reddit",
  tiktok: "TikTok",
  instagram: "Instagram",
  discord: "Discord",
  outfits: "Outfits",
};

const platformTemplates: Record<string, { value: string; label: string }[]> = {
  reddit: [
    { value: "weekly-finds", label: "Weekly Finds (25 items)" },
    { value: "intro", label: "Site Intro Post" },
    { value: "haul-guide", label: "Haul Guide" },
    { value: "budget", label: "Budget Steals Under ¥100" },
    { value: "girls", label: "Women's Finds" },
    { value: "brand-spotlight", label: "Brand Spotlight" },
  ],
  tiktok: [
    { value: "product-showcase", label: "Product Showcase" },
    { value: "top-5", label: "Top 5 Finds" },
    { value: "budget-challenge", label: "Budget Challenge" },
    { value: "girls", label: "Girls Collection" },
    { value: "pov-hook", label: "POV / Hook" },
  ],
  instagram: [
    { value: "carousel-weekly", label: "Carousel — Weekly Finds" },
    { value: "carousel-girls", label: "Carousel — Girls" },
    { value: "single-product", label: "Single Product Feature" },
    { value: "reel-walkthrough", label: "Reel — Site Walkthrough" },
    { value: "story-poll", label: "Story — Quick Poll" },
  ],
  discord: [
    { value: "weekly-drops", label: "Weekly Finds Drop" },
    { value: "new-products", label: "New Products Alert" },
    { value: "budget-alert", label: "Budget Alert" },
    { value: "girls-drop", label: "Girls Drop" },
    { value: "welcome", label: "Welcome / Server Info" },
  ],
};

const PRESETS: Record<string, PresetConfig> = {
  "summer-streetwear": { name: "Summer Streetwear", vibe: "summer streetwear", description: "Relaxed summer fit. Graphic tees, shorts, clean sneakers, cap.", brands: ["Nike", "Stussy", "Supreme", "BAPE", "Gallery Dept", "FOG Essentials", "Palm Angels", "Corteiz", "Trapstar", "Adidas", "Jordan", "New Balance"] },
  "old-money": { name: "Old Money", vibe: "old money quiet luxury", description: "Understated wealth. Polos, tailored pants, loafers, minimal accessories.", brands: ["Ralph Lauren", "Burberry", "Acne Studios", "Hermes", "Lacoste", "New Balance", "Maison Margiela", "Loewe", "Casablanca", "Moncler"] },
  "dark-aesthetic": { name: "Dark Aesthetic", vibe: "dark aesthetic avant-garde", description: "All black/dark. Oversized silhouettes, layered jewelry, chunky boots.", brands: ["Rick Owens", "Chrome Hearts", "Balenciaga", "Vetements", "Undercover", "Raf Simons", "Maison Margiela", "Vivienne Westwood", "Number Nine"] },
  "girls-luxury": { name: "Girls Luxury", vibe: "feminine luxury", description: "Elegant womens outfit. Designer bags, heels, delicate jewelry.", brands: ["Chanel", "Dior", "Hermes", "Louis Vuitton", "Miu Miu", "Vivienne Westwood", "Prada", "Gucci", "Fendi", "Celine", "Loewe"], collection: "girls" },
  "hypebeast": { name: "Hypebeast", vibe: "hypebeast maximalist", description: "Bold logos, statement pieces, head-to-toe designer.", brands: ["Supreme", "Off-White", "Louis Vuitton", "Balenciaga", "Gucci", "Dior", "Nike", "Amiri", "Chrome Hearts", "BAPE"] },
  "sporty": { name: "Sporty", vibe: "athletic sporty casual", description: "Clean athletic style. Track pants, sneakers, sporty accessories.", brands: ["Nike", "Adidas", "New Balance", "Jordan", "Puma", "Asics", "Under Armour"] },
  "minimal": { name: "Minimal", vibe: "minimalist clean", description: "Clean lines, neutral palette, no bold logos.", brands: ["Acne Studios", "Maison Margiela", "Loewe", "Jil Sander", "COS", "Uniqlo", "New Balance"] },
  "archive": { name: "Archive", vibe: "archive fashion vintage", description: "Rare vintage pieces, iconic designs, archival fashion.", brands: ["Raf Simons", "Undercover", "Number Nine", "Comme des Garcons", "Issey Miyake", "Yohji Yamamoto", "Kapital"] },
  "random": { name: "Random", vibe: "any style", description: "Surprise me. Any style, any brand. Be creative." },
};

const TOP_CATS = ["Shirts", "Hoodies", "Sweaters", "Polos", "Long Sleeves", "Jerseys", "Tank Tops", "Tops"];
const BOTTOM_CATS = ["Pants", "Shorts"];
const SHOE_CATS = ["Shoes", "Boots", "Slides & Sandals"];
const OUTERWEAR_CATS = ["Jackets"];
function getSlot(cat: string): string {
  if (TOP_CATS.includes(cat)) return "top";
  if (BOTTOM_CATS.includes(cat)) return "bottom";
  if (SHOE_CATS.includes(cat)) return "shoes";
  if (OUTERWEAR_CATS.includes(cat)) return "outerwear";
  return "accessory";
}

// ==================== COMPONENT ====================
export default function ContentGeneratorPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("reddit");

  // --- Content generator state ---
  const [template, setTemplate] = useState("weekly-finds");
  const [brand, setBrand] = useState("");
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [result, setResult] = useState<ContentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // --- Outfit curator state ---
  const [outfit, setOutfit] = useState<Product[]>([]);
  const [currentPreset, setCurrentPreset] = useState("");
  const [curating, setCurating] = useState(false);
  const [curationMode, setCurationMode] = useState("");
  const [styleNotes, setStyleNotes] = useState("");
  const [scanStats, setScanStats] = useState({ total: 0, shortlisted: 0, selected: 0 });
  const [outfitError, setOutfitError] = useState("");
  const [outfitCopied, setOutfitCopied] = useState(false);
  const [recentOutfitIds, setRecentOutfitIds] = useState<number[]>([]);
  const [swapTarget, setSwapTarget] = useState<Product | null>(null);
  const [swapOptions, setSwapOptions] = useState<Product[]>([]);
  const [swapLoading, setSwapLoading] = useState(false);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [outfitSearch, setOutfitSearch] = useState("");
  const [outfitSearchResults, setOutfitSearchResults] = useState<Product[]>([]);
  const [outfitSearching, setOutfitSearching] = useState(false);
  const outfitSearchTimeout = useRef<NodeJS.Timeout>();

  // --- Auth ---
  useEffect(() => {
    const saved = sessionStorage.getItem("admin-auth");
    if (saved) { setStoredPassword(saved); setAuthed(true); }
    try { const s = localStorage.getItem("saved-outfits"); if (s) setSavedOutfits(JSON.parse(s)); } catch { /* */ }
  }, []);

  const handleLogin = () => {
    if (!password) return;
    setStoredPassword(password);
    sessionStorage.setItem("admin-auth", password);
    setAuthed(true);
  };

  // --- Content: fetch brands ---
  const fetchBrands = useCallback(async () => {
    if (!storedPassword) return;
    const res = await fetch("/api/admin/reddit/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": storedPassword },
      body: JSON.stringify({ template: "brands" }),
    });
    if (res.ok) { const d = await res.json(); setBrands(d.brands || []); }
  }, [storedPassword]);

  useEffect(() => { if (authed) fetchBrands(); }, [authed, fetchBrands]);

  // Reset template when switching content tabs
  useEffect(() => {
    if (activeTab !== "outfits" && platformTemplates[activeTab]) {
      setTemplate(platformTemplates[activeTab][0].value);
      setResult(null);
    }
  }, [activeTab]);

  // --- Content: generate ---
  const generateContent = async () => {
    if (template === "brand-spotlight" && !brand) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reddit/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": storedPassword },
        body: JSON.stringify({ platform: activeTab, template, brand }),
      });
      if (res.status === 401) { setAuthed(false); sessionStorage.removeItem("admin-auth"); return; }
      if (res.ok) setResult(await res.json());
    } catch { /* */ }
    setLoading(false);
  };

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // --- Outfit: search ---
  useEffect(() => {
    if (!storedPassword || outfitSearch.length < 2) { setOutfitSearchResults([]); return; }
    clearTimeout(outfitSearchTimeout.current);
    outfitSearchTimeout.current = setTimeout(async () => {
      setOutfitSearching(true);
      try {
        const res = await fetch(`/api/admin/products/search?q=${encodeURIComponent(outfitSearch)}`, { headers: { "x-admin-password": storedPassword } });
        if (res.ok) setOutfitSearchResults(await res.json());
      } catch { /* */ }
      setOutfitSearching(false);
    }, 300);
  }, [outfitSearch, storedPassword]);

  // --- Outfit: generate ---
  const generateOutfit = async (key: string) => {
    const preset = PRESETS[key];
    if (!preset) return;
    setCurating(true); setCurrentPreset(key); setOutfit([]); setCurationMode(""); setStyleNotes(""); setScanStats({ total: 0, shortlisted: 0, selected: 0 }); setOutfitError("");
    try {
      const res = await fetch("/api/admin/outfits/curate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": storedPassword },
        body: JSON.stringify({ preset, excludeIds: recentOutfitIds }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.products?.length > 0) {
          setOutfit(data.products); setCurationMode(data.mode || ""); setStyleNotes(data.notes || "");
          setScanStats({ total: data.totalScanned || 0, shortlisted: data.shortlisted || 0, selected: data.products.length });
          setRecentOutfitIds((prev) => [...prev, ...data.products.map((p: Product) => p.id)].slice(-18));
        } else setOutfitError("No matching products found.");
      } else { const data = await res.json(); setOutfitError(data.error || "Curation failed"); }
    } catch { setOutfitError("Failed to curate outfit"); }
    setCurating(false);
  };

  const openSwap = async (product: Product) => {
    setSwapTarget(product); setSwapLoading(true); setSwapOptions([]);
    try {
      const res = await fetch("/api/admin/outfits/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": storedPassword },
        body: JSON.stringify({ category: product.category, excludeIds: outfit.map((p) => p.id) }),
      });
      if (res.ok) { const data = await res.json(); setSwapOptions(data.products || []); }
    } catch { /* */ }
    setSwapLoading(false);
  };

  const doSwap = (np: Product) => { if (!swapTarget) return; setOutfit((prev) => prev.map((p) => p.id === swapTarget.id ? np : p)); setSwapTarget(null); setSwapOptions([]); };
  const removeOutfitProduct = (id: number) => setOutfit((prev) => prev.filter((p) => p.id !== id));
  const addOutfitProduct = (p: Product) => { if (outfit.length >= 8 || outfit.some((o) => o.id === p.id)) return; setOutfit((prev) => [...prev, p]); setOutfitSearch(""); setOutfitSearchResults([]); };
  const copyOutfitLinks = () => { navigator.clipboard.writeText(outfit.map((p) => `${p.brand} ${p.name} — ¥${p.price_cny}\nhttps://murmreps.com/products/${p.id}`).join("\n\n")); setOutfitCopied(true); setTimeout(() => setOutfitCopied(false), 2000); };
  const saveOutfit = () => { if (!outfit.length) return; const entry: SavedOutfit = { products: outfit, preset: currentPreset, timestamp: Date.now() }; const updated = [entry, ...savedOutfits].slice(0, 20); setSavedOutfits(updated); try { localStorage.setItem("saved-outfits", JSON.stringify(updated)); } catch { /* */ } };
  const loadOutfit = (s: SavedOutfit) => { setOutfit(s.products); setCurrentPreset(s.preset); setCurationMode("saved"); };

  const top = outfit.find((p) => getSlot(p.category) === "top");
  const bottom = outfit.find((p) => getSlot(p.category) === "bottom");
  const shoes = outfit.find((p) => getSlot(p.category) === "shoes");
  const ow = outfit.find((p) => getSlot(p.category) === "outerwear");
  const acc = outfit.filter((p) => getSlot(p.category) === "accessory");

  const ItemCard = ({ product }: { product: Product }) => (
    <div className="group relative rounded-xl bg-[#111] border border-[rgba(255,255,255,0.06)] overflow-hidden transition-all hover:border-[rgba(255,255,255,0.15)]">
      <div className="aspect-square bg-[#0e0e0e] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="p-3">
        <p className="text-xs font-bold text-[#FE4205]">{product.brand}</p>
        <p className="text-sm text-white line-clamp-2 leading-tight mt-0.5">{product.name}</p>
        <p className="text-xs text-[#6B7280] mt-1">¥{product.price_cny}</p>
      </div>
      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <a href={`/products/${product.id}`} target="_blank" rel="noopener noreferrer" className="rounded-md bg-black/60 p-1.5 text-white hover:bg-black/80 backdrop-blur-sm" title="View">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
        </a>
        <button onClick={() => openSwap(product)} className="rounded-md bg-black/60 p-1.5 text-white hover:bg-black/80 backdrop-blur-sm" title="Swap">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
        </button>
        <button onClick={() => removeOutfitProduct(product.id)} className="rounded-md bg-black/60 p-1.5 text-red-400 hover:bg-black/80 backdrop-blur-sm" title="Remove">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );

  const CopyBlock = ({ label, text, field, charLimit }: { label: string; text: string; field: string; charLimit?: number }) => (
    <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">{label}</label>
          {charLimit && <span className={`text-xs ${text.length > charLimit ? "text-red-400" : "text-[#6B7280]"}`}>{text.length}/{charLimit}</span>}
        </div>
        <button onClick={() => copy(text, field)} className="text-sm text-[#FE4205] hover:text-[#FE4205]/80 transition-colors">{copiedField === field ? "✓ Copied!" : "Copy"}</button>
      </div>
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#d4d4d8]">{text}</pre>
    </div>
  );

  const Spinner = () => (
    <div className="flex items-center justify-center py-20">
      <svg className="h-8 w-8 animate-spin text-[#FE4205]" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="w-full max-w-sm rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111] p-8">
          <h1 className="mb-6 text-center text-xl font-bold text-white">Content Generator</h1>
          <input type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="mb-4 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder-[#6B7280] outline-none focus:border-[#FE4205]" />
          <button onClick={handleLogin} className="w-full rounded-lg bg-[#FE4205] py-3 text-sm font-bold text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)]">Log in</button>
        </div>
      </div>
    );
  }

  const isContentTab = activeTab !== "outfits";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.06)]">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-sm text-[#6B7280] hover:text-white transition-colors">← Admin</Link>
              <h1 className="text-lg font-bold">Content Generator</h1>
            </div>
            <button onClick={() => { sessionStorage.removeItem("admin-auth"); setAuthed(false); }} className="text-sm text-[#6B7280] hover:text-white transition-colors">Logout</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[rgba(255,255,255,0.06)] px-6">
        <div className="mx-auto max-w-5xl flex gap-0">
          {(Object.keys(tabLabels) as Tab[]).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === t ? "border-[#FE4205] text-white" : "border-transparent text-[#6B7280] hover:text-[#9CA3AF]"}`}>
              {tabLabels[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* ============ CONTENT TABS (Reddit/TikTok/Instagram/Discord) ============ */}
        {isContentTab && (
          <>
            <div className="mb-6 flex flex-wrap items-end gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#9CA3AF]">Template</label>
                <select value={template} onChange={(e) => { setTemplate(e.target.value); setResult(null); }}
                  className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2.5 text-sm text-white outline-none focus:border-[#FE4205]">
                  {(platformTemplates[activeTab] || []).map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              {template === "brand-spotlight" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#9CA3AF]">Brand</label>
                  <select value={brand} onChange={(e) => setBrand(e.target.value)}
                    className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2.5 text-sm text-white outline-none focus:border-[#FE4205]">
                    <option value="">Select brand...</option>
                    {brands.map((b) => <option key={b.name} value={b.name}>{b.name} ({b.count})</option>)}
                  </select>
                </div>
              )}
              <button onClick={generateContent} disabled={loading || (template === "brand-spotlight" && !brand)}
                className="rounded-lg bg-[#FE4205] px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)] disabled:opacity-30">
                {loading ? "Generating..." : "Generate"}
              </button>
            </div>

            {result && (
              <div className="space-y-4">
                {result.subreddit && <p className="text-sm text-[#6B7280]">Best for: <span className="text-[#FE4205]">{result.subreddit}</span></p>}
                {result.contentType && <p className="text-sm text-[#6B7280]">Format: <span className="text-[#FE4205]">{result.contentType}</span></p>}
                {activeTab === "reddit" && result.title && <CopyBlock label="Post Title" text={result.title} field="title" />}
                <CopyBlock label={activeTab === "reddit" ? "Post Body" : activeTab === "discord" ? "Message" : "Caption"} text={result.body} field="body"
                  charLimit={activeTab === "tiktok" ? 4000 : activeTab === "instagram" ? 2200 : undefined} />
                {activeTab === "tiktok" && result.hashtags && <CopyBlock label="Hashtags" text={result.hashtags} field="hashtags" />}
                {activeTab === "tiktok" && result.videoIdea && <CopyBlock label="Video Idea" text={result.videoIdea} field="videoIdea" />}
                <button onClick={generateContent} disabled={loading} className="text-sm text-[#6B7280] hover:text-white transition-colors disabled:opacity-30">🔄 Regenerate</button>
              </div>
            )}

            {!result && !loading && (
              <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] px-8 py-16 text-center">
                <p className="text-[#6B7280]">Select a template and click Generate.</p>
              </div>
            )}
            {loading && <Spinner />}
          </>
        )}

        {/* ============ OUTFITS TAB ============ */}
        {activeTab === "outfits" && (
          <div className="space-y-6">
            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button key={key} onClick={() => generateOutfit(key)} disabled={curating}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-50 ${currentPreset === key ? "border-[#FE4205]/50 bg-[#FE4205]/10 text-white" : "border-[rgba(255,255,255,0.08)] bg-[#141414] text-[#9CA3AF] hover:text-white hover:border-[#FE4205]/30"}`}>
                  {curating && currentPreset === key ? "🤖 Curating..." : preset.name}
                </button>
              ))}
            </div>

            {curating && <p className="text-xs text-[#6B7280]">Stage 1: Scanning all products... → Stage 2: Evaluating top 50 with images...</p>}
            {outfitError && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{outfitError}</div>}

            {outfit.length > 0 && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {curationMode && <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-2.5 py-1 text-[10px] text-[#FE4205]">{curationMode === "ai-curated" ? "AI-styled" : curationMode}</span>}
                    <span className="text-xs text-[#6B7280]">{outfit.length} items</span>
                    {scanStats.total > 0 && <span className="text-xs text-[#52525b]">Scanned {scanStats.total.toLocaleString()} → Shortlisted {scanStats.shortlisted} → Selected {scanStats.selected}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={copyOutfitLinks} className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2 text-xs text-[#9CA3AF] hover:text-white transition-colors">{outfitCopied ? "✓ Copied!" : "Copy W2C links"}</button>
                    <button onClick={saveOutfit} className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2 text-xs text-[#9CA3AF] hover:text-white transition-colors">Save outfit</button>
                    <button onClick={() => currentPreset && generateOutfit(currentPreset)} disabled={curating || !currentPreset}
                      className="rounded-lg bg-[#FE4205] px-4 py-2 text-xs font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(254,66,5,0.3)] disabled:opacity-30">🔄 Shuffle</button>
                  </div>
                </div>

                {/* Flat-lay grid */}
                <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                  {acc.length > 0 ? <div className="self-end"><ItemCard product={acc[0]} /></div> : <div />}
                  {ow ? <div><ItemCard product={ow} /></div> : top ? <div><ItemCard product={top} /></div> : <div />}
                  {acc.length > 1 ? <div className="self-end"><ItemCard product={acc[1]} /></div> : <div />}
                  {shoes ? <div><ItemCard product={shoes} /></div> : <div />}
                  {ow && top ? <div><ItemCard product={top} /></div> : acc.length > 2 ? <div><ItemCard product={acc[2]} /></div> : <div />}
                  {bottom ? <div><ItemCard product={bottom} /></div> : <div />}
                </div>

                {styleNotes && <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111] p-4"><p className="text-sm italic text-[#9CA3AF]">{styleNotes}</p></div>}

                {/* Manual add */}
                <div className="relative">
                  <input type="text" value={outfitSearch} onChange={(e) => setOutfitSearch(e.target.value)} placeholder="Search to add more items..."
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2.5 text-sm text-white placeholder-[#6B7280] outline-none focus:border-[#FE4205]" />
                  {outfitSearching && <span className="absolute right-3 top-3 text-xs text-[#6B7280]">...</span>}
                </div>
                {outfitSearchResults.length > 0 && (
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111] divide-y divide-[rgba(255,255,255,0.04)]">
                    {outfitSearchResults.map((p) => (
                      <button key={p.id} onClick={() => addOutfitProduct(p)} disabled={outfit.some((o) => o.id === p.id) || outfit.length >= 8}
                        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-[rgba(255,255,255,0.03)] disabled:opacity-30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt={p.name} className="h-10 w-10 rounded-md object-cover shrink-0" />
                        <div className="min-w-0"><p className="text-sm text-white truncate">{p.name}</p><p className="text-xs text-[#6B7280]">{p.brand} · ¥{p.price_cny}</p></div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {outfit.length === 0 && !curating && (
              <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111] px-8 py-20 text-center">
                <p className="text-3xl mb-3">👕</p>
                <p className="text-white font-medium mb-1">Pick a style to generate an outfit</p>
                <p className="text-sm text-[#6B7280]">The AI will curate 4-6 items you can photograph as a flat-lay</p>
              </div>
            )}
            {curating && <Spinner />}

            {/* Tips */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111] p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280] mb-3">Flat-lay photography tips</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#9CA3AF]">
                <p>• Use grey carpet or beige rug as your surface</p>
                <p>• Shoot from directly overhead with your phone</p>
                <p>• Natural window light works best — avoid flash</p>
                <p>• Fold tops neatly showing the logo/graphic</p>
                <p>• Place shoes bottom-left at a slight angle</p>
                <p>• Add 2-3 small accessories for visual interest</p>
              </div>
            </div>

            {/* Saved */}
            {savedOutfits.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-medium text-[#9CA3AF]">Saved Outfits</h2>
                  <button onClick={() => { setSavedOutfits([]); localStorage.removeItem("saved-outfits"); }} className="text-xs text-[#52525b] hover:text-red-400 transition-colors">Clear all</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {savedOutfits.map((saved, i) => (
                    <button key={i} onClick={() => loadOutfit(saved)} className="group rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111] p-3 transition-all hover:border-[rgba(255,255,255,0.15)] text-left">
                      <div className="grid grid-cols-3 gap-1 mb-2">
                        {saved.products.slice(0, 3).map((p) => (
                          <div key={p.id} className="aspect-square overflow-hidden rounded bg-[#0e0e0e]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.image} alt="" className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-[#9CA3AF]">{saved.products.length} items · {PRESETS[saved.preset]?.name || "Custom"}</p>
                      <p className="text-[10px] text-[#52525b]">{new Date(saved.timestamp).toLocaleDateString()}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Swap Modal */}
      {swapTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => { setSwapTarget(null); setSwapOptions([]); }}>
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#141414] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div><h3 className="text-sm font-bold text-white">Swap: {swapTarget.name}</h3><p className="text-xs text-[#6B7280]">{swapTarget.category}</p></div>
              <button onClick={() => { setSwapTarget(null); setSwapOptions([]); }} className="text-[#6B7280] hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {swapLoading ? <Spinner /> : (
              <div className="grid grid-cols-2 gap-3">
                {swapOptions.map((p) => (
                  <button key={p.id} onClick={() => doSwap(p)} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111] overflow-hidden text-left transition-all hover:border-[#FE4205]/30">
                    <div className="aspect-square bg-[#0e0e0e] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-2.5"><p className="text-xs font-bold text-[#FE4205]">{p.brand}</p><p className="text-xs text-white line-clamp-1">{p.name}</p><p className="text-[10px] text-[#6B7280]">¥{p.price_cny}</p></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
