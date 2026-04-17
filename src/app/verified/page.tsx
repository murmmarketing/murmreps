import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verified Finds \u2014 QC Proven Products",
  description:
    "Quality-checked rep finds with real QC photos. Only the best verified products make this list.",
  openGraph: {
    title: "Verified Finds \u2014 QC Proven Products",
    description:
      "Quality-checked rep finds with real QC photos. Only the best verified products make this list.",
    url: "/verified",
  },
  twitter: {
    title: "Verified Finds \u2014 QC Proven Products",
    description:
      "Quality-checked rep finds with real QC photos. Only the best verified products make this list.",
  },
  alternates: { canonical: "/verified" },
};

export default function VerifiedPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
      {/* Heading */}
      <h1 className="flex items-center gap-3 font-heading text-[32px] font-bold tracking-tight text-white">
        Murm Verified
        <span className="text-3xl" aria-label="verified">
          &#x2705;
        </span>
      </h1>

      {/* Coming Soon badge */}
      <span className="mt-4 inline-block rounded-full bg-accent px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
        Coming Soon
      </span>

      {/* Description */}
      <p className="mt-6 max-w-md text-base leading-relaxed text-text-secondary">
        Hand-picked items, personally bought and reviewed by Murm. First
        verified drops arriving soon.
      </p>

      {/* Discord CTA */}
      <a
        href="https://discord.gg/8r5EFMRg"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
        Want to be notified? Join our Discord
      </a>

      {/* Preview mockup card */}
      <div className="mt-14 w-full max-w-xs opacity-60">
        <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414]">
          {/* Verified badge */}
          <div className="relative flex h-48 items-center justify-center bg-[#1a1a1a]">
            <svg
              className="h-16 w-16 text-text-muted/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#1DB954]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#1DB954]">
              &#x2705; Murm Verified
            </span>
          </div>
          <div className="p-4 text-left">
            <h3 className="text-sm font-semibold text-white">
              Sample Verified Item
            </h3>
            <div className="mt-1.5 flex items-center gap-0.5 text-[#F59E0B]">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg
                  key={i}
                  className={`h-3.5 w-3.5 ${i <= 4 ? "fill-current" : "fill-none stroke-current"}`}
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              ))}
            </div>
            <p className="mt-2 font-heading text-base font-bold text-white">
              &yen;299
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
