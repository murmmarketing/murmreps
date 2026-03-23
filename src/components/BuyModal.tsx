"use client";

import { agents } from "@/lib/agents";
import { trackEvent } from "@/lib/track";
import { usePreferences } from "@/lib/usePreferences";

interface Product {
  id: number | string;
  name: string;
  price_cny: number | null;
  source_link: string;
  quality?: string | null;
}

const qualityBadgeStyles: Record<string, string> = {
  best: "bg-[#1DB954]/15 text-[#1DB954]",
  good: "bg-[#F59E0B]/15 text-[#F59E0B]",
  budget: "bg-[#6C757D]/20 text-white",
};

interface BuyModalProps {
  product: Product | null;
  onClose: () => void;
  stats?: { likes: number; dislikes: number; views: number };
}

export default function BuyModal({ product, onClose, stats }: BuyModalProps) {
  const { prefs } = usePreferences();
  if (!product) return null;

  // Sort agents so preferred agent comes first
  const preferredKey = prefs.preferred_agent?.toLowerCase();
  const sortedAgents = [...agents].sort((a, b) => {
    const aMatch = a.name.toLowerCase().replace(/\s/g, "") === preferredKey ? -1 : 0;
    const bMatch = b.name.toLowerCase().replace(/\s/g, "") === preferredKey ? -1 : 0;
    return aMatch - bMatch;
  });

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-card border border-subtle bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-xl font-bold text-white">
                {product.name}
              </h2>
              {product.quality && qualityBadgeStyles[product.quality] && (
                <span
                  className={`shrink-0 rounded-pill px-2 py-0.5 text-[10px] font-medium ${qualityBadgeStyles[product.quality]}`}
                >
                  {product.quality}
                </span>
              )}
            </div>
            {product.price_cny != null ? (
              <p className="mt-1 text-lg font-semibold text-accent">
                ¥{product.price_cny}
              </p>
            ) : (
              <p className="mt-1 text-lg font-semibold text-text-muted">Multi</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary transition-colors hover:text-white"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {stats && (
          <div className="mb-4 flex items-center gap-3 rounded-btn bg-void px-3 py-2 text-[11px] text-[#6C757D]">
            <span className="flex items-center gap-1">
              <span>👍</span>
              <span>{stats.likes}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>👎</span>
              <span>{stats.dislikes}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>👁</span>
              <span>{stats.views}</span>
            </span>
          </div>
        )}

        {product.source_link ? (
          <p className="mb-3 text-xs text-text-muted">
            Buy this item through an agent:
          </p>
        ) : (
          <p className="mb-3 text-xs text-text-muted">
            No direct link available. Sign up with an agent:
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          {sortedAgents.map((agent) => {
            const hasLink = !!product.source_link;
            const url = hasLink
              ? agent.buildUrl(product.source_link)
              : agent.referralUrl;
            const isPreferred = agent.name.toLowerCase().replace(/\s/g, "") === preferredKey;
            return (
              <a
                key={agent.name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('agent_click', { product_id: Number(product.id), agent_name: agent.name })}
                className={`flex items-center justify-center gap-2 rounded-btn border px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:border-accent hover:shadow-[0_0_20px_rgba(254,66,5,0.15)] ${
                  isPreferred
                    ? "border-accent bg-accent/10"
                    : "border-subtle bg-void"
                }`}
              >
                {isPreferred && <span className="text-xs">{"\u2B50"}</span>}
                {agent.name}
                {isPreferred && <span className="text-[10px] text-accent">Your agent</span>}
                <svg className="h-3.5 w-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            );
          })}
        </div>

        <p className="mt-5 text-center text-xs text-text-muted">
          Don&apos;t have an agent yet? Sign up through our links to support
          MurmReps
        </p>
      </div>
    </div>
  );
}
