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
  collageUrl?: string;
  mode: string;
  prompt: string;
  timestamp: number;
}

const surfaces = [
  "beige carpet", "cream carpet", "grey carpet", "dark grey carpet",
  "white marble", "light wood floor", "dark wood floor", "white bedsheet",
];
const lightings = [
  "soft natural light", "bright natural light", "warm golden hour light",
  "studio lighting", "moody dim lighting",
];
const formats: { label: string; value: string }[] = [
  { label: "Square 1:1 (Instagram grid)", value: "1:1" },
  { label: "Portrait 9:16 (TikTok/Reels)", value: "9:16" },
  { label: "Tall 4:5 (Instagram post)", value: "4:5" },
];
const vibes = [
  "streetwear", "old money quiet luxury", "dark aesthetic",
  "summer casual", "hypebeast", "women's luxury", "minimalist",
];

interface Preset {
  label: string;
  queries: string[];
  surface: string;
  lighting: string;
  vibe: string;
}

const presets: Preset[] = [
  { label: "Summer Streetwear", queries: ["slides", "shorts", "t-shirt", "sunglasses", "chain necklace"], surface: "cream carpet", lighting: "bright natural light", vibe: "summer casual" },
  { label: "Old Money", queries: ["polo", "chinos", "loafer", "belt", "watch"], surface: "white marble", lighting: "soft natural light", vibe: "old money quiet luxury" },
  { label: "Dark Aesthetic", queries: ["chrome hearts hoodie", "cargo pants", "black sneakers", "beanie"], surface: "dark grey carpet", lighting: "moody dim lighting", vibe: "dark aesthetic" },
  { label: "Girls Luxury", queries: ["dior bag", "hermes sandals", "jewelry", "sunglasses"], surface: "white bedsheet", lighting: "soft natural light", vibe: "women's luxury" },
  { label: "Hypebeast", queries: ["supreme hoodie", "jeans", "jordan 4", "cap"], surface: "grey carpet", lighting: "bright natural light", vibe: "hypebeast" },
];

function buildPrompt(products: Product[], surface: string, lighting: string, vibe: string): string {
  const items = products.map((p) => `${p.brand !== "Various" ? p.brand + " " : ""}${p.name}`).join(", ");
  return `Flat lay product photography of clothing and accessories arranged neatly on ${surface}, overhead bird's eye view, ${lighting}. The exact items arranged in a ${vibe} outfit formation: ${items}. Each item clearly visible, folded or placed naturally with clean spacing between items. Professional editorial product photography, slightly warm tones, crisp sharp details, 4K, photorealistic. No person, no mannequin, just clothing and accessories laid flat.`;
}

