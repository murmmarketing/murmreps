import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

const BRAND_INTROS: Record<string, string> = {
  "chrome-hearts": "Chrome Hearts is the holy grail of luxury streetwear. Known for gothic crosses, dagger motifs, and sterling silver jewelry. Their hoodies, t-shirts, and accessories are some of the most sought-after reps in the community.",
  nike: "Nike needs no introduction. From Air Force 1s to Tech Fleece, Nike reps cover sneakers, hoodies, tracksuits, and accessories. The swoosh is the most recognizable logo in fashion.",
  "louis-vuitton": "Louis Vuitton represents the pinnacle of French luxury. LV bags, wallets, belts, and sneakers are among the most replicated items. The monogram pattern is iconic.",
  balenciaga: "Balenciaga pushes the boundaries of luxury fashion. Their Triple S sneakers, oversized hoodies, and track jackets are streetwear staples.",
  supreme: "Supreme is the king of streetwear. Box logo hoodies, t-shirts, accessories, and collaborations are always in demand.",
  gucci: "Gucci brings Italian luxury to streetwear. Their belts, bags, sneakers, and clothing feature the iconic GG pattern and green-red stripe.",
  dior: "Dior combines haute couture with modern street style. Dior bags, B23 sneakers, jewelry, and clothing are luxury must-haves.",
  stussy: "Stussy is California surf culture meets streetwear. Their graphic tees, hoodies, and accessories are casual classics.",
  "acne-studios": "Acne Studios brings Scandinavian minimalism to fashion. Known for clean-cut jeans, scarves, and knitwear in neutral tones.",
  "rick-owens": "Rick Owens is the dark lord of fashion. Geobaskets, ramones, and avant-garde silhouettes define the dark aesthetic movement.",
  prada: "Prada is Italian luxury at its finest. Bags, shoes, and accessories with the iconic triangle logo.",
  hermes: "Hermès is the ultimate luxury house. Belts, scarves, Oran sandals, and bags are timeless investment pieces.",
  burberry: "Burberry is British heritage luxury. Their check pattern appears on scarves, belts, bags, and outerwear.",
  "ralph-lauren": "Ralph Lauren is American classic style. Polos, sweaters, caps, and accessories define the old money aesthetic.",
  "off-white": "Off-White bridges streetwear and high fashion. Diagonal stripes, zip ties, and bold graphics on hoodies and sneakers.",
  "vivienne-westwood": "Vivienne Westwood brings punk rock to luxury. Saturn orb jewelry, belts, and bags are iconic statement pieces.",
  moncler: "Moncler is the king of luxury outerwear. Puffer jackets, vests, and accessories for cold weather style.",
  "new-balance": "New Balance has become a fashion staple. The 550, 2002R, and collaboration sneakers are the most popular models.",
  adidas: "Adidas spans sport and street. Sambas, Campus, and Yeezy collaborations alongside tracksuits and accessories.",
  jordan: "Jordan Brand is basketball heritage meets streetwear. Jordan 1, 4, and 11 are the most sought-after silhouettes.",
};

function slugToBrand(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = slugToBrand(slug);
  const title = `Best ${brand} Reps 2026 — Top Finds | MurmReps`;
  const desc = `The best ${brand} replica finds in 2026. Compare prices across 8 agents. Quality-checked and community-verified.`;
  return { title, description: desc, openGraph: { title, description: desc } };
}

export default async function BestBrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = slugToBrand(slug);
  const intro = BRAND_INTROS[slug];

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-white mb-2">
        Best {brand} Reps 2026
      </h1>
      <p className="text-text-secondary mb-6">
        {intro || `Browse the top ${brand} replica finds, quality-checked and community-verified.`}
      </p>

      <p className="text-sm text-text-muted mb-8">
        {total} products available · Average price: ¥{avgPrice} (~€{(avgPrice * 0.127).toFixed(0)})
      </p>

      {/* Top products */}
      <div className="space-y-4 mb-12">
        {items.map((p, i) => (
          <div key={p.id} className="flex gap-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4 transition-all hover:border-accent/20">
            <div className="shrink-0 w-24 h-24 rounded-lg bg-[#0a0a0a] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} className="h-full w-full object-contain" loading="lazy" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs text-accent font-bold">#{i + 1}</span>
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
        ))}
      </div>

      <Link href={`/brands/${slug}`}
        className="block w-full text-center rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] py-4 text-sm font-medium text-accent hover:bg-[#1a1a1a] transition-colors mb-12">
        View all {total} {brand} products →
      </Link>

      {/* FAQ */}
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

      {/* CTA */}
      <div className="rounded-xl bg-gradient-to-r from-[#FE4205] to-[#c2410c] p-8 text-center">
        <h2 className="text-xl font-bold text-white">Ready to buy {brand}?</h2>
        <p className="mt-2 text-white/80">Sign up to KakoBuy and start shopping.</p>
        <a href="https://ikako.vip/r/6gkjt" target="_blank" rel="noopener noreferrer"
          className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-bold text-[#FE4205]">Sign up to KakoBuy →</a>
      </div>

      {/* JSON-LD FAQ */}
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
