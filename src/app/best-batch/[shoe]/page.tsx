import { supabase, type Product } from "@/lib/supabase";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

interface ShoeConfig {
  slug: string;
  name: string;
  searchTerm: string;
  intro: string;
  related: string[];
}

const shoeConfigs: ShoeConfig[] = [
  {
    slug: "jordan-4",
    name: "Jordan 4",
    searchTerm: "jordan 4",
    intro: "The Air Jordan 4 is one of the most repped sneakers ever. From Military Black to Thunder, the range of batches is huge. Budget pairs start around ¥100 and get the silhouette right, while best batch versions nail the netting, tongue shape, and materials down to retail-level accuracy.",
    related: ["jordan-1", "jordan-11", "nike-dunk"],
  },
  {
    slug: "nike-dunk",
    name: "Nike Dunk",
    searchTerm: "dunk",
    intro: "Nike Dunks are everywhere, and rep factories have perfected them across all price ranges. Budget Dunks are solid beaters, mid-tier gets you accurate swooshes and leather, and best batch is virtually indistinguishable from retail.",
    related: ["air-force-1", "jordan-1", "nike-air-max"],
  },
  {
    slug: "jordan-1",
    name: "Jordan 1",
    searchTerm: "jordan 1",
    intro: "The Jordan 1 is the most iconic sneaker of all time and one of the most repped. Budget batches nail the shape, mid-tier gets the leather quality right, and best batch versions have correct tumbling, hourglass shape, and wing logo placement.",
    related: ["jordan-4", "jordan-11", "nike-dunk"],
  },
  {
    slug: "yeezy-350",
    name: "Yeezy 350",
    searchTerm: "yeezy 350",
    intro: "Yeezy 350 V2s have been repped for years and the quality across all tiers is excellent. Even budget batches have good Boost comfort. The main differences between tiers are knit pattern accuracy, pull tab placement, and sole translucency.",
    related: ["yeezy-350", "new-balance-550", "nike-air-max"],
  },
  {
    slug: "new-balance-550",
    name: "New Balance 550",
    searchTerm: "new balance 550",
    intro: "The NB 550 has surged in popularity and rep factories have caught up. Budget pairs get the bulky retro shape right, while best batch versions nail the suede quality and N logo stitching that make retail pairs stand out.",
    related: ["air-force-1", "nike-dunk", "nike-air-max"],
  },
  {
    slug: "air-force-1",
    name: "Air Force 1",
    searchTerm: "air force 1",
    intro: "Air Force 1s are among the cheapest and best-repped sneakers. Budget AF1s are nearly identical to retail — the simple design makes them easy to replicate. Mid and best batch versions focus on leather quality and Swoosh placement.",
    related: ["nike-dunk", "jordan-1", "new-balance-550"],
  },
  {
    slug: "jordan-11",
    name: "Jordan 11",
    searchTerm: "jordan 11",
    intro: "The Jordan 11 is a grail sneaker with its distinctive patent leather and carbon fiber plate. Budget batches often miss on the patent leather gloss and carbon fiber pattern. Best batch versions get the 45/23 details, sole clarity, and Jumpman placement right.",
    related: ["jordan-4", "jordan-1", "nike-dunk"],
  },
  {
    slug: "nike-air-max",
    name: "Nike Air Max",
    searchTerm: "air max",
    intro: "Air Max models across 1, 90, 95, and 97 are well-repped. The Air unit is the biggest tell — budget pairs may have slightly off cushioning, while best batch versions get the visible Air bubble, mesh quality, and color accuracy right.",
    related: ["air-force-1", "nike-dunk", "new-balance-550"],
  },
  {
    slug: "balenciaga-runner",
    name: "Balenciaga Runner",
    searchTerm: "balenciaga runner",
    intro: "The Balenciaga Runner's complex, layered design makes it harder to rep well at budget level. Budget pairs get the bulky shape but may miss on material layering. Best batch versions nail the distressed look, sole shape, and logo placement.",
    related: ["dior-b22", "yeezy-350", "new-balance-550"],
  },
  {
    slug: "dior-b22",
    name: "Dior B22",
    searchTerm: "dior b22",
    intro: "The Dior B22 is a high-end designer sneaker with a complex chunky sole and premium materials. Budget reps often lack the sole detail and material quality. Best batch versions focus on the 3D sole shape, Dior branding, and neoprene/leather layering.",
    related: ["balenciaga-runner", "yeezy-350", "jordan-4"],
  },
];

const tierInfo = [
  {
    name: "Budget",
    range: "¥100-200",
    materials: "Decent",
    shape: "Slightly off",
    bestFor: "Beaters, testing",
  },
  {
    name: "Mid-Tier",
    range: "¥200-400",
    materials: "Good",
    shape: "Close",
    bestFor: "Daily wear",
  },
  {
    name: "Best Batch",
    range: "¥400+",
    materials: "Retail-like",
    shape: "1:1",
    bestFor: "Flexing, accuracy",
  },
];

