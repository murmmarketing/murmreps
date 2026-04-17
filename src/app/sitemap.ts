import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const AGENT_KEYS = ["kakobuy", "superbuy", "cnfans", "mulebuy", "acbuy", "oopbuy", "lovegobuy", "joyagoo", "sugargoo"];
const TOP_BRANDS = [
  "chrome-hearts", "nike", "louis-vuitton", "balenciaga", "supreme", "gucci", "dior",
  "stussy", "acne-studios", "rick-owens", "prada", "hermes", "burberry", "ralph-lauren",
  "off-white", "vivienne-westwood", "moncler", "new-balance", "adidas", "jordan",
];
const BEST_BATCH_SHOES = [
  "jordan-4", "nike-dunk", "jordan-1", "yeezy-350", "new-balance-550",
  "air-force-1", "jordan-11", "nike-air-max", "balenciaga-runner", "dior-b22",
];
const GUIDE_SLUGS = [
  "how-to-buy-reps-kakobuy", "agent-comparison", "budget-finds",
  "girls-collection", "sizing-guide", "color-guide", "streetwear-styling",
];

const BASE = "https://murmreps.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const now = new Date();

  // ── Static pages ──────────────────────────────────────────��───
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/girls`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/new`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/brands`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/collections`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/sellers`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/deals`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/giveaway`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/best-batch`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/news`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/agents`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/converter`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/tracking`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/qc`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/verified`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/referral`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/wishlist`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/image-search`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/outfit`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/haul`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  // ── SEO landing pages ─────────────────────────────────────────
  const seoPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/kakobuy-spreadsheet`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/best-weidian-sellers`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/how-to-buy-reps`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  // ── Guide pages ───────────────────────────────────────────────
  const guidePages: MetadataRoute.Sitemap = GUIDE_SLUGS.map((slug) => ({
    url: `${BASE}/guides/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // ── Best batch pages ──────────────────────────────────────────
  const bestBatchPages: MetadataRoute.Sitemap = BEST_BATCH_SHOES.map((slug) => ({
    url: `${BASE}/best-batch/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // ── Agent comparison pages ────────────────────────────────────
  const comparePages: MetadataRoute.Sitemap = [];
  for (let i = 0; i < AGENT_KEYS.length; i++) {
    for (let j = i + 1; j < AGENT_KEYS.length; j++) {
      comparePages.push({
        url: `${BASE}/compare/${AGENT_KEYS[i]}-vs-${AGENT_KEYS[j]}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  // ── Best brand pages ──────────────────────────────────────────
  const bestPages: MetadataRoute.Sitemap = TOP_BRANDS.map((slug) => ({
    url: `${BASE}/best/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // ── Brand pages ───────────────────────────────────────────────
  const brandPages: MetadataRoute.Sitemap = TOP_BRANDS.map((slug) => ({
    url: `${BASE}/brands/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // ── Collections from Supabase ─────────────────────────────────
  const { data: collections } = await supabase
    .from("collections")
    .select("slug, updated_at")
    .eq("published", true);

  const collectionPages: MetadataRoute.Sitemap = (collections || []).map((c) => ({
    url: `${BASE}/collections/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // ── Blog posts from Supabase ──────────────────────────────────
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const blogPages: MetadataRoute.Sitemap = (posts || []).map((p) => ({
    url: `${BASE}/news/${p.slug}`,
    lastModified: new Date(p.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // ── Product pages from Supabase ───────────────────────────────
  const { data: products } = await supabase
    .from("products")
    .select("id, created_at")
    .not("image", "is", null)
    .neq("image", "")
    .order("created_at", { ascending: false })
    .limit(50000);

  const productPages: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${BASE}/products/${p.id}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...seoPages,
    ...guidePages,
    ...bestBatchPages,
    ...comparePages,
    ...bestPages,
    ...brandPages,
    ...collectionPages,
    ...blogPages,
    ...productPages,
  ];
}
