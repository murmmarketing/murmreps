"use client";

import { agents } from "@/lib/agents";

interface Product {
  id: string;
  name: string;
  price_cny: number;
  source_link: string;
}

interface BuyModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function BuyModal({ product, onClose }: BuyModalProps) {
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
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-white">
              {product.name}
            </h2>
            <p className="mt-1 text-lg font-semibold text-accent">
              ¥{product.price_cny}
            </p>
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
