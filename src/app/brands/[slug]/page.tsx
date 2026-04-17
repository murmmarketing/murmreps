import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const BRAND_DESCRIPTIONS: Record<string, string> = {
  nike: "The world's leading sportswear brand. Find Nike sneakers, hoodies, tech fleece, and accessories.",
  "louis-vuitton": "Iconic French luxury house. Browse LV bags, wallets, belts, sneakers, and clothing.",
  "chrome-hearts": "Los Angeles luxury streetwear. Chrome Hearts jewelry, hoodies, t-shirts, and accessories.",
  balenciaga: "Spanish luxury fashion house. Balenciaga sneakers, hoodies, t-shirts, and track suits.",
  supreme: "New York streetwear icon. Supreme box logos, hoodies, bags, and accessories.",
  gucci: "Italian luxury brand. Gucci belts, bags, sneakers, and clothing.",
  dior: "French haute couture. Dior bags, sneakers, jewelry, and clothing.",
  stussy: "California surf and streetwear. Stussy t-shirts, hoodies, and accessories.",
  "acne-studios": "Swedish minimalist fashion. Acne Studios jeans, scarves, and knitwear.",
  "rick-owens": "Avant-garde fashion. Rick Owens boots, jackets, and dark aesthetic pieces.",
  prada: "Italian luxury powerhouse. Prada bags, shoes, and accessories.",
  hermes: "French luxury maison. Hermes belts, scarves, bags, and sandals.",
  burberry: "British heritage luxury. Burberry scarves, belts, and outerwear.",
  "ralph-lauren": "American classic style. Ralph Lauren polos, sweaters, and caps.",
  "off-white": "Virgil Abloh's streetwear-luxury bridge. Off-White hoodies, tees, and sneakers.",
  "vivienne-westwood": "British punk-luxury brand. Vivienne Westwood jewelry, belts, and bags.",
  moncler: "Italian luxury outerwear. Moncler puffer jackets, vests, and accessories.",
  "new-balance": "Premium athletic footwear. New Balance 550, 2002R, and collaborations.",
  adidas: "German sportswear giant. Adidas sneakers, tracksuits, and accessories.",
  jordan: "Nike's iconic basketball line. Jordan 1, 4, and retro sneakers.",
};

function slugToBrand(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = slugToBrand(slug);
  const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("brand", brand).not("image", "is", null).neq("image", "");
  const desc = BRAND_DESCRIPTIONS[slug] || `Browse ${count || 0} ${brand} products on MurmReps.`;
  return {
    title: `${brand} Reps — ${count || 0} Products`,
    description: desc,
    openGraph: { title: `${brand} Reps`, description: desc },
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = slugToBrand(slug);
  const desc = BRAND_DESCRIPTIONS[slug];

  const { data: products, count } = await supabase
    .from("products")
    .select("id, name, brand, price_cny, price_eur, image, category, tier, views", { count: "exact" })
    .eq("brand", brand)
    .not("image", "is", null)
    .neq("image", "")
    .order("score", { ascending: false })
    .limit(48);

  const items = products || [];
  const total = count || items.length;

  // Get categories for this brand
  const cats: Record<string, number> = {};
  for (const p of items) { cats[p.category] = (cats[p.category] || 0) + 1; }
  const topCats = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const autoDesc = !desc && topCats.length > 0
    ? `Browse ${total} ${brand} products including ${topCats.slice(0, 3).map(([c]) => c).join(", ")}.`
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/brands" className="hover:text-accent transition-colors">Brands</Link>
        <span>/</span>
        <span className="text-white">{brand}</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">{brand}</h1>
      <p className="mt-2 text-text-secondary">{desc || autoDesc}</p>
      <p className="mt-1 text-sm text-text-muted">{total} products</p>

      {topCats.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {topCats.map(([cat, n]) => (
            <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}&search=${encodeURIComponent(brand)}`}
              className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[#141414] px-3 py-1.5 text-xs text-text-secondary hover:text-white hover:border-accent/30 transition-colors">
              {cat} ({n})
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((p) => (
          <Link key={p.id} href={`/products/${p.id}`} data-product-card
            className="group overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] transition-all hover:-translate-y-0.5 hover:border-accent/20">
            <div className="aspect-square overflow-hidden bg-[#0a0a0a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                onError={(e) => { const card = e.currentTarget.closest("[data-product-card]") as HTMLElement | null; if (card) card.style.display = "none"; }} />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-accent transition-colors">{p.name}</h3>
              <p className="mt-1 text-xs text-text-muted">{p.category}</p>
              <div className="mt-2 flex items-center justify-between">
                {p.price_cny != null ? (
                  <p className="font-heading text-base font-bold text-white">¥{p.price_cny}</p>
                ) : (
                  <p className="text-sm text-text-muted">Multi</p>
                )}
                <span className="text-xs text-text-muted">{p.views || 0} views</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {total > 48 && (
        <div className="mt-8 text-center">
          <Link href={`/products?search=${encodeURIComponent(brand)}`}
            className="inline-block rounded-lg bg-accent px-6 py-3 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(254,66,5,0.3)]">
            View all {total} {brand} products →
          </Link>
        </div>
      )}
    </div>
  );
}
