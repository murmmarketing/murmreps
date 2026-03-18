import type { Metadata } from "next";
import Link from "next/link";
import PopularFinds from "@/components/PopularFinds";
import Typewriter from "@/components/Typewriter";

export const metadata: Metadata = {
  title: "MurmReps \u2014 Find the Best Reps, All in One Place",
  description:
    "Browse 2000+ verified rep finds with QC reviews and buy links across 8 agents. Shoes, streetwear, bags, and jewelry all in one place.",
  openGraph: {
    title: "MurmReps \u2014 Find the Best Reps, All in One Place",
    description:
      "Browse 2000+ verified rep finds with QC reviews and buy links across 8 agents.",
    url: "/",
  },
  twitter: {
    title: "MurmReps \u2014 Find the Best Reps, All in One Place",
    description:
      "Browse 2000+ verified rep finds with QC reviews and buy links across 8 agents.",
  },
  alternates: { canonical: "/" },
};

const features = [
  {
    title: "Products",
    description:
      "Search 2000+ finds across shoes, streetwear, bags, and jewelry",
    href: "/products",
    external: false,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    title: "Link converter",
    description:
      "Convert any Taobao/Weidian/1688 link to all 8 agents instantly",
    href: "/converter",
    external: false,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.44a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L5.25 9.503" />
      </svg>
    ),
  },
  {
    title: "QC photos",
    description: "Real photos from real purchases. No stock images.",
    href: "/verified",
    external: false,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
  },
  {
    title: "Verified items",
    description: "Hand-picked items personally bought and reviewed",
    href: "/verified",
    external: false,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    title: "Parcel tracking",
    description: "Track your orders from any carrier in one place",
    href: "/tracking",
    external: false,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    title: "Community",
    description:
      "Join the @murmreps community on Discord and Instagram",
    href: "https://discord.gg/murmreps",
    external: true,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MurmReps",
  url: "https://murmreps.com",
  logo: "https://murmreps.com/favicon.svg",
  sameAs: [
    "https://instagram.com/murmreps",
    "https://tiktok.com/@murmreps",
  ],
  description:
    "Find the best reps, all in one place. 2000+ verified products with QC reviews and buy links across 8 agents.",
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface/50 to-void" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-6xl">
              Find the best reps,{" "}
              <span className="text-accent">all in one place.</span>
            </h1>
            <Typewriter />
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex h-12 items-center rounded-btn bg-accent px-8 font-heading text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(254,66,5,0.15)]"
              >
                Explore products
              </Link>
              <Link
                href="/converter"
                className="inline-flex h-12 items-center rounded-btn border border-accent px-8 font-heading text-sm font-semibold text-accent transition-all duration-200 hover:bg-accent/10"
              >
                Link converter
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 flex max-w-lg items-center justify-center divide-x divide-subtle">
            {[
              { value: "2000+", label: "Products" },
              { value: "8", label: "Agents" },
              { value: "Weekly", label: "Updates" },
            ].map((stat) => (
              <div key={stat.label} className="px-6 text-center sm:px-10">
                <p className="font-heading text-2xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular finds carousel */}
      <PopularFinds />

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const cardContent = (
              <>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-btn bg-accent/10 text-accent">
                  {feature.icon}
                </div>
                <h3 className="font-heading text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </>
            );

            const className =
              "group block rounded-card border border-subtle bg-surface p-6 transition-all duration-200 hover:border-accent/20 hover:shadow-[0_0_20px_rgba(254,66,5,0.05)]";

            if (feature.external) {
              return (
                <a
                  key={feature.title}
                  href={feature.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <Link
                key={feature.title}
                href={feature.href}
                className={className}
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
