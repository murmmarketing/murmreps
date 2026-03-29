const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load env
const envPath = path.join(__dirname, "..", ".env.local");
fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) process.env[key.trim()] = vals.join("=").trim();
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function fetchAll() {
  let all = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, brand, category, price_cny, tier, image, collection, views, likes")
      .range(from, from + PAGE - 1);
    if (error) { console.error(error.message); break; }
    all = all.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  Step 3: Add featured columns & select featured products");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Step 3a: Add featured and featured_rank columns (idempotent via ALTER)
  console.log("Adding featured columns...");

  // Use raw SQL via rpc - but Supabase JS doesn't support raw SQL easily
  // Instead, we'll just try updating and if the column doesn't exist, we handle it
  // Let's test if the column exists first
  const { data: testData, error: testErr } = await supabase
    .from("products")
    .select("featured")
    .limit(1);

  if (testErr && testErr.message.includes("featured")) {
    console.log("Column 'featured' doesn't exist yet. Please run this SQL in Supabase dashboard:");
    console.log("  ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;");
    console.log("  ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_rank INTEGER;");
    console.log("\nRun that SQL, then re-run this script.");
    process.exit(1);
  }
  console.log("Featured columns exist.\n");

  // Reset all featured flags
  console.log("Resetting all featured flags...");
  await supabase.from("products").update({ featured: false, featured_rank: null }).neq("id", 0);

  // Fetch all products
  const allProducts = await fetchAll();
  console.log(`Fetched ${allProducts.length} products\n`);

  // Only consider products with images
  const withImages = allProducts.filter(p => p.image && p.image.trim() !== "");
  console.log(`Products with images: ${withImages.length}\n`);

  // ─── Selection algorithm ───
  // Split by collection
  const mainProducts = withImages.filter(p => p.collection === "main");
  const girlsProducts = withImages.filter(p => p.collection === "girls");

  // Target: ~60 main, ~40 girls
  const MAIN_TARGET = 60;
  const GIRLS_TARGET = 40;
  const MAX_PER_BRAND = 5;

  function selectFeatured(products, target, priorityCats) {
    // Score each product
    const scored = products.map(p => {
      let score = 0;
      // Views weight (most important — proven engagement)
      score += (p.views || 0) * 1.0;
      // Likes weight (quality signal)
      score += (p.likes || 0) * 5.0;
      // Priority category bonus
      if (priorityCats.includes(p.category)) score += 50;
      // Penalty for unknown brand
      if (p.brand === "Various") score -= 20;
      // Price diversity bonus for budget items (under-represented in featured usually)
      if (p.price_cny && p.price_cny < 200) score += 10;
      return { ...p, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    const selected = [];
    const brandCounts = {};
    const categoryCounts = {};

    for (const p of scored) {
      if (selected.length >= target) break;

      const brand = p.brand || "Unknown";
      const cat = p.category || "Other";

      // Enforce max per brand
      if ((brandCounts[brand] || 0) >= MAX_PER_BRAND) continue;

      // Soft cap per category (max 8 per category to ensure diversity)
      if ((categoryCounts[cat] || 0) >= 8) continue;

      selected.push(p);
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    return selected;
  }

  const mainPriorityCats = ["Hoodies", "Sneakers", "Jackets", "T-Shirts", "Pants", "Bags", "Jeans", "Shorts"];
  const girlsPriorityCats = ["Bags", "Shoes", "Jewelry", "Accessories", "Necklaces", "Bracelets", "Earrings", "Boots", "Slides & Sandals"];

  const mainFeatured = selectFeatured(mainProducts, MAIN_TARGET, mainPriorityCats);
  const girlsFeatured = selectFeatured(girlsProducts, GIRLS_TARGET, girlsPriorityCats);

  const allFeatured = [...mainFeatured, ...girlsFeatured];

  console.log(`Selected ${mainFeatured.length} main featured products`);
  console.log(`Selected ${girlsFeatured.length} girls featured products`);
  console.log(`Total featured: ${allFeatured.length}\n`);

  // Print featured products
  console.log("═══ MAIN FEATURED ═══");
  console.log("Rank | ID    | Score | Views | Likes | Brand            | Category     | Price | Name");
  console.log("─".repeat(120));
  mainFeatured.forEach((p, i) => {
    console.log(
      `${String(i + 1).padStart(4)} | ${String(p.id).padStart(5)} | ${String(Math.round(p.score)).padStart(5)} | ${String(p.views || 0).padStart(5)} | ${String(p.likes || 0).padStart(5)} | ${(p.brand || "").padEnd(16).slice(0, 16)} | ${(p.category || "").padEnd(12).slice(0, 12)} | ${p.price_cny ? ("¥" + p.price_cny).padStart(6) : "   N/A"} | ${(p.name || "").slice(0, 40)}`
    );
  });

  console.log("\n═══ GIRLS FEATURED ═══");
  console.log("Rank | ID    | Score | Views | Likes | Brand            | Category     | Price | Name");
  console.log("─".repeat(120));
  girlsFeatured.forEach((p, i) => {
    console.log(
      `${String(i + 1).padStart(4)} | ${String(p.id).padStart(5)} | ${String(Math.round(p.score)).padStart(5)} | ${String(p.views || 0).padStart(5)} | ${String(p.likes || 0).padStart(5)} | ${(p.brand || "").padEnd(16).slice(0, 16)} | ${(p.category || "").padEnd(12).slice(0, 12)} | ${p.price_cny ? ("¥" + p.price_cny).padStart(6) : "   N/A"} | ${(p.name || "").slice(0, 40)}`
    );
  });

  // Brand diversity check
  console.log("\n═══ BRAND DIVERSITY ═══");
  const brandCheck = {};
  allFeatured.forEach(p => {
    brandCheck[p.brand] = (brandCheck[p.brand] || 0) + 1;
  });
  Object.entries(brandCheck).sort((a, b) => b[1] - a[1]).forEach(([brand, count]) => {
    console.log(`  ${brand.padEnd(20)} ${count}`);
  });

  // Category diversity check
  console.log("\n═══ CATEGORY DIVERSITY ═══");
  const catCheck = {};
  allFeatured.forEach(p => {
    catCheck[p.category] = (catCheck[p.category] || 0) + 1;
  });
  Object.entries(catCheck).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`  ${cat.padEnd(20)} ${count}`);
  });

  // ─── Update Supabase ───
  console.log("\n\nUpdating Supabase...");

  // Batch update in groups of 50
  for (let i = 0; i < allFeatured.length; i += 50) {
    const batch = allFeatured.slice(i, i + 50);
    for (let j = 0; j < batch.length; j++) {
      const p = batch[j];
      const rank = i + j + 1;
      const { error } = await supabase
        .from("products")
        .update({ featured: true, featured_rank: rank })
        .eq("id", p.id);
      if (error) console.error(`Error updating ${p.id}:`, error.message);
    }
    console.log(`  Updated batch ${Math.floor(i / 50) + 1}/${Math.ceil(allFeatured.length / 50)}`);
  }

  // Verify
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("featured", true);

  console.log(`\nDone! ${count} products marked as featured.`);
}

main().catch(console.error);
