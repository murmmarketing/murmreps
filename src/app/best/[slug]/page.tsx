import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

/* ───────────────────── Brand descriptions ───────────────────── */

const BRAND_INTROS: Record<string, string> = {
  "chrome-hearts":
    "Chrome Hearts is the holy grail of luxury streetwear, built on sterling silver jewelry, leather goods, and a gothic aesthetic that dominates the rep community. It is the most repped brand for jewelry by a wide margin. Cross patches, horseshoe logos, and dagger pendants are signature motifs you will find on everything from rings to zip hoodies. Popular rep items include cross necklaces, CH Plus rings, zip-up hoodies with leather cross patches, trucker caps, and exotic-leather wallets. If you are into dark, edgy accessories, Chrome Hearts reps offer the best value-to-style ratio on the market. Quality ranges from budget silver-plated pieces to near-retail 925 silver craftsmanship.",
  nike:
    "Nike is the most popular rep brand overall, covering Dunks, Air Force 1s, Air Max models, and the entire Tech Fleece lineup. The selection is massive, ranging from budget batches at around 50 yuan to best-batch pairs north of 500 yuan. Dunks and AF1s dominate the sneaker rep scene, while Tech Fleece tracksuits and hoodies are the most sought-after clothing items. Nike reps offer incredible value because retail prices keep climbing while rep quality keeps improving. Whether you want a cheap pair of daily beaters or a near-perfect replica of a limited colorway, the Nike rep catalog has something at every price point. The swoosh is the most recognizable logo in fashion and the easiest to quality-check.",
  "louis-vuitton":
    "Louis Vuitton represents the pinnacle of French luxury and features the most recognizable pattern in fashion — the LV monogram. The Monogram Neverfull and Keepall are the most replicated bags in the entire rep world, and LV Trainer sneakers have become a streetwear staple since Virgil Abloh's tenure. Belts and wallets are popular entry-level luxury reps that ship fast and weigh almost nothing. Quality tiers range from budget canvas pieces to premium replicas with accurate stitching, hardware, and date codes. LV reps are among the best-documented in the community, so QC comparisons are easy to find.",
  balenciaga:
    "Balenciaga leads the dark luxury aesthetic that is dominating 2026 fashion. Track runners, Speed trainers, and Triple S sneakers are the most popular shoe reps, while oversized hoodies and track jackets define the clothing side. The brand's chunky, deconstructed silhouettes translate well to replicas because the intentionally exaggerated proportions are easier to reproduce than slim-fit luxury. Balenciaga reps range from budget options around 100 yuan to premium batches that nail the weight, materials, and sole shape. If you are building a dark, oversized wardrobe, Balenciaga is the anchor brand.",
  supreme:
    "Supreme is the king of streetwear and one of the most replicated brands in the world. Box logo hoodies, t-shirts, accessories, and collaboration pieces are always in high demand. The red box logo is iconic and heavily quality-checked by the community.",
  gucci:
    "Gucci brings Italian luxury to streetwear with the iconic GG pattern and green-red-green stripe. Their belts, bags, sneakers, and clothing are among the most popular luxury reps. Gucci Ace sneakers and GG canvas bags are top sellers.",
  dior:
    "Dior combines haute couture with modern street style, and their sneaker lineup is one of the hottest in reps. The B22, B23, and B30 are the most sought-after models, each with distinct aesthetics from chunky dad-shoe to sleek canvas. Saddle bags and the Oblique pattern dominate the accessories side. The trending Dior Sports collection has brought athletic-luxe pieces into the rep spotlight for 2026. Quality reps nail the intricate stitching and materials that make Dior pieces stand out.",
  stussy:
    "Stussy is California surf culture meets streetwear, founded in the early 1980s. Their graphic tees, hoodies, and accessories are casual classics that never go out of style. Stussy reps are popular for everyday wear at very affordable prices.",
  "acne-studios":
    "Acne Studios brings Scandinavian minimalism to fashion with clean-cut jeans, oversized scarves, and premium knitwear in neutral tones. Their face-patch beanies and mohair sweaters are among the most popular reps in the minimalist fashion space.",
  "rick-owens":
    "Rick Owens is the dark lord of fashion and the architect of the avant-garde streetwear movement. Geobaskets, Ramones, and DRKSHDW sneakers define the footwear side, while oversized silhouettes and draped layers create the signature Rick aesthetic. Rep quality for Rick Owens has improved significantly, with top-tier batches nailing the chunky soles and premium leather feel.",
  prada:
    "Prada is Italian luxury at its finest, with the iconic triangle logo appearing on bags, shoes, and accessories. Re-Nylon bags, Cloudbust Thunder sneakers, and Saffiano leather goods are the most replicated items. Prada reps offer clean, understated luxury.",
  hermes:
    "Hermes is the ultimate luxury house, known for timeless craftsmanship. Belts with the H buckle, Oran sandals, silk scarves, and bags are the most popular rep items. Hermes reps range from budget accessories to premium leather goods with meticulous attention to detail.",
  burberry:
    "Burberry is British heritage luxury defined by their iconic check pattern. Scarves, belts, bags, and outerwear featuring the nova check and TB monogram are the most popular reps. The trench coat remains a timeless staple.",
  "ralph-lauren":
    "Ralph Lauren is American classic style and the foundation of the old money aesthetic. Polos, cable-knit sweaters, oxford shirts, caps, and accessories define the preppy look. Ralph Lauren reps are affordable and great for building a timeless wardrobe.",
  "off-white":
    "Off-White bridges streetwear and high fashion with diagonal stripes, zip ties, and bold quotation-mark graphics. Hoodies, sneakers, and belts are the most replicated items. Virgil Abloh's design language remains influential across the rep community.",
  "vivienne-westwood":
    "Vivienne Westwood brings punk rock to luxury fashion with the iconic Saturn orb appearing on jewelry, belts, bags, and necklaces. The orb necklace is one of the most popular accessory reps globally. Statement pieces that mix rebellion with elegance.",
  moncler:
    "Moncler is the king of luxury outerwear, and their puffer jackets are some of the most popular winter reps. Down jackets, vests, and accessories deliver warmth with style. The cartoon patch logo and NFC tags are key details the community quality-checks.",
  "new-balance":
    "New Balance has become a fashion staple far beyond athletics. The 550, 2002R, and 530 are the most popular rep models, along with high-end collaborations like the JJJJound and Aime Leon Dore editions. Clean, versatile sneakers at great rep prices.",
  adidas:
    "Adidas spans sport and street with a huge rep catalog. Sambas, Campus, and the Yeezy collaboration line are the most popular sneakers. Tracksuits and accessories round out the selection. Adidas reps are widely available across all quality tiers.",
  jordan:
    "Jordan Brand is basketball heritage meets streetwear culture, and it is the single most popular sneaker rep brand. The Jordan 1, 4, and 11 are the most sought-after silhouettes, each available in multiple batch tiers from budget pairs around 80 yuan to best-batch options above 500 yuan. The rep community has extensive QC guides for every major colorway. Whether you want Chicago 1s, Black Cat 4s, or Bred 11s, there is a batch tier for every budget. Sneaker culture runs through Jordan.",
  bape:
    "BAPE (A Bathing Ape) is a Japanese streetwear icon founded by Nigo in 1993. The shark hoodie with its full-zip face design is one of the most recognizable pieces in streetwear and one of the most popular rep items globally. Camo print in signature colorways covers everything from hoodies to shorts. Bapesta sneakers channel Air Force 1 energy with the star logo. BAPE t-shirts with the ape head logo are affordable entry points. The brand bridges Japanese street culture with hip-hop fashion, and reps range from budget graphic tees to premium shark hoodies with accurate teeth zippers and WGM stitching.",
};

