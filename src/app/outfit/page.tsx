"use client";

import { useState, useEffect, useCallback } from "react";
import { usePreferences } from "@/lib/usePreferences";

interface OutfitItem {
  id: number;
  name: string;
  brand: string;
  category: string;
  price_cny: number | null;
  price_usd: number | null;
  price_eur: number | null;
  image: string;
  score: number;
  slot: string;
}

interface SavedOutfit {
  id: string;
  style: string;
  items: OutfitItem[];
  savedAt: number;
}

const STYLES = [
  { value: "streetwear", label: "Streetwear", emoji: "\uD83D\uDD25" },
  { value: "dark", label: "Dark Aesthetic", emoji: "\uD83D\uDDA4" },
  { value: "oldmoney", label: "Old Money", emoji: "\uD83E\uDDD1\u200D\uD83D\uDCBC" },
  { value: "hypebeast", label: "Hypebeast", emoji: "\uD83D\uDCA5" },
  { value: "summer", label: "Summer Casual", emoji: "\u2600\uFE0F" },
  { value: "girls", label: "Girls Luxury", emoji: "\uD83D\uDC85" },
  { value: "fullbrand", label: "Full Brand", emoji: "\uD83C\uDFF7\uFE0F" },
];

const BRANDS = [
  "Chrome Hearts", "Nike", "Balenciaga", "Louis Vuitton", "Supreme",
  "Stussy", "Dior", "Gucci", "Prada", "Jordan", "Off-White", "BAPE",
  "Rick Owens", "Burberry", "Vivienne Westwood", "Adidas", "Moncler",
  "Chanel", "Hermes", "Essentials",
];

const SLOT_ORDER = ["headwear", "jewelry", "top", "bottom", "bag", "shoes"];
const SLOT_LABELS: Record<string, string> = {
  headwear: "Headwear",
  jewelry: "Jewelry",
  top: "Top",
  bottom: "Bottom",
  bag: "Bag",
  shoes: "Shoes",
};

