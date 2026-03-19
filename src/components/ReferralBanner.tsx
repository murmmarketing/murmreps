"use client";

import { useState, useEffect, useRef } from "react";
import { agents } from "@/lib/agents";

export default function ReferralBanner() {
  const [dismissed, setDismissed] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDismissed(sessionStorage.getItem("referral-banner-dismissed") === "1");
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const handleDismiss = () => {
    sessionStorage.setItem("referral-banner-dismissed", "1");
    setDismissed(true);
  };

  if (dismissed) return null;

  const tickerText =
    "\u{1F525} New verified drops every week \u2022 2000+ products tracked \u2022 Join r/MurmReps \u2022 Free link converter for 8 agents \u2022 QC photos before you buy \u{1F525}";

  return (
    <div className="sticky top-0 z-[60] flex h-8 items-center border-b border-[rgba(255,255,255,0.06)] bg-[#141414]">
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          animation: ticker-scroll 30s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Ticker area */}
      <div className="flex-1 overflow-hidden">
        <div className="ticker-track flex w-max items-center whitespace-nowrap">
          <span className="px-8 text-xs text-[#9CA3AF]">{tickerText}</span>
          <span className="px-8 text-xs text-[#9CA3AF]">{tickerText}</span>
        </div>
      </div>

      {/* Fixed right section */}
      <div className="relative flex shrink-0 items-center gap-2 border-l border-[rgba(255,255,255,0.06)] bg-[#141414] px-3" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent/80"
        >
          Sign up
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 min-w-[200px] overflow-hidden rounded-[12px] border border-subtle bg-[#141414] py-1 shadow-xl">
            {agents.map((agent) => (
              <a
                key={agent.name}
                href={agent.referralUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-2.5 text-sm text-white transition-colors hover:bg-accent/10 hover:text-accent"
              >
                {agent.name}
                <svg className="h-3 w-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            ))}
          </div>
        )}

        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 text-text-muted transition-colors duration-200 hover:text-white"
          aria-label="Dismiss banner"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
