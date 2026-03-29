import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: "https://murmreps.com", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://murmreps.com/products", lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: "https://murmreps.com/girls", lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: "https://murmreps.com/verified", lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: "https://murmreps.com/guide", lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: "https://murmreps.com/news", lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: "https://murmreps.com/converter", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://murmreps.com/terms", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: "https://murmreps.com/privacy", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Dynamic product pages — paginate through all IDs
  let allProducts: { id: number; created_at: string }[] = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data } = await supabase
      .from("products")
      .select("id, created_at")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE - 1);
    if (!data || data.length === 0) break;
    allProducts = allProducts.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  const productPages: MetadataRoute.Sitemap = allProducts.map((p) => ({
    url: `https://murmreps.com/products/${p.id}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticPages, ...productPages];
}
