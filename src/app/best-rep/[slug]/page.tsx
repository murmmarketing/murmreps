import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

/* ───────────────────── Category config ───────────────────── */

interface CategoryConfig {
  name: string;
  dbCategories: string[];
  maxPrice?: number;
  intro: string;
}

const CATEGORIES: Record<string, CategoryConfig> = {
  shoes: {
    name: "Shoes",
    dbCategories: ["Shoes", "Sneakers", "Boots", "Slides & Sandals"],
    intro:
      "Shoes are by far the most popular category in the rep world, and for good reason. From iconic Jordan 1s and Nike Dunks to luxury Balenciaga Runners and Dior B22s, the range of replica footwear available in 2026 is staggering. Factories have spent years perfecting sole moulds, leather quality, and stitching accuracy across every price tier. Budget pairs start around 80 yuan and deliver solid silhouettes for daily wear, while best-batch options above 400 yuan rival retail in every measurable detail. Whether you want chunky designer sneakers, clean minimalist trainers, or statement boots, the rep shoe market has the deepest catalog and the most community QC data of any category. MurmReps indexes thousands of shoe finds so you can compare batches, prices, and seller ratings before buying.",
  },
  hoodies: {
    name: "Hoodies",
    dbCategories: ["Hoodies"],
    intro:
      "Rep hoodies have become a wardrobe staple for anyone building a streetwear or designer collection without paying retail. From Chrome Hearts zip-ups with leather cross patches to Balenciaga oversized blanks and Supreme box logos, the hoodie category covers every aesthetic from dark luxury to classic skate culture. Fabric weight matters — the best reps use 400-500 GSM cotton fleece that feels thick and premium on arrival. Embroidery, screen printing, and puff-print details have improved dramatically, with top-tier batches nailing even small tags and wash labels. Budget hoodies around 80-120 yuan are great basics, while premium batches above 250 yuan deliver near-retail weight, print accuracy, and construction. MurmReps lets you filter by brand and price to find the perfect hoodie rep for your budget.",
  },
  bags: {
    name: "Bags",
    dbCategories: ["Bags", "Bags & Acc"],
    intro:
      "Designer bag replicas are one of the fastest-growing categories in 2026, driven by demand for Louis Vuitton, Gucci, Prada, and Hermes styles at a fraction of retail. The Neverfull, Speedy, and Keepall remain the most replicated silhouettes, but crossbody bags, belt bags, and backpacks are catching up fast. Quality tiers make a big difference here — budget bags around 100-200 yuan get the look right but may lack accurate hardware weight and leather feel, while premium batches above 500 yuan use genuine leather, correct stitching counts, and branded hardware that closely matches retail. Alignment of monogram patterns, zipper smoothness, and interior lining are the main QC points the community checks. MurmReps catalogues hundreds of bag finds with QC photos so you can compare quality across sellers.",
  },
  jewelry: {
    name: "Jewelry",
    dbCategories: ["Jewelry"],
    intro:
      "Replica jewelry has exploded in popularity thanks to Chrome Hearts, Vivienne Westwood, and designer pieces becoming status symbols in streetwear. Chrome Hearts cross pendants, CH Plus rings, and dagger necklaces dominate the category, followed closely by Vivienne Westwood orb necklaces and designer bracelets. Materials range from budget alloy and silver-plated pieces to high-end 925 sterling silver with accurate engravings and weight. The best jewelry reps nail the heft, patina, and hallmark details that distinguish quality from costume pieces. Budget jewelry starts around 15-30 yuan for simple pendants, while premium 925 silver rings and chains run 100-400 yuan. MurmReps tracks jewelry finds from trusted sellers so you can compare craftsmanship, material quality, and pricing before committing.",
  },
  jackets: {
    name: "Jackets",
    dbCategories: ["Jackets", "Outerwear"],
    intro:
      "Rep jackets cover everything from Moncler puffer coats and North Face nuptses to Balenciaga track jackets and vintage racing styles. Outerwear is one of the highest-value rep categories because retail prices for designer jackets regularly exceed thousands of euros. Down fill quality, badge accuracy, and zipper hardware are the key QC points for puffer jackets, while leather jackets focus on hide quality and stitching precision. Budget jackets around 150-300 yuan work well for layering pieces and lighter styles, while premium puffers above 500 yuan deliver the warmth, loft, and badge detail that justify the price. The rep outerwear market peaks in autumn and winter, so the best stock drops between September and December. MurmReps indexes jackets year-round so you can plan ahead.",
  },
  pants: {
    name: "Pants & Jeans",
    dbCategories: ["Pants", "Jeans", "Shorts"],
    intro:
      "From Gallery Dept flared jeans to Nike Tech Fleece joggers and Represent cargo pants, the rep bottoms category covers every fit and aesthetic. Denim reps have improved significantly — top batches now feature accurate distressing, hardware branding, and correct fabric weight that rivals retail at a tenth of the price. Casual pants like tracksuits bottoms and cargos focus on cut, pocket placement, and logo accuracy. Budget options around 60-120 yuan deliver good fits and basic branding, while premium jeans above 250 yuan nail the wash, selvedge details, and patch accuracy that denim enthusiasts look for. Sizing can vary between sellers, so always check the size chart on the product page. MurmReps includes pants and jeans from dozens of brands with detailed photos to help you find the right fit.",
  },
  watches: {
    name: "Watches",
    dbCategories: ["Watches"],
    intro:
      "Replica watches are one of the most specialized categories in the rep world, with pieces ranging from budget fashion watches to high-end mechanical movements. Popular models include Rolex Submariners, AP Royal Oaks, Cartier Santos, and Omega Seamasters. The watch rep market is tiered by movement quality — quartz budget pieces start around 100-200 yuan, while automatic movement replicas with sapphire crystals and solid link bracelets command 800 yuan and above. Key QC points include dial printing sharpness, bezel alignment, crown operation, and case finishing. The community pays close attention to weight, lume brightness, and water resistance. MurmReps tracks watch finds so you can compare movements, materials, and seller reliability before investing in a timepiece.",
  },
  sneakers: {
    name: "Sneakers Under $30",
    dbCategories: ["Shoes", "Sneakers"],
    maxPrice: 230,
    intro:
      "Budget sneakers under 230 yuan (roughly $30) are the sweet spot for everyday beaters and testing new styles without commitment. At this price point you can find solid Nike Dunks, Air Force 1s, Adidas Sambas, and New Balance 550s that nail the silhouette and basic materials. The trade-offs are usually minor — slightly less premium leather, marginal shape differences, or simplified insoles — but on foot the differences from retail are minimal. Budget batches have improved year over year as factory competition drives quality up and prices down. These are the pairs you wear to the gym, to festivals, or rotate daily without worrying about wear and tear. MurmReps filters thousands of sneakers by price so you can find the best value pairs instantly.",
  },
  accessories: {
    name: "Accessories",
    dbCategories: ["Accessories", "Hats", "Belts", "Sunglasses", "Wallets"],
    intro:
      "Accessories are the easiest way to add designer flair to any outfit without breaking the bank. Rep belts from Hermes, LV, and Gucci start as low as 30 yuan and go up to 200+ yuan for premium leather versions with accurate buckles. Hats — from New Era fitted caps to designer bucket hats — are lightweight and cheap to ship. Sunglasses reps cover Dior, Prada, and Gentle Monster with UV-protective lenses. Wallets and card holders from Louis Vuitton and Goyard are popular because they are compact, affordable, and see daily use. The accessory category is perfect for first-time rep buyers because items are small, ship fast, and carry low risk. MurmReps indexes accessories across all major brands so you can find matching pieces for your wardrobe.",
  },
  "t-shirts": {
    name: "T-Shirts",
    dbCategories: ["T-Shirts"],
    intro:
      "Graphic tees and designer t-shirts are the bread and butter of the rep clothing world. From Supreme box logos and Bape shark prints to Balenciaga campaign tees and Gallery Dept paint-splatter designs, the variety is endless. Print quality is the main differentiator — budget tees around 30-60 yuan use basic screen printing that may crack after a few washes, while premium batches above 120 yuan feature thick DTG prints, accurate neck tags, and heavyweight 230+ GSM cotton blanks. Oversized fits dominate the current trend cycle, so pay attention to size charts because Asian sizing often runs smaller. MurmReps catalogues t-shirts from dozens of brands with detailed photos so you can compare print accuracy, blank quality, and pricing across sellers before you buy.",
  },
};

