"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  brand: string;
  price_cny: number;
  image: string;
  category: string;
}

interface GeneratedImage {
  imageUrl: string;
  mode: string;
  prompt: string;
  timestamp: number;
}

const surfaces = [
  "grey carpet", "beige carpet", "cream carpet", "dark grey carpet",
  "white marble", "light wood floor", "dark wood floor", "white bedsheet",
];
const formats: { label: string; value: string }[] = [
  { label: "Square 1:1 (Instagram)", value: "1:1" },
  { label: "Portrait 9:16 (TikTok/Reels)", value: "9:16" },
  { label: "Tall 4:5 (Instagram post)", value: "4:5" },
];
const vibes = [
  "streetwear", "old money quiet luxury", "dark aesthetic",
  "summer casual", "hypebeast", "women's luxury", "minimalist",
];
const qualities = [
  { value: "quick", label: "Quick — 1K (~15s)" },
  { value: "standard", label: "Standard — 2K (~30s)" },
];

interface PresetConfig {
  name: string;
  vibe: string;
  description: string;
  brands: string[];
  maxPrice?: number;
  collection?: string;
  surface: string;
  lighting: string;
}

const PRESETS: Record<string, PresetConfig> = {
  "summer-streetwear": {
    name: "Summer Streetwear", vibe: "summer casual",
    description: "Relaxed summer fit. Think graphic tees, shorts, clean sneakers, and a cap. Brands like Nike, Stussy, Supreme, BAPE. Light colors, breathable fabrics.",
    brands: ["Nike", "Stussy", "Supreme", "BAPE", "Gallery Dept", "FOG Essentials", "Palm Angels", "Corteiz", "Trapstar"],
    maxPrice: 500, surface: "cream carpet", lighting: "bright natural light",
  },
  "old-money": {
    name: "Old Money", vibe: "old money quiet luxury",
    description: "Understated wealth. Polo shirts, tailored pants, loafers, minimal accessories. Brands like Ralph Lauren, Burberry, Acne Studios, Hermes. Neutral tones.",
    brands: ["Ralph Lauren", "Burberry", "Acne Studios", "Hermes", "Lacoste", "New Balance", "Maison Margiela", "Loewe", "Casablanca"],
    maxPrice: 800, surface: "white marble", lighting: "soft natural light",
  },
  "dark-aesthetic": {
    name: "Dark Aesthetic", vibe: "dark aesthetic",
    description: "All black or very dark tones. Rick Owens, Chrome Hearts, Balenciaga. Oversized silhouettes, layered jewelry, chunky boots.",
    brands: ["Rick Owens", "Chrome Hearts", "Balenciaga", "Vetements", "Undercover", "Raf Simons", "Maison Margiela", "Vivienne Westwood"],
    maxPrice: 1000, surface: "dark grey carpet", lighting: "moody dim lighting",
  },
  "girls-luxury": {
    name: "Girls Luxury", vibe: "women's luxury",
    description: "Elegant womens outfit. Designer bags, heels or sandals, delicate jewelry, a chic top. Soft colors — cream, pink, beige, gold.",
    brands: ["Chanel", "Dior", "Hermes", "Louis Vuitton", "Miu Miu", "Vivienne Westwood", "Prada", "Gucci", "Fendi", "Celine", "Loewe"],
    collection: "girls", maxPrice: 1000, surface: "white bedsheet", lighting: "soft natural light",
  },
  "hypebeast": {
    name: "Hypebeast", vibe: "hypebeast",
    description: "Bold logos, statement pieces, head-to-toe designer. Supreme, Off-White, LV collabs, Jordan 1s. Mix of streetwear and luxury.",
    brands: ["Supreme", "Off-White", "Louis Vuitton", "Balenciaga", "Gucci", "Dior", "Nike", "Amiri", "Chrome Hearts", "BAPE"],
    maxPrice: 1200, surface: "grey carpet", lighting: "bright natural light",
  },
};

