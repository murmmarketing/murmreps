"use client";
import { useState } from "react";
import Link from "next/link";
import { useHaul, estimateWeight } from "@/lib/useHaul";
import { usePreferences } from "@/lib/usePreferences";
import { useToast } from "@/components/Toast";

const SHIPPING_RATES: Record<string, [number, number]> = {
  europe: [80, 150], usa: [90, 160], uk: [70, 130], australia: [100, 180],
};

export default function HaulPage() {
  const { items, remove, setQuantity, clear, count } = useHaul();
  const { formatPrice } = usePreferences();
  const { showToast } = useToast();
  const [region, setRegion] = useState("europe");
  const [confirmClear, setConfirmClear] = useState(false);

  const totalCny = items.reduce((s, i) => s + i.price_cny * i.quantity, 0);
  const totalWeight = items.reduce((s, i) => s + estimateWeight(i.category) * i.quantity, 0);
  const agentFee = Math.round(totalCny * 0.05);
  const rates = SHIPPING_RATES[region];
  const shipLow = Math.round(rates[0] * totalWeight);
  const shipHigh = Math.round(rates[1] * totalWeight);
  const totalLowEur = Math.round((totalCny + agentFee + shipLow) * 0.127);
  const totalHighEur = Math.round((totalCny + agentFee + shipHigh) * 0.127);

  const shareHaul = () => {
    const ids = items.map((i) => i.id).join(",");
    navigator.clipboard.writeText(`https://murmreps.com/haul?ids=${ids}`);
    showToast("Haul link copied!");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-white">Your Haul</h1>
      <p className="mt-2 text-text-secondary">{count} item{count !== 1 ? "s" : ""} · Plan your purchase before buying</p>

      {items.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-3xl mb-3">🛒</p>
          <p className="text-white font-medium mb-1">Your haul is empty</p>
          <p className="text-sm text-text-muted mb-4">Browse products and click + to start building.</p>
          <Link href="/products" className="inline-block rounded-lg bg-accent px-6 py-3 text-sm font-bold text-white">Browse products →</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Product list */}
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4">
                <Link href={`/products/${item.id}`} className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg bg-[#0a0a0a] object-contain" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.id}`}>
                    <p className="text-sm font-semibold text-white hover:text-accent transition-colors">{item.name}</p>
                  </Link>
                  <p className="text-xs text-text-muted">{item.brand} · {item.category}</p>
                  <p className="mt-1 text-sm font-bold text-accent">{formatPrice({ price_cny: item.price_cny })}</p>
                  <p className="text-[10px] text-text-muted">~{estimateWeight(item.category)}kg</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => remove(item.id)} className="text-xs text-text-muted hover:text-red-400 transition-colors">Remove</button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setQuantity(item.id, item.quantity - 1)} className="h-7 w-7 rounded bg-[#1a1a1a] text-white text-sm hover:bg-[#222]">-</button>
                    <span className="w-6 text-center text-sm text-white">{item.quantity}</span>
                    <button onClick={() => setQuantity(item.id, item.quantity + 1)} className="h-7 w-7 rounded bg-[#1a1a1a] text-white text-sm hover:bg-[#222]">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">Summary</h3>
              <div className="flex justify-between text-sm"><span className="text-text-muted">Items</span><span className="text-white">{count}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-muted">Product cost</span><span className="text-white">¥{totalCny}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-muted">Est. weight</span><span className="text-white">{totalWeight.toFixed(1)}kg</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-muted">Agent fee (~5%)</span><span className="text-white">¥{agentFee}</span></div>
              <div className="flex items-center justify-between text-sm gap-2">
                <span className="text-text-muted">Shipping</span>
                <select value={region} onChange={(e) => setRegion(e.target.value)} className="rounded bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] px-2 py-1 text-xs text-white outline-none">
                  <option value="europe">Europe</option><option value="usa">USA/Canada</option><option value="uk">UK</option><option value="australia">Australia</option>
                </select>
              </div>
              <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 flex justify-between">
                <span className="text-white font-bold">Estimated total</span>
                <span className="text-accent font-bold">€{totalLowEur}–{totalHighEur}</span>
              </div>
              <p className="text-[10px] text-text-muted">Rough estimate. Actual cost depends on agent and shipping line.</p>

              <a href="https://ikako.vip/r/6gkjt" target="_blank" rel="noopener noreferrer"
                className="block w-full text-center rounded-xl bg-accent py-3 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(254,66,5,0.3)]">
                Buy with KakoBuy →
              </a>

              <div className="flex gap-2">
                <button onClick={shareHaul} className="flex-1 rounded-lg border border-[rgba(255,255,255,0.08)] py-2 text-xs text-text-muted hover:text-white transition-colors">Share</button>
                <button onClick={() => { if (confirmClear) { clear(); setConfirmClear(false); } else setConfirmClear(true); }}
                  className="flex-1 rounded-lg border border-[rgba(255,255,255,0.08)] py-2 text-xs text-red-400 hover:text-red-300 transition-colors">
                  {confirmClear ? "Confirm clear?" : "Clear all"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
