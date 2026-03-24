"use client";

export default function FloatingReferral() {
  return (
    <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 md:flex">
      {/* TikTok */}
      <a
        href="https://tiktok.com/@murmreps"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#141414] text-white transition-all duration-200 hover:scale-110 hover:shadow-[0_0_16px_rgba(255,255,255,0.25)]"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.4a8.16 8.16 0 004.76 1.52V7.47a4.85 4.85 0 01-1-.78z" />
        </svg>
      </a>

      {/* Instagram */}
      <a
        href="https://instagram.com/murmreps"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#141414] text-white transition-all duration-200 hover:scale-110 hover:shadow-[0_0_16px_rgba(225,48,108,0.4)]"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </a>

      {/* Discord */}
      <a
        href="https://discord.gg/8r5EFMRg"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discord"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#141414] text-white transition-all duration-200 hover:scale-110 hover:shadow-[0_0_16px_rgba(88,101,242,0.4)]"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      </a>

      {/* KakoBuy referral CTA */}
      <a
        href="https://ikako.vip/r/6gkjt"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Sign up for KakoBuy"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-accent font-heading text-xs font-bold text-white transition-all duration-200 hover:scale-110 hover:shadow-[0_0_16px_var(--accent-glow-strong)]"
      >
        KKB
      </a>
    </div>
  );
}
