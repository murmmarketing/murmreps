"use client";

import { useState } from "react";

const qcAgents = [
  {
    name: "KakoBuy",
    buildUrl: (url: string) =>
      `https://www.kakobuy.com/item/detail?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Superbuy",
    buildUrl: (url: string) =>
      `https://www.superbuy.com/en/page/buy?url=${encodeURIComponent(url)}`,
  },
  {
    name: "CnFans",
    buildUrl: (url: string) =>
      `https://cnfans.com/product/?url=${encodeURIComponent(url)}`,
  },
  {
    name: "ACBuy",
    buildUrl: (url: string) =>
      `https://www.acbuy.com/product?url=${encodeURIComponent(url)}`,
  },
  {
    name: "MuleBuy",
    buildUrl: (url: string) =>
      `https://mulebuy.com/product/?url=${encodeURIComponent(url)}`,
  },
  {
    name: "LoveGoBuy",
    buildUrl: (url: string) =>
      `https://www.lovegobuy.com/product?url=${encodeURIComponent(url)}`,
  },
];

export default function QCPage() {
  const [link, setLink] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = () => {
    const trimmed = link.trim();
    if (!trimmed) return;
    setSubmitted(trimmed);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Heading */}
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        <span className="text-white">QC photo checker </span>
        <span className="text-accent">before you buy.</span>
      </h1>
      <p className="mt-3 text-text-secondary">
        Paste any Taobao, Weidian, or 1688 product link to find QC photos from
        other buyers.
      </p>

      {/* Input row */}
      <div className="mt-8 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Paste product link..."
            className="w-full rounded-card border border-subtle bg-surface py-3.5 pl-4 pr-12 text-sm text-white placeholder-text-muted outline-none transition-colors focus:border-accent/50"
          />
          {link.trim() && (
            <button
              onClick={handleCopy}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-white"
              aria-label="Copy link"
            >
              {copied ? (
                <svg
                  className="h-4 w-4 text-verified"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
        <button
          onClick={handleSubmit}
          className="shrink-0 rounded-btn bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,107,53,0.15)]"
        >
          Check QC
        </button>
      </div>

      {/* Results */}
      {submitted && (
        <div className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-white">
            QC photos via agents
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {qcAgents.map((agent) => (
              <a
                key={agent.name}
                href={agent.buildUrl(submitted)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-card border border-[rgba(255,255,255,0.06)] bg-[#141414] px-5 py-4 transition-all duration-200 hover:border-accent/40 hover:shadow-[0_0_20px_rgba(255,107,53,0.05)]"
              >
                <span className="font-heading text-sm font-semibold text-white">
                  {agent.name}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-accent">
                  View QC photos
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </span>
              </a>
            ))}
          </div>

          <p className="mt-8 rounded-card border border-subtle bg-surface px-5 py-4 text-xs leading-relaxed text-text-muted">
            QC photos are taken by the agent&apos;s warehouse after your item
            arrives. Check stitching, tags, shape, and color before shipping. Not
            all items will have QC photos available.
          </p>
        </div>
      )}
    </div>
  );
}
