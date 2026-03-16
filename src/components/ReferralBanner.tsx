"use client";

import { useState, useEffect } from "react";
import { agents } from "@/lib/agents";

export default function ReferralBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem("referral-banner-dismissed") === "1");
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("referral-banner-dismissed", "1");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="sticky top-0 z-[60] flex h-10 items-center border-b border-[rgba(255,255,255,0.06)] bg-surface">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <span className="shrink-0 text-xs font-semibold text-white">
          Sign up:
        </span>
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2">
            {agents.map((agent) => (
              <a
                key={agent.name}
                href={agent.referralUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`shrink-0 rounded-pill px-3 py-1 text-xs font-medium text-white transition-colors duration-200 hover:bg-accent ${
                  agent.name === "KakoBuy"
                    ? "border border-accent bg-[rgba(255,255,255,0.06)]"
                    : "bg-[rgba(255,255,255,0.06)]"
                }`}
              >
                {agent.name}
              </a>
            ))}
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 text-text-muted transition-colors duration-200 hover:text-white"
          aria-label="Dismiss banner"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
