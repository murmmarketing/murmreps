import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "New Drops — Latest Products",
  description: "The latest rep finds added to MurmReps. New products added daily.",
};

export const revalidate = 300;

export default async function NewDropsPage() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  let { data } = await supabase
    .from("products")
    .select("id, name, brand, price_cny, image, category, created_at", { count: "exact" })
    .not("image", "is", null)
    .neq("image", "")
    .gte("created_at", sevenDaysAgo)
    .order("created_at", { ascending: false })
    .limit(48);

  let label = "this week";

  if (!data || data.length < 8) {
    const { data: extended } = await supabase
      .from("products")
      .select("id, name, brand, price_cny, image, category, created_at")
      .not("image", "is", null)
      .neq("image", "")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false })
      .limit(48);
    data = extended;
    label = "this month";
  }

  if (!data || data.length < 8) {
    const { data: newest } = await supabase
      .from("products")
      .select("id, name, brand, price_cny, image, category, created_at")
      .not("image", "is", null)
      .neq("image", "")
      .order("created_at", { ascending: false })
      .limit(48);
    data = newest;
    label = "newest";
  }

  const items = data || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">New Drops</h1>
      <p className="mt-2 text-text-secondary">
        {items.length} {label === "newest" ? "newest products" : `new products ${label}`}
      </p>

      <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((p) => (
          <Link key={p.id} href={`/products/${p.id}`} data-product-card
            className="group overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] transition-all hover:-translate-y-0.5 hover:border-accent/20">
            <div className="relative aspect-square overflow-hidden bg-[#0a0a0a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]" />
              <span className="absolute left-2 top-2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>
            </div>
            <div className="p-4">
              <p className="text-xs text-text-muted">{p.brand}</p>
              <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-accent transition-colors">{p.name}</h3>
              <div className="mt-2 flex items-center justify-between">
                {p.price_cny ? <span className="font-heading text-base font-bold text-white">¥{p.price_cny}</span> : <span className="text-sm text-text-muted">Multi</span>}
                <span className="text-xs text-text-muted">{p.category}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {items.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-text-secondary">No new products right now. Check back soon!</p>
          <Link href="/products" className="mt-4 inline-block text-accent hover:underline">Browse all products →</Link>
        </div>
      )}
    </div>
  );
}
