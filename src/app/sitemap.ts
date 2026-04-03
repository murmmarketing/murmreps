import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const AGENT_KEYS = ["kakobuy", "superbuy", "cnfans", "mulebuy", "acbuy", "lovegobuy", "joyagoo", "sugargoo"];
const TOP_BRANDS = [
  "chrome-hearts", "nike", "louis-vuitton", "balenciaga", "supreme", "gucci", "dior",
  "stussy", "acne-studios", "rick-owens", "prada", "hermes", "burberry", "ralph-lauren",
  "off-white", "vivienne-westwood", "moncler", "new-balance", "adidas", "jordan",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: "https://murmreps.com", lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: "https://murmreps.com/products", lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: "https://murmreps.com/girls", lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: "https://murmreps.com/brands", lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://murmreps.com/guides", lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://murmreps.com/guides/how-to-buy-reps-kakobuy", lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: "https://murmreps.com/guides/agent-comparison", lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: "https://murmreps.com/guides/budget-finds", lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: "https://murmreps.com/guides/girls-collection", lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: "https://murmreps.com/qc", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://murmreps.com/news", lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: "https://murmreps.com/referral", lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: "https://murmreps.com/converter", lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: "https://murmreps.com/wishlist", lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: "https://murmreps.com/terms", lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: "https://murmreps.com/privacy", lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Agent comparison pages (28 combinations)
  const comparePages: MetadataRoute.Sitemap = [];
  for (let i = 0; i < AGENT_KEYS.length; i++) {
    for (let j = i + 1; j < AGENT_KEYS.length; j++) {
      comparePages.push({
        url: `https://murmreps.com/compare/${AGENT_KEYS[i]}-vs-${AGENT_KEYS[j]}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  // Best brand pages
  const bestPages: MetadataRoute.Sitemap = TOP_BRANDS.map((slug) => ({
    url: `https://murmreps.com/best/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Brand pages
  const brandPages: MetadataRoute.Sitemap = TOP_BRANDS.map((slug) => ({
    url: `https://murmreps.com/brands/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Blog posts
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const blogPages: MetadataRoute.Sitemap = (posts || []).map((p) => ({
    url: `https://murmreps.com/news/${p.slug}`,
    lastModified: new Date(p.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // Product pages
  const { data: products } = await supabase
    .from("products")
    .select("id, created_at")
    .not("image", "is", null)
    .neq("image", "")
    .order("created_at", { ascending: false })
    .limit(50000);

  const productPages: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `https://murmreps.com/products/${p.id}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...comparePages, ...bestPages, ...brandPages, ...blogPages, ...productPages];
}
