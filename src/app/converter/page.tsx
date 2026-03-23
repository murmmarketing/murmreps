"use client";

import { useState, useEffect } from "react";
import { agents, parseSourceLink } from "@/lib/agents";
import { trackEvent } from "@/lib/track";
import { supabase, type Product } from "@/lib/supabase";
import { usePreferences } from "@/lib/usePreferences";

/* ── sparkle positions ── */
const sparkles = [
  { top: "12%", left: "8%", duration: "4s", delay: "0s" },
  { top: "18%", left: "85%", duration: "5.5s", delay: "1.2s" },
  { top: "6%", left: "42%", duration: "3.5s", delay: "0.4s" },
  { top: "25%", left: "68%", duration: "6s", delay: "2s" },
  { top: "10%", left: "25%", duration: "4.8s", delay: "0.8s" },
  { top: "22%", left: "52%", duration: "7s", delay: "1.6s" },
  { top: "15%", left: "92%", duration: "3.2s", delay: "2.5s" },
  { top: "8%", left: "75%", duration: "5s", delay: "0.2s" },
];

export default function ConverterPage() {
  const { formatPrice } = usePreferences();
  const [url, setUrl] = useState("");
  const [converted, setConverted] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  /* Reset product when URL changes */
  useEffect(() => {
    setProduct(null);
  }, [url]);

  const handleConvert = async () => {
    if (!url.trim()) return;
    setConverted(true);

    /* detect platform */
    const { platform, itemId } = parseSourceLink(url.trim());
    const source = platform ?? "unknown";
    trackEvent("converter_use", { metadata: { source } });

    /* try to find product in Supabase */
    if (itemId) {
      setLoadingProduct(true);
      try {
        const { data } = await supabase
          .from("products")
          .select("*")
          .ilike("source_link", `%${itemId}%`)
          .limit(1)
          .single();
        if (data) setProduct(data as Product);
      } catch {
        /* no match — fine */
      } finally {
        setLoadingProduct(false);
      }
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const copyAllLinks = () => {
    const lines = agents
      .map((a) => `${a.name}: ${a.buildUrl(url.trim())}`)
      .join("\n");
    navigator.clipboard.writeText(lines);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  return (
    <>
      {/* sparkle keyframes */}
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.08; }
        }
      `}</style>

      <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
        {/* ── HERO ── */}
        <section
          className="relative overflow-hidden pt-16 pb-8 text-center"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(254,66,5,0.12) 0%, transparent 60%), #0a0a0a",
          }}
        >
          {/* sparkle dots */}
          {sparkles.map((s, i) => (
            <span
              key={i}
              className="pointer-events-none absolute rounded-full"
              style={{
                top: s.top,
                left: s.left,
                width: 2,
                height: 2,
                background: "#fff",
                opacity: 0.03,
                animation: `sparkle ${s.duration} ease-in-out ${s.delay} infinite`,
              }}
            />
          ))}

          <h1
            className="mx-auto text-4xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
          >
            Link Utility Tool
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-base" style={{ color: "#9CA3AF" }}>
            Convert any product link to all 8 agents. View QC photos and product
            details.
          </p>
        </section>

        {/* ── FEATURE PILLS ── */}
        <section className="mx-auto mt-6 max-w-3xl px-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Product Info */}
            <div
              className="rounded-xl p-5 text-center"
              style={{
                background: "#141414",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FE4205"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">Product Info</p>
              <p className="mt-1 text-xs" style={{ color: "#9CA3AF" }}>
                Read information about the product before you buy
              </p>
            </div>

            {/* QC Checker */}
            <div
              className="rounded-xl p-5 text-center"
              style={{
                background: "#141414",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FE4205"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">QC Checker</p>
              <p className="mt-1 text-xs" style={{ color: "#9CA3AF" }}>
                Check if your product has QC photos available
              </p>
            </div>

            {/* Link Converter */}
            <div
              className="rounded-xl p-5 text-center"
              style={{
                background: "#141414",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FE4205"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">Link Converter</p>
              <p className="mt-1 text-xs" style={{ color: "#9CA3AF" }}>
                Turn any product link into your preferred agent link
              </p>
            </div>
          </div>
        </section>

        {/* ── CONVERTER FORM ── */}
        <section className="mx-auto mt-8 max-w-2xl px-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Search or paste link..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setConverted(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleConvert()}
              className="h-14 flex-1 rounded-xl px-5 text-lg text-white placeholder-gray-500 outline-none transition-colors"
              style={{
                background: "#141414",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "#FE4205")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")
              }
            />
            <button
              onClick={handleConvert}
              disabled={!url.trim()}
              className="h-14 shrink-0 rounded-xl px-8 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: "#FE4205" }}
            >
              Convert
            </button>
          </div>
        </section>

        {/* ── RESULTS ── */}
        {converted && url.trim() && (
          <section
            className="mx-auto mt-8 max-w-2xl px-4 pb-16"
            style={{
              animation: "fadeIn 0.3s ease-out",
            }}
          >
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            {/* Product card (if matched) */}
            {loadingProduct && (
              <div className="mb-6 flex items-center gap-3 rounded-xl p-4" style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="h-20 w-20 animate-pulse rounded-lg" style={{ background: "#1f1f1f" }} />
                <div className="space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded" style={{ background: "#1f1f1f" }} />
                  <div className="h-3 w-24 animate-pulse rounded" style={{ background: "#1f1f1f" }} />
                </div>
              </div>
            )}

            {product && !loadingProduct && (
              <div
                className="mb-6 flex items-center gap-4 rounded-xl p-4"
                style={{
                  background: "#141414",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-20 w-20 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {product.name}
                  </p>
                  {product.price_cny != null && (
                    <p className="mt-0.5 text-sm" style={{ color: "#FE4205" }}>
                      {formatPrice(product as { price_cny?: number | null; price_usd?: number | null; price_eur?: number | null })}
                    </p>
                  )}
                  {product.category && (
                    <span
                      className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        background: "rgba(254,66,5,0.1)",
                        color: "#FE4205",
                      }}
                    >
                      {product.category}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Copy all header */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Agent Links</p>
              <button
                onClick={copyAllLinks}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: copiedAll ? "#22c55e" : "#9CA3AF",
                }}
              >
                {copiedAll ? "Copied!" : "Copy all links"}
              </button>
            </div>

            {/* Agent links grid */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {agents.map((agent, idx) => {
                const agentUrl = agent.buildUrl(url.trim());
                return (
                  <div
                    key={agent.name}
                    className="group rounded-xl p-4 transition-colors"
                    style={{
                      background: "#141414",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(254,66,5,0.2)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.06)")
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-white">
                          {agent.name}
                        </span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#9CA3AF"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(agentUrl, idx)}
                          className="rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
                          style={{
                            border: "1px solid rgba(255,255,255,0.1)",
                            color:
                              copiedIdx === idx ? "#22c55e" : "#9CA3AF",
                          }}
                        >
                          {copiedIdx === idx ? "Copied!" : "Copy"}
                        </button>
                        <a
                          href={agentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg px-2.5 py-1 text-xs font-medium"
                          style={{ color: "#FE4205" }}
                        >
                          Open
                        </a>
                      </div>
                    </div>
                    <p
                      className="mt-2 truncate text-xs"
                      style={{ color: "#9CA3AF" }}
                    >
                      {agentUrl}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