export default function OutfitGeneratorPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("");

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();

  const [surface, setSurface] = useState("grey carpet");
  const [format, setFormat] = useState("1:1");
  const [vibe, setVibe] = useState(vibes[0]);
  const [quality, setQuality] = useState("standard");
  const [currentPreset, setCurrentPreset] = useState("");
  const [curating, setCurating] = useState(false);
  const [curationMode, setCurationMode] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [usedModel, setUsedModel] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const [gallery, setGallery] = useState<GeneratedImage[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-auth");
    if (saved) { setStoredPassword(saved); setAuthed(true); }
    try { const g = localStorage.getItem("outfit-gallery"); if (g) setGallery(JSON.parse(g)); } catch { /* */ }
  }, []);

  const handleLogin = () => {
    if (!password) return;
    setStoredPassword(password);
    sessionStorage.setItem("admin-auth", password);
    setAuthed(true);
  };

  useEffect(() => {
    if (!storedPassword || search.length < 2) { setSearchResults([]); return; }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/products/search?q=${encodeURIComponent(search)}`, {
          headers: { "x-admin-password": storedPassword },
        });
        if (res.ok) setSearchResults(await res.json());
      } catch { /* */ }
      setSearching(false);
    }, 300);
  }, [search, storedPassword]);

  const addProduct = (p: Product) => {
    if (selected.length >= 8 || selected.some((s) => s.id === p.id)) return;
    setSelected((prev) => [...prev, p]);
    setSearch(""); setSearchResults([]);
  };
  const removeProduct = (id: number) => setSelected((prev) => prev.filter((p) => p.id !== id));

  const applyPreset = async (key: string) => {
    const preset = PRESETS[key];
    if (!preset) return;
    setCurating(true); setCurrentPreset(key);
    setSurface(preset.surface); setVibe(preset.vibe);
    setSelected([]); setCurationMode(""); setError("");
    try {
      const res = await fetch("/api/admin/outfits/curate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": storedPassword },
        body: JSON.stringify({ preset }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.products?.length > 0) { setSelected(data.products); setCurationMode(data.mode || ""); }
        else setError("No matching products found.");
      } else { const data = await res.json(); setError(data.error || "Curation failed"); }
    } catch { setError("Failed to curate outfit"); }
    setCurating(false);
  };

  const generate = async () => {
    if (selected.length === 0) return;
    setGenerating(true); setError(""); setImageUrl(""); setGeneratedPrompt(""); setUsedModel("");
    try {
      const res = await fetch("/api/admin/outfits/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": storedPassword },
        body: JSON.stringify({
          products: selected.map((p) => ({ id: p.id, name: p.name, brand: p.brand, category: p.category, image: p.image })),
          surface, vibe, ratio: format, quality,
        }),
      });
      if (res.status === 401) { setAuthed(false); sessionStorage.removeItem("admin-auth"); return; }
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else {
        setImageUrl(data.imageUrl);
        setGeneratedPrompt(data.prompt || "");
        setUsedModel(data.model || "");
        const entry: GeneratedImage = { imageUrl: data.imageUrl, mode: data.mode, prompt: data.prompt, timestamp: Date.now() };
        const updated = [entry, ...gallery].slice(0, 20);
        setGallery(updated);
        try { localStorage.setItem("outfit-gallery", JSON.stringify(updated)); } catch { /* */ }
      }
    } catch { setError("Failed to generate image"); }
    setGenerating(false);
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="w-full max-w-sm rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111] p-8">
          <h1 className="mb-6 text-center text-xl font-bold text-white">Outfit Generator</h1>
          <input type="password" placeholder="Admin password" value={password}
            onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="mb-4 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder-[#6B7280] outline-none focus:border-[#FE4205]" />
          <button onClick={handleLogin} className="w-full rounded-lg bg-[#FE4205] py-3 text-sm font-bold text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)]">Log in</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="border-b border-[rgba(255,255,255,0.06)]">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-sm text-[#6B7280] hover:text-white transition-colors">← Admin</Link>
              <h1 className="text-lg font-bold">Outfit Generator</h1>
            </div>
            <button onClick={() => { sessionStorage.removeItem("admin-auth"); setAuthed(false); }} className="text-sm text-[#6B7280] hover:text-white transition-colors">Logout</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-6 space-y-6">
        {/* Presets */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#9CA3AF]">
            AI-Curated Presets
            {curationMode && <span className="ml-2 rounded-full bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[10px] text-[#FE4205]">{curationMode === "ai-curated" ? "AI-styled" : curationMode}</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button key={key} onClick={() => applyPreset(key)} disabled={curating}
                className={`rounded-lg border px-4 py-2 text-sm text-white transition-colors disabled:opacity-50 ${currentPreset === key ? "border-[#FE4205]/50 bg-[#FE4205]/10" : "border-[rgba(255,255,255,0.08)] bg-[#141414] hover:border-[#FE4205]/30 hover:bg-[#1a1a1a]"}`}>
                {curating && currentPreset === key ? "🤖 Curating..." : preset.name}
              </button>
            ))}
          </div>
          {currentPreset && selected.length > 0 && (
            <button onClick={() => applyPreset(currentPreset)} disabled={curating} className="mt-2 text-sm text-[#FE4205] hover:text-[#FE4205]/80 transition-colors disabled:opacity-50">🔄 Pick different items</button>
          )}
        </div>

        {/* Product Picker */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#9CA3AF]">Products ({selected.length}/8)</label>
          {selected.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selected.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-lg bg-[#141414] border border-[rgba(255,255,255,0.08)] p-1.5 pr-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} className="h-10 w-10 rounded-md object-cover" />
                  <div className="min-w-0">
                    <span className="text-xs text-white max-w-[100px] truncate block">{p.name}</span>
                    <span className="text-[10px] text-[#6B7280]">{p.category}</span>
                  </div>
                  <button onClick={() => removeProduct(p.id)} className="text-[#6B7280] hover:text-red-400 text-xs ml-1">✕</button>
                </div>
              ))}
            </div>
          )}
          <div className="relative">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products to add..."
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2.5 text-sm text-white placeholder-[#6B7280] outline-none focus:border-[#FE4205]" />
            {searching && <span className="absolute right-3 top-3 text-xs text-[#6B7280]">...</span>}
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111] divide-y divide-[rgba(255,255,255,0.04)]">
              {searchResults.map((p) => (
                <button key={p.id} onClick={() => addProduct(p)} disabled={selected.some((s) => s.id === p.id) || selected.length >= 8}
                  className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-[rgba(255,255,255,0.03)] disabled:opacity-30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} className="h-10 w-10 rounded-md object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{p.name}</p>
                    <p className="text-xs text-[#6B7280]">{p.brand} · ¥{p.price_cny} · {p.category}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reference images */}
        {selected.length >= 2 && (
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111] p-4">
            <p className="mb-2 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Selected items</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {selected.map((p) => (
                <div key={p.id} className="relative aspect-square overflow-hidden rounded-lg bg-[#0e0e0e]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                    <p className="text-[9px] text-white truncate">{p.brand}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Style config */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#9CA3AF]">Surface</label>
            <select value={surface} onChange={(e) => setSurface(e.target.value)} className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[#FE4205]">
              {surfaces.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#9CA3AF]">Vibe</label>
            <select value={vibe} onChange={(e) => setVibe(e.target.value)} className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[#FE4205]">
              {vibes.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#9CA3AF]">Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[#FE4205]">
              {formats.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#9CA3AF]">Quality</label>
            <select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[#FE4205]">
              {qualities.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
            </select>
          </div>
        </div>

        {/* Generate */}
        <button onClick={generate} disabled={generating || selected.length === 0}
          className="w-full rounded-xl bg-[#FE4205] py-3.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)] disabled:opacity-30">
          {generating ? `Generating flat-lay (${quality === "quick" ? "~15s" : "~30s"})...` : "Generate Flat-Lay Photo"}
        </button>

        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}

        {/* Result */}
        {imageUrl && (
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">Generated flat-lay</p>
                {usedModel && <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[10px] text-[#9CA3AF]">{usedModel.split("/").pop()}</span>}
              </div>
              <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Generated outfit flat lay" className="w-full" />
              </div>
            </div>
            <div className="flex gap-3">
              <a href={imageUrl} download="murmreps-outfit.png" target="_blank" rel="noopener noreferrer"
                className="rounded-lg bg-[#FE4205] px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)]">Download</a>
              <button onClick={generate} disabled={generating}
                className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-6 py-2.5 text-sm text-[#9CA3AF] transition-colors hover:text-white disabled:opacity-30">🔄 Regenerate</button>
            </div>
            {generatedPrompt && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-[#52525b] hover:text-[#9CA3AF]">View AI prompt</summary>
                <pre className="mt-2 max-h-40 overflow-y-auto rounded-lg bg-[#0e0e0e] p-3 text-xs text-[#6B7280] whitespace-pre-wrap">{generatedPrompt}</pre>
              </details>
            )}
          </div>
        )}

        {generating && (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <svg className="h-8 w-8 animate-spin text-[#FE4205]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-xs text-[#6B7280]">Generating realistic flat-lay from product descriptions...</p>
          </div>
        )}

        {/* Gallery */}
        {gallery.length > 0 && !generating && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-[#9CA3AF]">Previous Generations</h2>
              <button onClick={() => { setGallery([]); localStorage.removeItem("outfit-gallery"); }} className="text-xs text-[#52525b] hover:text-red-400 transition-colors">Clear all</button>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {gallery.map((g, i) => (
                <button key={i} onClick={() => { setImageUrl(g.imageUrl); setGeneratedPrompt(g.prompt); setUsedModel(""); }}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111] transition-all hover:border-[rgba(255,255,255,0.15)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.imageUrl} alt={`Generation ${i + 1}`} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white">{new Date(g.timestamp).toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
