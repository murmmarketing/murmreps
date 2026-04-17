import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabase.from("collections").select("title, description").eq("slug", slug).eq("is_published", true).single();
  if (!data) return { title: "Not Found" };
  return { title: `${data.title}`, description: data.description || data.title };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const { data: collection } = await supabase.from("collections").select("*").eq("slug", slug).eq("is_published", true).single();
  if (!collection) notFound();

  const productIds = collection.product_ids || [];
  let products: { id: number; name: string; brand: string; price_cny: number | null; image: string; category: string }[] = [];

  if (productIds.length > 0) {
    const { data } = await supabase
      .from("products")
      .select("id, name, brand, price_cny, image, category")
      .in("id", productIds)
      .not("image", "is", null)
      .neq("image", "");
    products = (data || []) as typeof products;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/collections" className="hover:text-accent transition-colors">Collections</Link>
        <span className="mx-2">/</span>
        <span className="text-[#d4d4d8]">{collection.title}</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold text-white">{collection.title}</h1>
      {collection.description && <p className="mt-2 text-text-secondary">{collection.description}</p>}
      <p className="mt-1 text-sm text-text-muted">{products.length} products</p>

      <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <Link key={p.id} href={`/products/${p.id}`} data-product-card
            className="group overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] transition-all hover:-translate-y-0.5 hover:border-accent/20">
            <div className="aspect-square overflow-hidden bg-[#0a0a0a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => { const card = (e.target as HTMLElement).closest("[data-product-card]") as HTMLElement | null; if (card) card.style.display = "none"; }} />
            </div>
            <div className="p-4">
              <p className="text-xs text-text-muted">{p.brand}</p>
              <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-accent transition-colors">{p.name}</h3>
              {p.price_cny ? <p className="mt-2 font-heading text-base font-bold text-white">¥{p.price_cny}</p> : <p className="mt-2 text-sm text-text-muted">Multi</p>}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-gradient-to-r from-[#FE4205] to-[#c2410c] p-8 text-center">
        <h2 className="text-xl font-bold text-white">Ready to buy?</h2>
        <p className="mt-2 text-white/80">Sign up to KakoBuy and start shopping.</p>
        <a href="https://ikako.vip/r/6gkjt" target="_blank" rel="noopener noreferrer"
          className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-bold text-[#FE4205]">Sign up to KakoBuy →</a>
      </div>
    </div>
  );
}
