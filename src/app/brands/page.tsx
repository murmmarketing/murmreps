import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "All Brands — Browse by Brand",
  description: "Browse rep finds by brand. Nike, Louis Vuitton, Chrome Hearts, Balenciaga, Supreme, and 500+ more brands.",
};

function brandToSlug(brand: string): string {
  return brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface BrandInfo {
  brand: string;
  count: number;
  image: string | null;
}

export default async function BrandsPage() {
  // Fetch all brands with counts
  let all: { brand: string; image: string }[] = [];
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from("products")
      .select("brand, image")
      .not("image", "is", null)
      .neq("image", "")
      .neq("brand", "Various")
      .neq("brand", "Unknown")
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    all = all.concat(data as { brand: string; image: string }[]);
    if (data.length < 1000) break;
    offset += 1000;
  }

  const brandMap: Record<string, BrandInfo> = {};
  for (const p of all) {
    if (!brandMap[p.brand]) {
      brandMap[p.brand] = { brand: p.brand, count: 0, image: p.image };
    }
    brandMap[p.brand].count++;
  }

  const brands = Object.values(brandMap)
    .filter((b) => b.count >= 3)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
        All Brands
      </h1>
      <p className="mt-2 text-text-secondary">
        {brands.length} brands with 3+ products
      </p>

      <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {brands.map((b) => (
          <Link
            key={b.brand}
            href={`/brands/${brandToSlug(b.brand)}`}
            className="group overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] transition-all hover:-translate-y-0.5 hover:border-accent/20"
          >
            <div className="aspect-square overflow-hidden bg-[#0a0a0a]">
              {b.image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={b.image} alt={b.brand} loading="lazy" className="h-full w-full object-contain opacity-60 transition-opacity group-hover:opacity-100" />
              )}
            </div>
            <div className="p-3">
              <p className="font-semibold text-white text-sm group-hover:text-accent transition-colors">{b.brand}</p>
              <p className="text-xs text-text-muted">{b.count} products</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