/* ───────────────────── Category groups ───────────────────── */

const SHOE_CATEGORIES = ["Shoes", "Sneakers", "Boots", "Slides & Sandals"];
const CLOTHING_CATEGORIES = ["Hoodies", "T-Shirts", "Jackets", "Pants", "Shorts", "Sweaters", "Tracksuits"];
const ACCESSORY_CATEGORIES = ["Jewelry", "Bags", "Accessories", "Hats", "Belts", "Wallets", "Sunglasses", "Watches"];

const SHOE_BRANDS = new Set([
  "nike", "jordan", "adidas", "new-balance", "balenciaga", "dior", "rick-owens", "off-white", "bape",
]);

/* ───────────────────── Related brands ───────────────────── */

const RELATED_BRANDS: Record<string, string[]> = {
  "chrome-hearts": ["vivienne-westwood", "rick-owens", "off-white"],
  nike: ["jordan", "adidas", "new-balance"],
  "louis-vuitton": ["gucci", "dior", "hermes", "prada"],
  balenciaga: ["dior", "prada", "rick-owens"],
  supreme: ["stussy", "off-white", "bape"],
  gucci: ["louis-vuitton", "prada", "dior", "burberry"],
  dior: ["balenciaga", "louis-vuitton", "prada"],
  stussy: ["supreme", "nike", "ralph-lauren"],
  "acne-studios": ["rick-owens", "moncler", "burberry"],
  "rick-owens": ["chrome-hearts", "balenciaga", "off-white"],
  prada: ["gucci", "dior", "balenciaga", "louis-vuitton"],
  hermes: ["louis-vuitton", "gucci", "burberry"],
  burberry: ["ralph-lauren", "gucci", "hermes"],
  "ralph-lauren": ["burberry", "stussy", "acne-studios"],
  "off-white": ["supreme", "nike", "chrome-hearts", "bape"],
  "vivienne-westwood": ["chrome-hearts", "rick-owens", "acne-studios"],
  moncler: ["burberry", "acne-studios", "ralph-lauren"],
  "new-balance": ["nike", "adidas", "jordan"],
  adidas: ["nike", "new-balance", "jordan"],
  jordan: ["nike", "adidas", "new-balance"],
  bape: ["supreme", "off-white", "stussy", "nike"],
};