export default function OutfitPage() {
  const [style, setStyle] = useState("streetwear");
  const [brand, setBrand] = useState("Chrome Hearts");
  const [items, setItems] = useState<Record<string, OutfitItem>>({});
  const [loading, setLoading] = useState(false);
  const [shufflingSlot, setShufflingSlot] = useState<string | null>(null);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const { formatPrice } = usePreferences();

  // Load saved outfits from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("murmreps_saved_outfits");
      if (raw) setSavedOutfits(JSON.parse(raw));
    } catch { /* */ }
  }, []);

  const saveToStorage = (outfits: SavedOutfit[]) => {
    setSavedOutfits(outfits);
    try { localStorage.setItem("murmreps_saved_outfits", JSON.stringify(outfits)); } catch { /* */ }
  };

  const generate = useCallback(async (selectedStyle?: string, selectedBrand?: string) => {
    const s = selectedStyle || style;
    const b = selectedBrand || brand;
    setLoading(true);
    try {
      const params = new URLSearchParams({ style: s });
      if (s === "fullbrand") params.set("brand", b);
      const res = await fetch(`/api/outfit?${params}`);
      const data = await res.json();
      setItems(data.items || {});
    } catch { /* */ }
    setLoading(false);
  }, [style, brand]);

  const shuffleSlot = async (slot: string) => {
    setShufflingSlot(slot);
    try {
      const params = new URLSearchParams({ style, slot });
      if (style === "fullbrand") params.set("brand", brand);
      const res = await fetch(`/api/outfit?${params}`);
      const data = await res.json();
      if (data.items?.[slot]) {
        setItems((prev) => ({ ...prev, [slot]: data.items[slot] }));
      }
    } catch { /* */ }
    setShufflingSlot(null);
  };

  const saveOutfit = () => {
    const itemList = SLOT_ORDER.map((s) => items[s]).filter(Boolean);
    if (itemList.length === 0) return;
    const outfit: SavedOutfit = {
      id: Date.now().toString(36),
      style,
      items: itemList,
      savedAt: Date.now(),
    };
    saveToStorage([outfit, ...savedOutfits].slice(0, 20));
  };

  const deleteOutfit = (id: string) => {
    saveToStorage(savedOutfits.filter((o) => o.id !== id));
  };

  // Generate on first load
  useEffect(() => { generate(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStyleChange = (newStyle: string) => {
    setStyle(newStyle);
    generate(newStyle);
  };

  const itemCount = Object.keys(items).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Outfit Generator
        </h1>
        <p className="mt-2 text-text-secondary">
          Random outfit combos from <span className="text-accent">15,000+</span> finds
        </p>
      </div>

      {/* Style selector */}
      <div className="mb-8">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
          {STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => handleStyleChange(s.value)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-all ${
                style === s.value
                  ? "bg-accent text-white"
                  : "border border-[rgba(255,255,255,0.08)] bg-[#141414] text-text-secondary hover:text-white"
              }`}
            >
              <span>{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Brand picker for Full Brand mode */}
        {style === "fullbrand" && (
          <div className="mt-4 flex items-center gap-3">
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2.5 text-sm text-white outline-none"
            >
              {BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <button
              onClick={() => generate("fullbrand", brand)}
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(254,66,5,0.2)]"
            >
              Generate
            </button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <button
          onClick={() => generate()}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(254,66,5,0.2)] disabled:opacity-50"
        >
          {loading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          ) : (
            <span>&#x1F504;</span>
          )}
          Generate New Outfit
        </button>
        <button
          onClick={saveOutfit}
          disabled={itemCount === 0}
          className="flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-5 py-2.5 text-sm font-medium text-text-secondary transition-all hover:border-accent/30 hover:text-white disabled:opacity-30"
        >
          <span>&#x1F4BE;</span>
          Save Outfit
        </button>
        <span className="text-xs text-text-muted">
          Click any item to re-roll it
        </span>
      </div>

      {/* Outfit grid */}
      {loading && itemCount === 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414]">
              <div className="aspect-square bg-[#1a1a1a]" />
              <div className="p-3">
                <div className="h-3 w-2/3 rounded bg-[#1a1a1a]" />
                <div className="mt-2 h-3 w-1/2 rounded bg-[#1a1a1a]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {SLOT_ORDER.map((slot) => {
            const item = items[slot];
            if (!item) return null;
            const isShuffling = shufflingSlot === slot;
            return (
              <button
                key={slot}
                onClick={() => shuffleSlot(slot)}
                disabled={isShuffling}
                className="group relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-[0_0_20px_rgba(254,66,5,0.1)]"
              >
                {/* Slot label */}
                <div className="absolute left-2.5 top-2.5 z-10 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent backdrop-blur-sm">
                  {SLOT_LABELS[slot]}
                </div>

                {/* Shuffle indicator */}
                <div className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  &#x1F3B2;
                </div>

                {/* Image */}
                <div className={`relative aspect-square overflow-hidden bg-[#0a0a0a] ${isShuffling ? "animate-pulse" : ""}`}>
                  {item.image && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                    {item.brand}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[13px] font-medium leading-tight text-white">
                    {item.name.replace(/\n/g, " ")}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    {item.price_cny != null ? (
                      <span className="text-sm font-bold text-white">{formatPrice(item)}</span>
                    ) : (
                      <span className="text-xs text-text-muted">Price varies</span>
                    )}
                    <a
                      href={`/products/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] font-medium text-accent hover:underline"
                    >
                      View
                    </a>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && itemCount === 0 && (
        <div className="py-20 text-center">
          <p className="text-text-secondary">No products found for this style. Try a different one.</p>
        </div>
      )}

      {/* Saved outfits */}
      {savedOutfits.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 font-heading text-xl font-bold text-white">
            Saved Outfits ({savedOutfits.length})
          </h2>
          <div className="flex flex-col gap-6">
            {savedOutfits.map((outfit) => (
              <div
                key={outfit.id}
                className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-white">
                      {STYLES.find((s) => s.value === outfit.style)?.label || outfit.style}
                    </span>
                    <span className="ml-2 text-xs text-text-muted">
                      {new Date(outfit.savedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteOutfit(outfit.id)}
                    className="text-xs text-text-muted transition-colors hover:text-danger"
                  >
                    Delete
                  </button>
                </div>
                <div className="scrollbar-hide flex gap-3 overflow-x-auto">
                  {outfit.items.map((item) => (
                    <a
                      key={item.id}
                      href={`/products/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-28 shrink-0 overflow-hidden rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#0a0a0a] transition-all hover:border-accent/20"
                    >
                      <div className="aspect-square overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                      </div>
                      <div className="p-1.5">
                        <p className="truncate text-[10px] font-medium text-white">{item.name.replace(/\n/g, " ")}</p>
                        <p className="text-[9px] text-text-muted">{item.brand}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