export default function OutfitGeneratorPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("");

  // Product picker
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Config
  const [surface, setSurface] = useState(surfaces[0]);
  const [lighting, setLighting] = useState(lightings[0]);
  const [format, setFormat] = useState("1:1");
  const [vibe, setVibe] = useState(vibes[0]);
  const [prompt, setPrompt] = useState("");
  const [strength, setStrength] = useState(0.75);

  // Generation
  const [imageUrl, setImageUrl] = useState("");
  const [collageUrl, setCollageUrl] = useState("");
  const [mode, setMode] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // Gallery
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-auth");
    if (saved) { setStoredPassword(saved); setAuthed(true); }
    try {
      const g = localStorage.getItem("outfit-gallery");
      if (g) setGallery(JSON.parse(g));
    } catch { /* ignore */ }
  }, []);

  const handleLogin = () => {
    if (!password) return;
    setStoredPassword(password);
    sessionStorage.setItem("admin-auth", password);
    setAuthed(true);
  };

  // Search products
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
      } catch { /* ignore */ }
      setSearching(false);
    }, 300);
  }, [search, storedPassword]);

  // Rebuild prompt when selections change
  useEffect(() => {
    if (selected.length > 0) setPrompt(buildPrompt(selected, surface, lighting, vibe));
  }, [selected, surface, lighting, vibe]);

  const addProduct = (p: Product) => {
    if (selected.length >= 8 || selected.some((s) => s.id === p.id)) return;
    setSelected((prev) => [...prev, p]);
    setSearch("");
    setSearchResults([]);
  };

  const removeProduct = (id: number) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  };

  const applyPreset = async (preset: Preset) => {
    setSurface(preset.surface);
    setLighting(preset.lighting);
    setVibe(preset.vibe);
    setSelected([]);
    const picks: Product[] = [];
    for (const q of preset.queries) {
      try {
        const res = await fetch(`/api/admin/products/search?q=${encodeURIComponent(q)}`, {
          headers: { "x-admin-password": storedPassword },
        });
        if (res.ok) {
          const results = await res.json();
          const match = results.find((r: Product) => !picks.some((p) => p.id === r.id));
          if (match) picks.push(match);
        }
      } catch { /* ignore */ }
    }
    setSelected(picks);
  };

  const generate = async () => {
    if (!prompt || selected.length === 0) return;
    setGenerating(true);
    setError("");
    setImageUrl("");
    setCollageUrl("");
    setMode("");
    try {
      const res = await fetch("/api/admin/outfits/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": storedPassword },
        body: JSON.stringify({
          prompt,
          ratio: format,
          strength,
          products: selected.map((p) => ({ id: p.id, name: p.name, brand: p.brand, image: p.image })),
        }),
      });
      if (res.status === 401) {
        setAuthed(false);
        sessionStorage.removeItem("admin-auth");
        return;
      }
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setImageUrl(data.imageUrl);
        setCollageUrl(data.collageUrl || "");
        setMode(data.mode || "");
        // Save to gallery
        const entry: GeneratedImage = {
          imageUrl: data.imageUrl,
          collageUrl: data.collageUrl,
          mode: data.mode,
          prompt,
          timestamp: Date.now(),
        };
        const updated = [entry, ...gallery].slice(0, 20);
        setGallery(updated);
        try { localStorage.setItem("outfit-gallery", JSON.stringify(updated)); } catch { /* ignore */ }
      }
    } catch {
      setError("Failed to generate image");
    }
    setGenerating(false);
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="w-full max-w-sm rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111] p-8">
          <h1 className="mb-6 text-center text-xl font-bold text-white">Outfit Generator</h1>
          <input type="password" placeholder="Admin password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="mb-4 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder-[#6B7280] outline-none focus:border-[#FE4205]" />
          <button onClick={handleLogin}
            className="w-full rounded-lg bg-[#FE4205] py-3 text-sm font-bold text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)]">
            Log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.06)]">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-sm text-[#6B7280] hover:text-white transition-colors">← Admin</Link>
              <h1 className="text-lg font-bold">Outfit Generator</h1>
            </div>
            <button onClick={() => { sessionStorage.removeItem("admin-auth"); setAuthed(false); }}
              className="text-sm text-[#6B7280] hover:text-white transition-colors">Logout</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-6 space-y-6">
        {/* Presets */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[#9CA3AF]">Quick Presets</label>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button key={p.label} onClick={() => applyPreset(p)}
                className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2 text-sm text-white transition-colors hover:border-[#FE4205]/30 hover:bg-[#1a1a1a]">
                {p.label}
              </button>
            ))}
          </div>
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
                  <span className="text-xs text-white max-w-[120px] truncate">{p.name}</span>
                  <button onClick={() => removeProduct(p.id)} className="text-[#6B7280] hover:text-red-400 text-xs ml-1">✕</button>
                </div>
              ))}
            </div>
          )}
          <div className="relative">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products to add..."
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2.5 text-sm text-white placeholder-[#6B7280] outline-none focus:border-[#FE4205]" />
            {searching && <span className="absolute right-3 top-3 text-xs text-[#6B7280]">...</span>}
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111] divide-y divide-[rgba(255,255,255,0.04)]">
              {searchResults.map((p) => (
                <button key={p.id} onClick={() => addProduct(p)}
                  disabled={selected.some((s) => s.id === p.id) || selected.length >= 8}
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

        {/* Reference Images Preview */}
        {selected.length >= 2 && (
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111] p-4">
            <p className="mb-2 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Reference images (sent to AI)</p>
            <div className="grid grid-cols-4 gap-2">
              {selected.map((p) => (
                <div key={p.id} className="relative aspect-square overflow-hidden rounded-lg bg-[#0e0e0e]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                    <p className="text-[10px] text-white truncate">{p.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#9CA3AF]">Surface</label>
            <select value={surface} onChange={(e) => setSurface(e.target.value)}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[#FE4205]">
              {surfaces.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#9CA3AF]">Lighting</label>
            <select value={lighting} onChange={(e) => setLighting(e.target.value)}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[#FE4205]">
              {lightings.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#9CA3AF]">Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[#FE4205]">
              {formats.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#9CA3AF]">Vibe</label>
            <select value={vibe} onChange={(e) => setVibe(e.target.value)}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[#FE4205]">
              {vibes.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        {/* Strength slider */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#9CA3AF]">
            Reference strength: {strength.toFixed(2)}
          </label>
          <input type="range" min="0.4" max="0.9" step="0.05" value={strength}
            onChange={(e) => setStrength(parseFloat(e.target.value))}
            className="w-full accent-[#FE4205]" />
          <div className="flex justify-between text-xs text-[#52525b]">
            <span>More creative</span>
            <span>More accurate</span>
          </div>
        </div>

        {/* Prompt */}
        {selected.length > 0 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#9CA3AF]">Prompt (editable)</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-3 text-sm text-white placeholder-[#6B7280] outline-none focus:border-[#FE4205] font-mono" />
          </div>
        )}

        {/* Generate */}
        <button onClick={generate}
          disabled={generating || selected.length === 0 || !prompt}
          className="w-full rounded-xl bg-[#FE4205] py-3.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)] disabled:opacity-30">
          {generating ? "Generating with product images (~20 seconds)..." : "Generate Flat-Lay Image"}
        </button>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
        )}

        {/* Result */}
        {imageUrl && (
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">Generated flat-lay</p>
                {mode && (
                  <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[10px] text-[#9CA3AF]">
                    {mode === "img2img" ? "Image-guided" : "Text-only"}
                  </span>
                )}
              </div>
              <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Generated outfit flat lay" className="w-full" />
              </div>
            </div>

            {collageUrl && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#6B7280]">Reference collage (input)</p>
                <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] opacity-60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={collageUrl} alt="Reference collage" className="w-full" />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <a href={imageUrl} download="murmreps-outfit.png" target="_blank" rel="noopener noreferrer"
                className="rounded-lg bg-[#FE4205] px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)]">
                Download Image
              </a>
              <button onClick={generate} disabled={generating}
                className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-6 py-2.5 text-sm text-[#9CA3AF] transition-colors hover:text-white disabled:opacity-30">
                🔄 Regenerate
              </button>
            </div>
          </div>
        )}

        {generating && (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <svg className="h-8 w-8 animate-spin text-[#FE4205]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-xs text-[#6B7280]">Creating collage from product images and generating...</p>
          </div>
        )}

        {/* Gallery */}
        {gallery.length > 0 && !generating && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-[#9CA3AF]">Previous Generations</h2>
              <button onClick={() => { setGallery([]); localStorage.removeItem("outfit-gallery"); }}
                className="text-xs text-[#52525b] hover:text-red-400 transition-colors">
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {gallery.map((g, i) => (
                <button key={i} onClick={() => { setImageUrl(g.imageUrl); setCollageUrl(g.collageUrl || ""); setMode(g.mode); }}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111] transition-all hover:border-[rgba(255,255,255,0.15)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.imageUrl} alt={`Generation ${i + 1}`} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white">
                      {new Date(g.timestamp).toLocaleDateString()}
                    </p>
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
