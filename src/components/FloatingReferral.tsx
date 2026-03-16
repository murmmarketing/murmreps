"use client";

export default function FloatingReferral() {
  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <a
        href="https://ikako.vip/r/6gkjt"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-[0_0_24px_rgba(255,107,53,0.4)] sm:h-12 sm:w-12 animate-pulse-once"
      >
        <span className="font-heading text-[16px] font-black leading-none sm:text-[18px]">
          M
        </span>

        {/* Tooltip */}
        <span className="pointer-events-none absolute bottom-full right-0 mb-2.5 whitespace-nowrap rounded-pill bg-surface px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
          Sign up for KakoBuy — Get $400 in coupons
        </span>
      </a>
    </div>
  );
}
