"use client";

import { agents } from "@/lib/agents";

interface Product {
  id: string;
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
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
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
              <p className="mt-1 text-sm text-text-muted">Price not listed</p>
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

        <div className="grid grid-cols-2 gap-3">
          {agents.map((agent) => {
            const url = product.source_link
              ? agent.buildUrl(product.source_link)
              : agent.referralUrl;
            return (
              <a
                key={agent.name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-btn border border-subtle bg-void px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:border-accent hover:shadow-[0_0_20px_rgba(255,107,53,0.15)]"
              >
                {agent.name}
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