export async function generateStaticParams() {
  return shoeConfigs.map((s) => ({ shoe: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { shoe: string };
}): Promise<Metadata> {
  const config = shoeConfigs.find((s) => s.slug === params.shoe);
  if (!config) return {};
  return {
    title: `Best Batch ${config.name} — Budget vs Mid vs Top Tier Comparison 2026`,
    description: `Compare ${config.name} batches by price and quality. Budget ¥100-200, mid-tier ¥200-400, best batch ¥400+. Find the right batch for you.`,
    openGraph: {
      title: `Best Batch ${config.name} — Budget vs Mid vs Top Tier Comparison 2026 | MurmReps`,
      description: `Compare ${config.name} batches by price and quality. Budget ¥100-200, mid-tier ¥200-400, best batch ¥400+.`,
    },
    alternates: { canonical: `/best-batch/${config.slug}` },
  };
}

async function fetchTier(searchTerm: string, minPrice: number, maxPrice: number | null) {
  let query = supabase
    .from("products")
    .select("id, name, brand, price_cny, image, quality, source_link, views, likes")
    .ilike("name", `%${searchTerm}%`)
    .gte("price_cny", minPrice);

  if (maxPrice) query = query.lte("price_cny", maxPrice);

  const { data } = await query.order("likes", { ascending: false }).limit(3);
  return (data || []) as Pick<Product, "id" | "name" | "brand" | "price_cny" | "image" | "quality" | "source_link" | "views" | "likes">[];
}

function ProductCard({ product }: { product: Pick<Product, "id" | "name" | "brand" | "price_cny" | "image" | "quality" | "views" | "likes"> }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group rounded-card border border-subtle bg-surface overflow-hidden transition-all duration-200 hover:border-accent/20 hover:shadow-[0_0_20px_rgba(254,66,5,0.08)]"
    >
      <div className="relative aspect-square bg-void">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 200px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-muted text-sm">
            No image
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-text-muted truncate">{product.brand}</p>
        <p className="mt-0.5 text-sm font-medium text-white truncate group-hover:text-accent transition-colors">
          {product.name}
        </p>
        <p className="mt-1 text-sm font-semibold text-accent">
          ¥{product.price_cny}
        </p>
      </div>
    </Link>
  );
}

export default async function BestBatchPage({
  params,
}: {
  params: { shoe: string };
}) {
  const config = shoeConfigs.find((s) => s.slug === params.shoe);
  if (!config) notFound();

  const [budget, mid, best] = await Promise.all([
    fetchTier(config.searchTerm, 50, 200),
    fetchTier(config.searchTerm, 200, 400),
    fetchTier(config.searchTerm, 400, null),
  ]);

  const relatedShoes = shoeConfigs.filter((s) =>
    config.related.includes(s.slug)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/best-batch" className="hover:text-white transition-colors">
          Best Batch
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white">{config.name}</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Best Batch {config.name}
      </h1>
      <p className="mt-2 text-lg text-text-secondary">
        Budget vs Mid vs Best Comparison
      </p>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-secondary">
        {config.intro}
      </p>

      {/* Comparison table */}
      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-subtle">
              <th className="py-3 text-left font-medium text-text-muted" />
              {tierInfo.map((t) => (
                <th
                  key={t.name}
                  className="py-3 text-left font-heading font-semibold text-white"
                >
                  {t.name}
                  <span className="ml-2 text-xs font-normal text-text-muted">
                    ({t.range})
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-subtle">
            <tr>
              <td className="py-3 text-text-muted">Materials</td>
              {tierInfo.map((t) => (
                <td key={t.name} className="py-3 text-white">
                  {t.materials}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 text-text-muted">Shape</td>
              {tierInfo.map((t) => (
                <td key={t.name} className="py-3 text-white">
                  {t.shape}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 text-text-muted">Best for</td>
              {tierInfo.map((t) => (
                <td key={t.name} className="py-3 text-white">
                  {t.bestFor}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tier sections */}
      {[
        { label: "Budget", tier: "budget" as const, items: budget, color: "text-text-muted" },
        { label: "Mid-Tier", tier: "mid" as const, items: mid, color: "text-yellow-400" },
        { label: "Best Batch", tier: "best" as const, items: best, color: "text-green-400" },
      ].map(({ label, items, color }) => (
        <section key={label} className="mt-12">
          <h2 className="font-heading text-xl font-bold text-white">
            <span className={color}>●</span> {label} {config.name}
          </h2>
          {items.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-text-muted">
              No {label.toLowerCase()} {config.name} finds yet.{" "}
              <Link
                href={`/products?q=${encodeURIComponent(config.searchTerm)}`}
                className="text-accent hover:underline"
              >
                Browse all {config.name} →
              </Link>
            </p>
          )}
        </section>
      ))}

      {/* KakoBuy CTA */}
      <div className="mt-12 rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-6 text-center">
        <h3 className="font-heading text-lg font-bold text-white">
          Ready to cop? Sign up with KakoBuy
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          Best shipping rates and exclusive coupons through MurmReps
        </p>
        <a
          href="https://ikako.vip/r/6gkjt"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-xl bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600"
        >
          Sign up with KakoBuy →
        </a>
      </div>

      {/* Related shoes */}
      {relatedShoes.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold text-white">
            Related comparisons
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {relatedShoes.map((s) => (
              <Link
                key={s.slug}
                href={`/best-batch/${s.slug}`}
                className="rounded-btn border border-subtle bg-surface px-4 py-2 text-sm font-medium text-white transition-colors hover:border-accent hover:text-accent"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
