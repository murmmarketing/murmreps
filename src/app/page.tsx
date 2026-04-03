import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import HeroSection from "@/components/HeroSection";

const PopularFinds = dynamic(() => import("@/components/PopularFinds"), {
  ssr: false,
  loading: () => <div className="h-[400px]" />,
});

const HomeSections = dynamic(() => import("@/components/HomeSections"), {
  ssr: false,
  loading: () => <div className="py-16" />,
});

const HomeFAQ = dynamic(() => import("@/components/HomeFAQ"), { ssr: false });

export const metadata: Metadata = {
  title: "MurmReps \u2014 Find the Best Rep Finds | 15,000+ Products",
  description:
    "Discover 15,000+ handpicked rep finds with QC photos. Free link converter for 8 shopping agents. New drops every week.",
  keywords: "reps, replica fashion, rep finds, weidian finds, taobao finds, fashion reps, best reps, QC photos",
  openGraph: {
    title: "MurmReps \u2014 Find the Best Rep Finds | 15,000+ Products",
    description:
      "Discover 15,000+ handpicked rep finds with QC photos. Free link converter for 8 shopping agents.",
    url: "/",
  },
  twitter: {
    title: "MurmReps \u2014 Find the Best Rep Finds | 15,000+ Products",
    description:
      "Discover 15,000+ handpicked rep finds with QC photos. Free link converter for 8 shopping agents.",
  },
  alternates: { canonical: "/" },
};


const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MurmReps",
  url: "https://murmreps.com",
  description:
    "Discover 15,000+ handpicked rep finds with QC photos. Free link converter for 8 shopping agents. New drops every week.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://murmreps.com/products?search={search_term_string}",
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "MurmReps",
    url: "https://murmreps.com",
    logo: "https://murmreps.com/favicon.svg",
    sameAs: [
      "https://instagram.com/murmreps",
      "https://tiktok.com/@murmreps",
    ],
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <HeroSection />

      {/* Popular finds carousel */}
      <PopularFinds />

      {/* Editorial brand rows & curated sections */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <HomeSections />
      </section>

      {/* FAQ */}
      <HomeFAQ />

      {/* Bento features */}
      <section className="mx-auto max-w-7xl overflow-hidden px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-4">
          {/* Row 1: Large + Medium */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
            <Link
              href="/products"
              className="group relative min-h-[240px] overflow-hidden rounded-xl bg-[#141414] p-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(254,66,5,0.15)]"
              style={{ border: "1px solid transparent", backgroundImage: "linear-gradient(#141414, #141414), linear-gradient(135deg, rgba(254,66,5,0.3), transparent 60%)", backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box" }}
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-semibold text-white">Products</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
                15,000+ verified finds across shoes, streetwear, bags, and jewelry. See before you buy.
              </p>
            </Link>
            <Link
              href="/converter"
              className="group rounded-xl border border-subtle bg-[#141414] p-8 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-[0_0_20px_rgba(254,66,5,0.15)]"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.44a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L5.25 9.503" />
                </svg>
              </div>
              <h3 className="font-heading text-base font-semibold text-white">Link converter</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Paste any link, get all 8 agents instantly.
              </p>
            </Link>
          </div>

          {/* Row 2: Three equal */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/qc"
              className="group rounded-xl border border-subtle bg-[#141414] p-8 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-[0_0_20px_rgba(254,66,5,0.15)]"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-base font-semibold text-white">QC Photos</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Every. Single. Item. Real photos, no stock images.
              </p>
            </Link>
            <Link
              href="/verified"
              className="group rounded-xl border border-subtle bg-[#141414] p-8 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-[0_0_20px_rgba(254,66,5,0.15)]"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <h3 className="font-heading text-base font-semibold text-white">Verified items</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Hand-picked by Murm. Personally bought and reviewed.
              </p>
            </Link>
            <Link
              href="/tracking"
              className="group rounded-xl border border-subtle bg-[#141414] p-8 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-[0_0_20px_rgba(254,66,5,0.15)]"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <h3 className="font-heading text-base font-semibold text-white">Parcel tracking</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Track your haul from warehouse to doorstep.
              </p>
            </Link>
          </div>

          {/* Row 3: Full width community */}
          <div className="rounded-xl border border-subtle bg-[#141414] p-8 transition-all duration-200 hover:border-accent/20 hover:shadow-[0_0_20px_rgba(254,66,5,0.15)]">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-5">
                <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold text-white">Community</h3>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                    Join r/MurmReps and 15,000+ rep enthusiasts
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://discord.gg/8r5EFMRg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-btn border border-subtle bg-void px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:border-[#5865F2]/50 hover:text-[#5865F2]"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
                  Discord
                </a>
                <a
                  href="https://reddit.com/r/MurmReps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-btn border border-subtle bg-void px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:border-[#FF4500]/50 hover:text-[#FF4500]"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 000-.463.327.327 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z"/></svg>
                  Reddit
                </a>
                <a
                  href="https://instagram.com/murmreps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-btn border border-subtle bg-void px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:border-[#E1306C]/50 hover:text-[#E1306C]"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
