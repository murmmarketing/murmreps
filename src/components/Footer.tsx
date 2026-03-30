import Link from "next/link";

const productLinks = [
  { label: "All Products", href: "/products" },
  { label: "Shoes", href: "/products?category=Shoes" },
  { label: "Streetwear", href: "/products?category=Streetwear" },
  { label: "Bags & Acc", href: "/products?category=Bags+%26+Acc" },
  { label: "Jewelry", href: "/products?category=Jewelry" },
  { label: "Deals", href: "/deals" },
];

const toolLinks = [
  { label: "Link Converter", href: "/converter" },
  { label: "QC Checker", href: "/qc" },
  { label: "Agent Comparison", href: "/agents" },
  { label: "Parcel Tracking", href: "/tracking" },
  { label: "Image Search", href: "/image-search" },
  { label: "Beginner Guide", href: "/guide" },
];

const communityLinks = [
  { label: "Reddit (r/MurmReps)", href: "https://reddit.com/r/MurmReps" },
  { label: "Discord", href: "https://discord.gg/8r5EFMRg" },
  { label: "TikTok", href: "https://tiktok.com/@murmreps" },
  { label: "Instagram", href: "https://instagram.com/murmreps" },
];

export default function Footer() {
  return (
    <footer className="border-t border-subtle bg-void">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 — Brand */}
          <div>
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="MurmReps"
                className="footer-logo-default h-7 w-auto object-contain"
              />
              <img
                src="/logo-pink.png"
                alt="MurmReps"
                className="footer-logo-pink hidden h-7 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 text-[13px] leading-relaxed text-text-secondary">
              The rep community&apos;s most trusted source.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a href="https://tiktok.com/@murmreps" target="_blank" rel="noopener noreferrer" className="text-text-muted transition-colors hover:text-accent">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.28 8.28 0 005.58 2.16v-3.44a4.85 4.85 0 01-3.77-1.7v-3.33h3.77z" /></svg>
              </a>
              <a href="https://instagram.com/murmreps" target="_blank" rel="noopener noreferrer" className="text-text-muted transition-colors hover:text-accent">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
              <a href="https://discord.gg/8r5EFMRg" target="_blank" rel="noopener noreferrer" className="text-text-muted transition-colors hover:text-accent">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
              </a>
              <a href="https://reddit.com/r/MurmReps" target="_blank" rel="noopener noreferrer" className="text-text-muted transition-colors hover:text-accent">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 000-.463.327.327 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z" /></svg>
              </a>
            </div>
          </div>

          {/* Column 2 — Products */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[1px] text-white">
              Products
            </h4>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Tools */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[1px] text-white">
              Tools
            </h4>
            <ul className="mt-4 space-y-2.5">
              {toolLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Community */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[1px] text-white">
              Community
            </h4>
            <ul className="mt-4 space-y-2.5">
              {communityLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-text-secondary transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <p className="text-[13px] font-medium text-text-secondary">
                Stay updated
              </p>
              <div className="mt-2 flex gap-2">
                <input
                  type="email"
                  placeholder="Email address"
                  className="min-w-0 flex-1 rounded-btn border border-subtle bg-surface px-3 py-2 text-sm text-white placeholder-text-muted outline-none transition-colors focus:border-accent/50"
                />
                <button className="shrink-0 rounded-btn bg-accent px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_var(--accent-glow)]">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[rgba(255,255,255,0.06)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 sm:flex-row sm:px-6">
          <p className="text-xs text-text-muted">
            &copy; 2026 MurmReps. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
            <span>Educational purposes only. MurmReps does not sell products.</span>
            <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
