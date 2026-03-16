"use client";

import { useState } from "react";
import { agents } from "@/lib/agents";

export default function ConverterPage() {
  const [url, setUrl] = useState("");
  const [converted, setConverted] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleConvert = () => {
    if (url.trim()) setConverted(true);
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Link converter
      </h1>
      <p className="mt-3 text-text-secondary">
        Paste any Taobao, Weidian, or 1688 link and get buy links for all 8
        agents
      </p>

      <div className="mt-8 flex gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.44a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L5.25 9.503"
            />
          </svg>
          <input
            type="text"
            placeholder="Paste Taobao, Weidian, or 1688 link..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setConverted(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleConvert()}
            className="w-full rounded-card border border-subtle bg-surface py-3 pl-12 pr-4 text-sm text-white placeholder-text-muted outline-none transition-colors focus:border-accent/50"
          />
        </div>
        <button
          onClick={handleConvert}
          disabled={!url.trim()}
          className="shrink-0 rounded-btn bg-accent px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,107,53,0.15)] disabled:opacity-40"
        >
          Convert
        </button>
      </div>

      {converted && url.trim() && (
        <div className="mt-8 space-y-3">
          {agents.map((agent, idx) => {
            const agentUrl = agent.buildUrl(url.trim());
            return (
              <div
                key={agent.name}
                className="flex items-center gap-3 rounded-card border border-subtle bg-surface p-4"
              >
                <span className="shrink-0 font-heading text-sm font-semibold text-white">
                  {agent.name}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-text-muted">
                  {agentUrl}
                </span>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => copyToClipboard(agentUrl, idx)}
                    className={`rounded-btn px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      copiedIdx === idx
                        ? "bg-verified/20 text-verified"
                        : "border border-subtle text-text-secondary hover:border-accent hover:text-accent"
                    }`}
                  >
                    {copiedIdx === idx ? "Copied!" : "Copy"}
                  </button>
                  <a
                    href={agentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-btn border border-subtle px-3 py-1.5 text-xs font-medium text-text-secondary transition-all duration-200 hover:border-accent hover:text-accent"
                  >
                    Open
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Referral signup section */}
      <div className="mt-12 rounded-card border border-subtle bg-surface p-6">
        <h2 className="font-heading text-lg font-semibold text-white">
          New to agents?
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Sign up through these links to support MurmReps
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {agents.map((agent) => (
            <a
              key={agent.name}
              href={agent.referralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-btn border border-subtle bg-void px-4 py-2.5 text-xs font-medium text-white transition-all duration-200 hover:border-accent hover:shadow-[0_0_20px_rgba(255,107,53,0.15)]"
            >
              {agent.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