/* ───────────────────── Helpers ───────────────────── */

const ALL_SLUGS = [
  "chrome-hearts", "nike", "louis-vuitton", "balenciaga", "supreme",
  "gucci", "dior", "stussy", "acne-studios", "rick-owens",
  "prada", "hermes", "burberry", "ralph-lauren", "off-white",
  "vivienne-westwood", "moncler", "new-balance", "adidas", "jordan",
  "bape",
];

export function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}

function slugToBrand(slug: string): string {
  const custom: Record<string, string> = {
    "louis-vuitton": "Louis Vuitton",
    "chrome-hearts": "Chrome Hearts",
    "acne-studios": "Acne Studios",
    "rick-owens": "Rick Owens",
    "ralph-lauren": "Ralph Lauren",
    "off-white": "Off White",
    "vivienne-westwood": "Vivienne Westwood",
    "new-balance": "New Balance",
    bape: "Bape",
  };
  return custom[slug] || slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = slugToBrand(slug);
  const title = `Best ${brand} Reps 2026 — Top Finds | MurmReps`;
  const desc = `The best ${brand} replica finds in 2026. Compare prices across 8 agents. Quality-checked and community-verified.`;
  return { title, description: desc, openGraph: { title, description: desc }, alternates: { canonical: `/best/${slug}` } };
}

/* ───────────────────── Product card ───────────────────── */

