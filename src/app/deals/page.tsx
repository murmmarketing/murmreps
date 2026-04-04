"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { supabase } from "@/lib/supabase";

interface Coupon {
  id: string; agent: string; code: string; description: string;
  discount_value: string; min_spend: string; expires_at: string | null;
}

export default function DealsPage() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("agent_coupons")
        .select("*")
        .eq("is_active", true)
        .order("agent");
      setCoupons((data as Coupon[]) || []);
    })();
  }, []);

  const grouped: Record<string, Coupon[]> = {};
  for (const c of coupons) {
    if (!grouped[c.agent]) grouped[c.agent] = [];
    grouped[c.agent].push(c);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-white">Agent Discount Codes & Deals</h1>
      <p className="mt-2 text-text-secondary mb-8">Save money on your next haul.</p>

      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-4 mb-12">
          {Object.entries(grouped).map(([agent, codes]) => (
            <div key={agent} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
              <h2 className="text-lg font-bold text-white mb-3">{agent}</h2>
              <div className="space-y-3">
                {codes.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg bg-[#1a1a1a] p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="rounded bg-accent/10 px-2 py-0.5 text-sm font-mono font-bold text-accent">{c.code}</code>
                        {c.discount_value && <span className="text-xs text-green-400">{c.discount_value}</span>}
                      </div>
                      <p className="text-xs text-text-muted">{c.description}</p>
                      {c.min_spend && <p className="text-[10px] text-text-muted mt-0.5">Min spend: {c.min_spend}</p>}
                      {c.expires_at && <p className="text-[10px] text-text-muted">Expires: {new Date(c.expires_at).toLocaleDateString()}</p>}
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(c.code); showToast("Code copied!"); }}
                      className="shrink-0 rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-2 text-xs text-text-muted hover:text-white transition-colors">
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-8 text-center mb-12">
          <p className="text-text-secondary mb-2">No active coupon codes right now.</p>
          <p className="text-xs text-text-muted">Check back later — we regularly add new deals.</p>
        </div>
      )}

      <div className="rounded-xl bg-gradient-to-r from-[#FE4205] to-[#c2410c] p-8 text-center">
        <h2 className="text-xl font-bold text-white">No code needed</h2>
        <p className="mt-2 text-white/80">Sign up through MurmReps for the best rates with all agents.</p>
        <a href="https://ikako.vip/r/6gkjt" target="_blank" rel="noopener noreferrer"
          className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-bold text-[#FE4205]">Sign up with KakoBuy →</a>
      </div>
    </div>
  );
}
