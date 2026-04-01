import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const staticPages: MetadataRoute.Sitemap = [
    { url: "https://murmreps.com", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://murmreps.com/girls", lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: "https://murmreps.com/products", lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: "https://murmreps.com/verified", lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: "https://murmreps.com/news", lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: "https://murmreps.com/guide", lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: "https://murmreps.com/converter", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://murmreps.com/terms", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: "https://murmreps.com/privacy", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Fetch all product IDs — only need id and created_at
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

  return [...staticPages, ...productPages];
}
