#!/usr/bin/env node

/**
 * Product Scoring System
 * Scores all products on 5 factors (0-20 each, total 0-100)
 * Then updates featured products based on scores.
 *
 * Usage: node scripts/score-products.js
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load env
fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8").split("\n").forEach((line) => {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) process.env[key.trim()] = vals.join("=").trim();
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// ─── Brand Tiers ───
const BRAND_TIERS = {
  S: ["Nike", "Jordan", "Louis Vuitton", "Dior", "Balenciaga", "Chrome Hearts"],
  A: ["Gucci", "Prada", "Moncler", "Supreme", "Off-White", "Amiri", "Rick Owens", "Hermes", "Chanel"],
  B: ["Stone Island", "The North Face", "Arc'teryx", "Gallery Dept", "Stussy", "Burberry", "Fendi", "Acne Studios", "Maison Margiela", "New Balance", "ASICS", "Corteiz", "Trapstar", "FOG Essentials", "Vivienne Westwood"],
  C: ["Ralph Lauren", "Lacoste", "Adidas", "Represent", "Palm Angels", "Versace", "Givenchy", "Carhartt", "BAPE", "Undercover", "Raf Simons"],
};

// Normalize brand names for matching (case-insensitive)
const brandTierMap = new Map();
for (const [tier, brands] of Object.entries(BRAND_TIERS)) {
  for (const brand of brands) {
    brandTierMap.set(brand.toLowerCase(), tier);
  }
}

// ─── Category Demand ───
const CATEGORY_DEMAND = {};
const addCategories = (cats, score) => cats.forEach((c) => (CATEGORY_DEMAND[c] = score));
addCategories(["Shoes", "Sneakers", "Boots", "Slides", "Slides & Sandals"], 20);
addCategories(["Jackets", "Outerwear", "Coats", "Coats & Puffers", "Tracksuits", "Vests"], 18);
addCategories(["Bags"], 16);
addCategories(["T-Shirts", "Shirts", "Hoodies", "Polos", "Sweaters", "Long Sleeves", "Jerseys", "Tank Tops", "Crewnecks"], 14);
addCategories(["Old Money"], 14);
addCategories(["Pants", "Jeans", "Shorts", "Bottoms", "Sweatpants"], 12);
addCategories(["Hats & Caps", "Belts", "Sunglasses", "Glasses", "Scarves", "Scarves & Gloves", "Socks", "Socks & Underwear", "Watches"], 10);
addCategories(["Accessories"], 10);
addCategories(["Necklaces", "Bracelets", "Earrings", "Rings", "Jewelry"], 8);
addCategories(["Wallets"], 6);
addCategories(["Home & Decor", "Electronics", "Phone Cases", "Keychains", "Keychains & Accessories", "Perfumes"], 6);

// ─── Scoring Functions ───

function scorePriceAppeal(product, medianPrice) {
  if (!product.price_cny || !medianPrice || medianPrice === 0) return 0;
  const ratio = product.price_cny / medianPrice;
  if (ratio < 0.25) return 20;
  if (ratio < 0.50) return 15;
  if (ratio < 0.75) return 12;
  if (ratio <= 1.25) return 8;
  if (ratio <= 2.00) return 5;
  return 2;
}

function scoreEngagement(product) {
  const views = product.views || 0;
  const likes = product.likes || 0;
  let score = 0;
  if (views > 500) score = 20;
  else if (views > 200) score = 16;
  else if (views > 100) score = 12;
  else if (views > 50) score = 8;
  else if (views > 20) score = 5;
  else if (views > 0) score = 2;

  // Bonus for high like rate
  if (views > 0 && (likes / views) > 0.10) {
    score = Math.min(20, score + 3);
  }
  return score;
}

function scoreBrandPower(product) {
  const brand = (product.brand || "").toLowerCase();
  const tier = brandTierMap.get(brand);
  if (tier === "S") return 20;
  if (tier === "A") return 16;
  if (tier === "B") return 12;
  if (tier === "C") return 8;
  return 4; // D tier: Various and all others
}

function scoreCategoryDemand(product) {
  return CATEGORY_DEMAND[product.category] || 6;
}

function scoreImageQuality(product) {
  if (!product.image || product.image === "") return 0;
  let score = 10; // base for having an image
  if (product.image.includes("yupoo")) score += 5;
  if (product.featured) score += 5;
  if (product.quality != null && product.quality !== "") score += 5;
  return Math.min(20, score);
}

// ─── Main ───

async function main() {
  console.log("🔍 Checking if score column exists...");
  const { data: testData, error: testError } = await supabase
    .from("products")
    .select("id, score")
    .limit(1);

  if (testError && testError.message.includes("score")) {
    console.error("❌ Column 'score' does not exist. Please add columns first:");
    console.error("   ALTER TABLE products ADD COLUMN score integer DEFAULT 0;");
    console.error("   ALTER TABLE products ADD COLUMN score_breakdown jsonb DEFAULT '{}';");
    process.exit(1);
  }
  console.log("✅ Score column exists.");

  // Fetch ALL products (paginate 1000 at a time)
  console.log("\n📦 Fetching all products...");
  const allProducts = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, brand, category, price_cny, views, likes, image, featured, quality, collection")
      .range(offset, offset + 999);
    if (error) {
      console.error("Error fetching products:", error.message);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    allProducts.push(...data);
    if (data.length < 1000) break;
    offset += 1000;
  }
  console.log(`   Fetched ${allProducts.length} products.`);

  // Calculate median price per category
  console.log("\n📊 Calculating median prices per category...");
  const categoryPrices = {};
  for (const p of allProducts) {
    if (p.price_cny && p.category) {
      if (!categoryPrices[p.category]) categoryPrices[p.category] = [];
      categoryPrices[p.category].push(p.price_cny);
    }
  }

  const medianPrices = {};
  for (const [cat, prices] of Object.entries(categoryPrices)) {
    prices.sort((a, b) => a - b);
    const mid = Math.floor(prices.length / 2);
    medianPrices[cat] = prices.length % 2 === 0
      ? (prices[mid - 1] + prices[mid]) / 2
      : prices[mid];
  }

  console.log("   Categories with median prices:");
  for (const [cat, median] of Object.entries(medianPrices).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
    console.log(`     ${cat}: ¥${median}`);
  }

  // Score all products
  console.log("\n🎯 Scoring products...");
  const updates = [];
  for (const product of allProducts) {
    const median = medianPrices[product.category] || 0;
    const priceAppeal = scorePriceAppeal(product, median);
    const engagement = scoreEngagement(product);
    const brandPower = scoreBrandPower(product);
    const categoryDemand = scoreCategoryDemand(product);
    const imageQuality = scoreImageQuality(product);
    const total = priceAppeal + engagement + brandPower + categoryDemand + imageQuality;

    updates.push({
      id: product.id,
      score: total,
      score_breakdown: {
        price_appeal: priceAppeal,
        engagement,
        brand_power: brandPower,
        category_demand: categoryDemand,
        image_quality: imageQuality,
      },
    });
  }

  // Batch update 50 at a time
  console.log(`\n💾 Updating ${updates.length} products (50 at a time)...`);
  let updated = 0;
  let errors = 0;
  for (let i = 0; i < updates.length; i += 50) {
    const batch = updates.slice(i, i + 50);
    const promises = batch.map((u) =>
      supabase
        .from("products")
        .update({ score: u.score, score_breakdown: u.score_breakdown })
        .eq("id", u.id)
    );
    const results = await Promise.all(promises);
    for (const r of results) {
      if (r.error) {
        errors++;
        if (errors <= 3) console.error(`   Error: ${r.error.message}`);
      } else {
        updated++;
      }
    }
    if ((i + 50) % 500 === 0 || i + 50 >= updates.length) {
      console.log(`   Progress: ${Math.min(i + 50, updates.length)}/${updates.length}`);
    }
  }
  console.log(`   ✅ Updated: ${updated}, Errors: ${errors}`);

  // ─── Analysis ───
  console.log("\n═══════════════════════════════════════");
  console.log("           SCORE ANALYSIS");
  console.log("═══════════════════════════════════════");

  const buckets = { "80-100": 0, "60-79": 0, "40-59": 0, "20-39": 0, "0-19": 0 };
  for (const u of updates) {
    if (u.score >= 80) buckets["80-100"]++;
    else if (u.score >= 60) buckets["60-79"]++;
    else if (u.score >= 40) buckets["40-59"]++;
    else if (u.score >= 20) buckets["20-39"]++;
    else buckets["0-19"]++;
  }
  console.log("\n📊 Score Distribution:");
  for (const [range, count] of Object.entries(buckets)) {
    const bar = "█".repeat(Math.round(count / Math.max(1, updates.length) * 50));
    console.log(`   ${range}: ${count.toString().padStart(5)} ${bar}`);
  }

  const sorted = [...updates].sort((a, b) => b.score - a.score);
  const productMap = new Map(allProducts.map((p) => [p.id, p]));

  console.log("\n🏆 Top 20 Products:");
  for (const u of sorted.slice(0, 20)) {
    const p = productMap.get(u.id);
    const bd = u.score_breakdown;
    console.log(
      `   [${u.score}] ${(p.name || "").substring(0, 50).padEnd(50)} | P:${bd.price_appeal} E:${bd.engagement} B:${bd.brand_power} C:${bd.category_demand} I:${bd.image_quality}`
    );
  }

  console.log("\n📉 Bottom 20 Products:");
  for (const u of sorted.slice(-20)) {
    const p = productMap.get(u.id);
    const bd = u.score_breakdown;
    console.log(
      `   [${u.score}] ${(p.name || "").substring(0, 50).padEnd(50)} | P:${bd.price_appeal} E:${bd.engagement} B:${bd.brand_power} C:${bd.category_demand} I:${bd.image_quality}`
    );
  }

  // ─── Step 2: Update Featured Products ───
  console.log("\n═══════════════════════════════════════");
  console.log("       UPDATING FEATURED PRODUCTS");
  console.log("═══════════════════════════════════════");

  // Clear all featured
  console.log("\n🧹 Clearing all featured flags...");
  let clearOffset = 0;
  while (true) {
    const { data: featuredBatch } = await supabase
      .from("products")
      .select("id")
      .eq("featured", true)
      .range(clearOffset, clearOffset + 999);
    if (!featuredBatch || featuredBatch.length === 0) break;
    const ids = featuredBatch.map((p) => p.id);
    await supabase
      .from("products")
      .update({ featured: false, featured_rank: null })
      .in("id", ids);
    clearOffset += 1000;
    if (featuredBatch.length < 1000) break;
  }
  console.log("   ✅ Cleared.");

  // Build scored list with product details
  const scoredProducts = sorted.map((u) => ({
    ...u,
    ...productMap.get(u.id),
  }));

  // Top 60 main products (with images, score >= 50)
  const mainFeatured = scoredProducts
    .filter((p) => p.image && p.image !== "" && p.score >= 50 && (p.collection === "main" || p.collection === "both" || !p.collection))
    .slice(0, 60);

  console.log(`\n⭐ Setting ${mainFeatured.length} main featured products...`);
  for (let i = 0; i < mainFeatured.length; i++) {
    await supabase
      .from("products")
      .update({ featured: true, featured_rank: i + 1 })
      .eq("id", mainFeatured[i].id);
  }

  // Top 40 girls products (with images, score >= 40)
  const girlsFeatured = scoredProducts
    .filter((p) => p.image && p.image !== "" && p.score >= 40 && (p.collection === "girls" || p.collection === "both"))
    .slice(0, 40);

  console.log(`⭐ Setting ${girlsFeatured.length} girls featured products...`);
  for (let i = 0; i < girlsFeatured.length; i++) {
    await supabase
      .from("products")
      .update({ featured: true, featured_rank: i + 1 })
      .eq("id", girlsFeatured[i].id);
  }

  console.log("\n✅ All done! Featured products updated based on scores.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