const ALL_SLUGS = Object.keys(CATEGORIES);

/* ───────────────────── Static params & metadata ───────────────────── */

export function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = CATEGORIES[slug];
  if (!config) return {};
  const name = config.name;
  const title =
    `Best Rep ${name} 2026 | MurmReps`.length <= 60
      ? `Best Rep ${name} 2026 | MurmReps`
      : `Best Rep ${name} 2026 | MurmReps`;
  const description = `Find the best replica ${name.toLowerCase()} in 2026. Top picks with QC photos and agent links.`;
  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `/best-rep/${slug}` },
  };
}

/* ───────────────────── Product card (grid) ───────────────────── */

function ProductCard({
  p,
}: {
  p: {
    id: number;
    name: string;
    brand: string | null;
    price_cny: number | null;
    image: string;
    category: string;
    views: number | null;
  };
}) {
  return (
    <Link
      href={`/products/${p.id}`}
      className="group rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] overflow-hidden transition-all hover:border-accent/20"
    >
      <div className="aspect-square w-full bg-[#0a0a0a] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image}
          alt={p.name}
          className="h-full w-full object-contain transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        {p.brand && (
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wide">
            {p.brand}
          </p>
        )}
        <h3 className="text-sm font-semibold text-white line-clamp-2 mt-0.5">
          {p.name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-accent font-bold text-sm">
            ¥{p.price_cny}
          </span>
          <span className="text-[11px] text-text-muted">
            {p.views || 0} views
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ───────────────────── Small product row (budget/premium) ───────────────────── */

function SmallProductCard({
  p,
}: {
  p: {
    id: number;
    name: string;
    brand: string | null;
    price_cny: number | null;
    image: string;
    category: string;
    views: number | null;
  };
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-3 transition-all hover:border-accent/20">
      <div className="shrink-0 w-16 h-16 rounded-lg bg-[#0a0a0a] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image}
          alt={p.name}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-white line-clamp-1">
          {p.name}
        </h3>
        <p className="text-xs text-text-muted mt-0.5">{p.brand}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-accent font-bold text-sm">
            ¥{p.price_cny}
          </span>
          <Link
            href={`/products/${p.id}`}
            className="text-xs text-text-muted hover:text-white transition-colors"
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Page ───────────────────── */

export default async function BestRepCategoryPage({ params }: Props) {
  const { slug } = await params;
  const config = CATEGORIES[slug];
  if (!config) notFound();

  const { name, dbCategories, maxPrice, intro } = config;

  /* ── Top 12 products ── */
  let query = supabase
    .from("products")
    .select("id, name, brand, price_cny, image, category, views")
    .in("category", dbCategories)
    .not("image", "is", null)
    .neq("image", "");

  if (maxPrice) {
    query = query.lte("price_cny", maxPrice);
  }

  const { data: topProducts } = await query
    .order("views", { ascending: false })
    .limit(12);

  const items = topProducts || [];

  /* ── Top brands by product count ── */
  const { data: allBrandProducts } = await supabase
    .from("products")
    .select("brand")
    .in("category", dbCategories)
    .not("brand", "is", null)
    .neq("brand", "");

  const brandCounts: Record<string, number> = {};
  for (const p of allBrandProducts || []) {
    if (p.brand) {
      brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    }
  }
  const topBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  /* ── Budget picks (under 100 CNY) ── */
  const budgetQuery = supabase
    .from("products")
    .select("id, name, brand, price_cny, image, category, views")
    .in("category", dbCategories)
    .not("image", "is", null)
    .neq("image", "")
    .lte("price_cny", 100)
    .order("views", { ascending: false })
    .limit(4);

  const { data: budgetProducts } = await budgetQuery;
  const budgetItems = budgetProducts || [];

  /* ── Premium picks (over 400 CNY) ── */
  const premiumQuery = supabase
    .from("products")
    .select("id, name, brand, price_cny, image, category, views")
    .in("category", dbCategories)
    .not("image", "is", null)
    .neq("image", "")
    .gte("price_cny", 400)
    .order("views", { ascending: false })
    .limit(4);

  const { data: premiumProducts } = await premiumQuery;
  const premiumItems = premiumProducts || [];

  /* ── FAQ data ── */
  const priceRange =
    items.length > 0
      ? `¥${Math.min(...items.map((p) => p.price_cny || 0))} to ¥${Math.max(...items.map((p) => p.price_cny || 0))}`
      : "¥50 to ¥2000+";

  const faqs = [
    {
      q: `What are the best rep ${name.toLowerCase()}?`,
      a: `MurmReps tracks thousands of replica ${name.toLowerCase()} from verified sellers. The best picks are ranked by community views and quality ratings. Browse our curated selection above to find top-rated ${name.toLowerCase()} across all price tiers.`,
    },
    {
      q: `How much do rep ${name.toLowerCase()} cost?`,
      a: `Rep ${name.toLowerCase()} on MurmReps range from ${priceRange} depending on quality tier and brand. Budget options offer great value for everyday use, while premium batches deliver near-retail accuracy and materials.`,
    },
    {
      q: `How to buy rep ${name.toLowerCase()}?`,
      a: `To buy rep ${name.toLowerCase()}, find the item you want on MurmReps, then use KakoBuy as your purchasing agent. KakoBuy handles the buying, QC photos, and international shipping. Sign up for free, paste the product link, pay in your currency, and KakoBuy does the rest.`,
    },
  ];

  /* ── Related brand slugs ── */
  const relatedBrandSlugs = topBrands.map(([brand]) =>
    brand.toLowerCase().replace(/\s+/g, "-")
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* ── Header ── */}
      <h1 className="font-heading text-3xl font-bold text-white mb-4">
        Best Rep {name} 2026
      </h1>
      <p className="text-text-secondary leading-relaxed mb-8">{intro}</p>

      {/* ── Top 12 product grid ── */}
      {items.length > 0 && (
        <section className="mb-12">
          <h2 className="font-heading text-xl font-bold text-white mb-6">
            Top {name} Finds
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── Top Brands ── */}
      {topBrands.length > 0 && (
        <section className="mb-12">
          <h2 className="font-heading text-xl font-bold text-white mb-4">
            Top {name} Brands
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topBrands.map(([brand, count], i) => {
              const brandSlug = brand.toLowerCase().replace(/\s+/g, "-");
              return (
                <Link
                  key={brand}
                  href={`/best/${brandSlug}`}
                  className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 transition-all hover:border-accent/20"
                >
                  <span className="text-xs text-accent font-bold">
                    #{i + 1}
                  </span>
                  <h3 className="text-base font-semibold text-white mt-1">
                    {brand}
                  </h3>
                  <p className="text-sm text-text-muted mt-1">
                    {count} products
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Budget Picks ── */}
      {budgetItems.length > 0 && (
        <section className="mb-12">
          <h2 className="font-heading text-xl font-bold text-white mb-2">
            Budget Picks
          </h2>
          <p className="text-sm text-text-muted mb-4">
            Top {name.toLowerCase()} under ¥100
          </p>
          <div className="space-y-3">
            {budgetItems.map((p) => (
              <SmallProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── Premium Picks ── */}
      {premiumItems.length > 0 && (
        <section className="mb-12">
          <h2 className="font-heading text-xl font-bold text-white mb-2">
            Premium Picks
          </h2>
          <p className="text-sm text-text-muted mb-4">
            Top {name.toLowerCase()} over ¥400
          </p>
          <div className="space-y-3">
            {premiumItems.map((p) => (
              <SmallProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className="mb-12">
        <h2 className="font-heading text-lg font-bold text-white mb-4">FAQ</h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5"
            >
              <p className="text-sm font-semibold text-white mb-2">{faq.q}</p>
              <p className="text-sm text-text-secondary leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── KakoBuy CTA ── */}
      <section className="mb-12">
        <div className="rounded-xl bg-gradient-to-r from-[#FE4205] to-[#c2410c] p-8 text-center">
          <h2 className="text-xl font-bold text-white">
            Ready to buy rep {name.toLowerCase()}?
          </h2>
          <p className="mt-2 text-white/80">
            Sign up to KakoBuy — the easiest way to buy reps with QC photos and
            worldwide shipping.
          </p>
          <a
            href="https://ikako.vip/r/6gkjt"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-bold text-[#FE4205]"
          >
            Sign up to KakoBuy →
          </a>
        </div>
      </section>

      {/* ── Internal Links ── */}
      <section className="mb-12">
        <h2 className="font-heading text-lg font-bold text-white mb-4">
          Explore More
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/products"
            className="rounded-full border border-[rgba(255,255,255,0.06)] bg-[#141414] px-4 py-2 text-sm text-text-secondary hover:border-accent/20 hover:text-white transition-colors"
          >
            All Products
          </Link>
          {relatedBrandSlugs.map((bs) => (
            <Link
              key={bs}
              href={`/best/${bs}`}
              className="rounded-full border border-[rgba(255,255,255,0.06)] bg-[#141414] px-4 py-2 text-sm text-text-secondary hover:border-accent/20 hover:text-white transition-colors"
            >
              Best{" "}
              {bs
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}{" "}
              Reps
            </Link>
          ))}
          <Link
            href="/guides/how-to-buy-reps-kakobuy"
            className="rounded-full border border-[rgba(255,255,255,0.06)] bg-[#141414] px-4 py-2 text-sm text-text-secondary hover:border-accent/20 hover:text-white transition-colors"
          >
            How to Buy Reps Guide
          </Link>
          <Link
            href="/sellers"
            className="rounded-full border border-[rgba(255,255,255,0.06)] bg-[#141414] px-4 py-2 text-sm text-text-secondary hover:border-accent/20 hover:text-white transition-colors"
          >
            Trusted Sellers
          </Link>
        </div>
      </section>

      {/* ── JSON-LD FAQPage schema ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
          }),
        }}
      />
    </div>
  );
}
