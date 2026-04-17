"use client";

import { useState, useEffect } from "react";

export default function StickyBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const dismissedAt = localStorage.getItem("murmreps_banner_dismissed");
    if (dismissedAt) {
      const diff = Date.now() - Number(dismissedAt);
      if (diff < 7 * 24 * 60 * 60 * 1000) return;
    }
    setDismissed(false);
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem("murmreps_banner_dismissed", String(Date.now()));
    setVisible(false);
    setDismissed(true);
  };

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2 text-white">
      <span className="text-sm font-medium">
        🎁 Sign up with KakoBuy and get exclusive coupons
      </span>
      <a
        href="https://ikako.vip/r/6gkjt"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-white px-3 py-1 text-sm font-bold text-black transition-colors hover:bg-gray-200"
      >
        Claim Now →
      </a>
      <button
        onClick={dismiss}
        className="absolute right-2 text-white/60 transition-colors hover:text-white"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
