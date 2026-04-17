import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Batch Comparisons — Budget vs Mid vs Top Tier",
  description:
    "Compare rep batches by price and quality. Find the right batch for Jordan 4, Nike Dunk, Yeezy 350, and more.",
  openGraph: {
    title: "Best Batch Comparisons — Budget vs Mid vs Top Tier | MurmReps",
    description:
      "Compare rep batches by price and quality. Budget, mid-tier, and best batch for the most popular shoes.",
  },
  alternates: { canonical: "/best-batch" },
};

const shoes = [
  { slug: "jordan-4", name: "Jordan 4", emoji: "🏀" },
  { slug: "nike-dunk", name: "Nike Dunk", emoji: "👟" },
  { slug: "jordan-1", name: "Jordan 1", emoji: "🏀" },
  { slug: "yeezy-350", name: "Yeezy 350", emoji: "🔥" },
  { slug: "new-balance-550", name: "New Balance 550", emoji: "⚡" },
  { slug: "air-force-1", name: "Air Force 1", emoji: "✈️" },
  { slug: "jordan-11", name: "Jordan 11", emoji: "🏀" },
  { slug: "nike-air-max", name: "Nike Air Max", emoji: "💨" },
  { slug: "balenciaga-runner", name: "Balenciaga Runner", emoji: "🏃" },
  { slug: "dior-b22", name: "Dior B22", emoji: "💎" },
];

export default function BestBatchIndex() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Best Batch Comparisons
      </h1>
      <p className="mt-2 text-lg text-text-secondary">
        Budget vs mid-tier vs best batch for the most popular shoes. Find the
        right tier for your budget.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shoes.map((shoe) => (
          <Link
            key={shoe.slug}
            href={`/best-batch/${shoe.slug}`}
            className="group flex items-center gap-4 rounded-card border border-subtle bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-[0_0_20px_rgba(254,66,5,0.08)]"
          >
            <span className="text-3xl">{shoe.emoji}</span>
            <div>
              <h2 className="font-heading text-base font-semibold text-white group-hover:text-accent transition-colors">
                {shoe.name}
              </h2>
              <p className="mt-0.5 text-xs text-text-muted">
                Budget · Mid · Best Batch
              </p>
            </div>
            <svg
              className="ml-auto h-4 w-4 text-text-muted transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
