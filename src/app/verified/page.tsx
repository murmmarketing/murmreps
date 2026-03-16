import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Murm Verified \u2014 Personally Reviewed Rep Finds | MurmReps",
  description:
    "Hand-picked rep items personally bought, received, and reviewed by the MurmReps team. Only the best quality makes the cut.",
  openGraph: {
    title: "Murm Verified \u2014 Personally Reviewed Rep Finds | MurmReps",
    description:
      "Hand-picked rep items personally bought, received, and reviewed by the MurmReps team.",
    url: "/verified",
  },
  twitter: {
    title: "Murm Verified \u2014 Personally Reviewed Rep Finds | MurmReps",
    description:
      "Hand-picked rep items personally bought, received, and reviewed by the MurmReps team.",
  },
  alternates: { canonical: "/verified" },
};

export default function VerifiedPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
        <svg
          className="h-10 w-10 text-accent"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      </div>

      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Murm Verified
      </h1>
      <p className="mt-4 text-lg text-text-secondary">
        Every item here I personally bought, received, and reviewed. No cap.
      </p>

      <div className="mt-8 rounded-card border border-subtle bg-surface px-8 py-6">
        <p className="font-heading text-sm font-semibold text-accent">
          Coming soon
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          First verified items dropping soon. Follow @murmreps for updates.
        </p>
      </div>

      <div className="mt-8 flex gap-4">
        <a
          href="https://instagram.com/murmreps"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-btn bg-surface px-5 text-sm font-medium text-white transition-all duration-200 hover:bg-accent/10 hover:text-accent"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          Instagram
        </a>
        <a
          href="https://tiktok.com/@murmreps"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-btn bg-surface px-5 text-sm font-medium text-white transition-all duration-200 hover:bg-accent/10 hover:text-accent"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.28 8.28 0 005.58 2.16v-3.44a4.85 4.85 0 01-3.77-1.7v-3.33h3.77z" />
          </svg>
          TikTok
        </a>
      </div>
    </div>
  );
}
