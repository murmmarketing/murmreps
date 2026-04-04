const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const idx = line.indexOf("=");
  if (idx > 0) env[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const collections = [
  {
    slug: "summer-essentials",
    title: "Summer Essentials 2026",
    description: "Everything you need for summer. Tees, shorts, slides, sunglasses, and caps.",
    query: { categories: ["Shorts", "Slides & Sandals", "Shirts", "Sunglasses", "Hats & Caps"] },
  },
  {
    slug: "all-black",
    title: "All Black Everything",
    description: "Monochrome fits. Black hoodies, black jeans, black sneakers, black accessories.",
    query: { nameLike: "%black%" },
  },
  {
    slug: "under-10-euros",
    title: "Under €10 Steals",
    description: "The best finds under €10. Budget doesn't mean boring.",
    query: { maxPrice: 79 },
  },
  {
    slug: "designer-bags",
    title: "Designer Bags Collection",
    description: "Louis Vuitton, Chanel, Dior, Gucci, Prada — the bag collection.",
    query: { categories: ["Bags"] },
  },
  {
    slug: "sneaker-rotation",
    title: "Sneaker Rotation",
    description: "The best sneaker finds. Dunks, Jordans, New Balance, and more.",
    query: { categories: ["Shoes"] },
  },
];

async function seed() {
  for (const col of collections) {
    let query = supabase
      .from("products")
      .select("id")
      .not("image", "is", null)
      .neq("image", "")
      .order("score", { ascending: false })
      .limit(20);

    if (col.query.categories) query = query.in("category", col.query.categories);
    if (col.query.nameLike) query = query.ilike("name", col.query.nameLike);
    if (col.query.maxPrice) query = query.lt("price_cny", col.query.maxPrice).gt("price_cny", 0);

    const { data: products } = await query;
    const ids = (products || []).map((p) => p.id);

    // Get cover image from first product
    let coverUrl = null;
    if (ids.length > 0) {
      const { data: first } = await supabase.from("products").select("image").eq("id", ids[0]).single();
      coverUrl = first?.image || null;
    }

    const { error } = await supabase.from("collections").upsert({
      slug: col.slug,
      title: col.title,
      description: col.description,
      cover_image_url: coverUrl,
      product_ids: ids,
      is_published: true,
    }, { onConflict: "slug" });

    if (error) console.error(`Error: ${col.slug}`, error.message);
    else console.log(`✓ ${col.slug} — ${ids.length} products`);
  }
  console.log("Done!");
}

seed();