function ProductCard({ p, rank }: { p: { id: number; name: string; price_cny: number | null; category: string; image: string; views: number | null }; rank?: number }) {
  return (
    <div className="flex gap-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4 transition-all hover:border-accent/20">
      <div className="shrink-0 w-24 h-24 rounded-lg bg-[#0a0a0a] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt={p.name} className="h-full w-full object-contain" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            {rank !== undefined && <span className="text-xs text-accent font-bold">#{rank}</span>}
            <h3 className="text-sm font-semibold text-white">{p.name}</h3>
            <p className="text-xs text-text-muted">{p.category} · {p.views || 0} views</p>
          </div>
          <p className="text-accent font-bold shrink-0">¥{p.price_cny}</p>
        </div>
        <div className="mt-2 flex gap-2">
          <Link href={`/products/${p.id}`} className="text-xs text-text-muted hover:text-white transition-colors">View details →</Link>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Page ───────────────────── */

export default async function BestBrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = slugToBrand(slug);
  const intro = BRAND_INTROS[slug];

  /* ── Top 10 products ── */
  const { data: products, count } = await supabase
    .from("products")
    .select("id, name, brand, price_cny, price_eur, image, category, tier, views", { count: "exact" })
    .eq("brand", brand)
    .not("image", "is", null)
    .neq("image", "")
    .order("score", { ascending: false })
    .limit(10);

  const items = products || [];
  if (items.length === 0) notFound();
  const total = count || items.length;
  const avgPrice = items.length > 0 ? Math.round(items.reduce((s, p) => s + (p.price_cny || 0), 0) / items.length) : 0;

  /* ── Category sub-section queries ── */
  const fetchCategory = async (categories: string[], limit: number) => {
    const { data } = await supabase
      .from("products")
      .select("id, name, price_cny, image, category, views")
      .eq("brand", brand)
      .in("category", categories)
      .not("image", "is", null)
      .neq("image", "")
      .order("score", { ascending: false })
      .limit(limit);
    return data || [];
  };

  const [shoes, clothing, accessories] = await Promise.all([
    fetchCategory(SHOE_CATEGORIES, 4),
    fetchCategory(CLOTHING_CATEGORIES, 4),
    fetchCategory(ACCESSORY_CATEGORIES, 4),
  ]);

  const related = RELATED_BRANDS[slug] || [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* ── Header ── */}
      <h1 className="font-heading text-3xl font-bold text-white mb-2">
        Best {brand} Reps 2026
      </h1>
      <p className="text-text-secondary mb-6">
        {intro || `Browse the top ${brand} replica finds, quality-checked and community-verified.`}
      </p>

      <p className="text-sm text-text-muted mb-8">
        {total} products available · Average price: ¥{avgPrice} (~€{(avgPrice * 0.127).toFixed(0)})
      </p>

      {/* ── Top 10 products ── */}
      <div className="space-y-4 mb-12">
        {items.map((p, i) => (
          <ProductCard key={p.id} p={p} rank={i + 1} />
        ))}
      </div>

      <Link href={`/brands/${slug}`}
        className="block w-full text-center rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] py-4 text-sm font-medium text-accent hover:bg-[#1a1a1a] transition-colors mb-12">
        View all {total} {brand} products →
      </Link>

      {/* ── Category sub-sections ── */}
      {shoes.length > 0 && (
        <section className="mb-12">
          <h2 className="font-heading text-xl font-bold text-white mb-4">Best {brand} Shoes</h2>
          <div className="space-y-4">
            {shoes.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {clothing.length > 0 && (
        <section className="mb-12">
          <h2 className="font-heading text-xl font-bold text-white mb-4">Best {brand} Clothing</h2>
          <div className="space-y-4">
            {clothing.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {accessories.length > 0 && (
        <section className="mb-12">
          <h2 className="font-heading text-xl font-bold text-white mb-4">Best {brand} Accessories</h2>
          <div className="space-y-4">
            {accessories.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── How to Buy mini-guide ── */}
      <section className="mb-12">
        <h2 className="font-heading text-xl font-bold text-white mb-6">How to Buy {brand} Reps</h2>
        <div className="space-y-4">
          {[
            { step: 1, title: "Find your item", desc: `Browse ${brand} products on MurmReps and pick the item you want. Check the quality tier and community feedback.` },
            { step: 2, title: "Sign up to KakoBuy", desc: "Create a free account on KakoBuy — our recommended agent for beginners. They handle purchasing, QC photos, and international shipping.", link: { href: "https://ikako.vip/r/6gkjt", label: "Sign up to KakoBuy →", external: true } },
            { step: 3, title: "Paste the link & pay", desc: "Copy the product link from MurmReps into KakoBuy. Pay in your local currency. KakoBuy buys from the seller on your behalf." },
            { step: 4, title: "QC & ship", desc: "KakoBuy sends you QC photos. If you are happy, submit for shipping. Use our converter to estimate costs.", link: { href: "/converter", label: "Shipping calculator →", external: false } },
          ].map(({ step, title, desc, link }) => (
            <div key={step} className="flex gap-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                {step}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <p className="mt-1 text-sm text-text-secondary leading-relaxed">{desc}</p>
                {link && (
                  link.external ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-accent hover:underline">{link.label}</a>
                  ) : (
                    <Link href={link.href} className="mt-2 inline-block text-xs text-accent hover:underline">{link.label}</Link>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Related Brands ── */}
      {related.length > 0 && (
        <section className="mb-12">
          <h2 className="font-heading text-xl font-bold text-white mb-4">Related Brands</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r}
                href={`/best/${r}`}
                className="rounded-full border border-[rgba(255,255,255,0.06)] bg-[#141414] px-4 py-2 text-sm text-text-secondary hover:border-accent/20 hover:text-white transition-colors"
              >
                Best {slugToBrand(r)} Reps
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <div className="space-y-3 mb-12">
        <h2 className="text-lg font-bold text-white">FAQ</h2>
        {[
          { q: `Where to buy ${brand} reps?`, a: `You can find ${brand} reps on MurmReps. Browse ${total}+ products and buy through agents like KakoBuy, Superbuy, or CnFans. Each product page has direct links to all 8 agents.` },
          { q: `Are ${brand} reps good quality?`, a: `Quality varies by seller and tier. MurmReps categorizes products as budget, value, quality, or premium. Check QC photos from your agent before shipping. Higher-tier items are closer to retail.` },
          { q: `How much do ${brand} reps cost?`, a: `${brand} reps on MurmReps range from ¥20 to ¥2000+ depending on the item and quality tier. Average price is ¥${avgPrice} (~€${(avgPrice * 0.127).toFixed(0)}). Plus shipping costs of €8-25 depending on weight and destination.` },
        ].map((faq) => (
          <div key={faq.q} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
            <p className="text-sm font-semibold text-white mb-2">{faq.q}</p>
            <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>

      {/* ── Internal Links ── */}
      <section className="mb-12">
        <h2 className="font-heading text-lg font-bold text-white mb-4">Explore More</h2>
        <div className="flex flex-wrap gap-2">
          <Link href={`/products?q=${encodeURIComponent(brand)}`} className="rounded-full border border-[rgba(255,255,255,0.06)] bg-[#141414] px-4 py-2 text-sm text-text-secondary hover:border-accent/20 hover:text-white transition-colors">
            All {brand} Products
          </Link>
          <Link href="/guides/how-to-buy-reps-kakobuy" className="rounded-full border border-[rgba(255,255,255,0.06)] bg-[#141414] px-4 py-2 text-sm text-text-secondary hover:border-accent/20 hover:text-white transition-colors">
            How to Buy Reps Guide
          </Link>
          <Link href="/sellers" className="rounded-full border border-[rgba(255,255,255,0.06)] bg-[#141414] px-4 py-2 text-sm text-text-secondary hover:border-accent/20 hover:text-white transition-colors">
            Trusted Sellers
          </Link>
          {SHOE_BRANDS.has(slug) && (
            <Link href="/best-batch" className="rounded-full border border-[rgba(255,255,255,0.06)] bg-[#141414] px-4 py-2 text-sm text-text-secondary hover:border-accent/20 hover:text-white transition-colors">
              Best Batch Comparisons
            </Link>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="rounded-xl bg-gradient-to-r from-[#FE4205] to-[#c2410c] p-8 text-center">
        <h2 className="text-xl font-bold text-white">Ready to buy {brand}?</h2>
        <p className="mt-2 text-white/80">Sign up to KakoBuy and start shopping.</p>
        <a href="https://ikako.vip/r/6gkjt" target="_blank" rel="noopener noreferrer"
          className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-bold text-[#FE4205]">Sign up to KakoBuy →</a>
      </div>

      {/* ── JSON-LD FAQ ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: `Where to buy ${brand} reps?`, acceptedAnswer: { "@type": "Answer", text: `Find ${brand} reps on MurmReps with ${total}+ products and 8 agent options.` } },
          { "@type": "Question", name: `Are ${brand} reps good quality?`, acceptedAnswer: { "@type": "Answer", text: `Quality varies by tier. Check QC photos before shipping. MurmReps categorizes by quality level.` } },
          { "@type": "Question", name: `How much do ${brand} reps cost?`, acceptedAnswer: { "@type": "Answer", text: `Average price ¥${avgPrice} (~€${(avgPrice * 0.127).toFixed(0)}). Range from ¥20 to ¥2000+.` } },
        ],
      }) }} />
    </div>
  );
}
