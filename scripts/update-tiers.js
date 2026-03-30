#!/usr/bin/env node
/**
 * Update all product tiers from 3-tier (budget/mid/premium) to 4-tier system:
 *   budget:  < ¥150
 *   value:   ¥150 - ¥399
 *   quality: ¥400 - ¥799
 *   premium: ≥ ¥800
 *   null price => null tier
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Read .env.local
const envPath = path.join(__dirname, "..", ".env.local");
const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
    const [k, ...rest] = trimmed.split("=");
    env[k.trim()] = rest.join("=").trim();
  }
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

function getTier(priceCny) {
  if (priceCny == null) return null;
  if (priceCny < 150) return "budget";
  if (priceCny < 400) return "value";
  if (priceCny < 800) return "quality";
  return "premium";
}

async function main() {
  console.log("Fetching all products...");

  // Fetch all products in batches
  let allProducts = [];
  let from = 0;
  const batchSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id, price_cny, tier")
      .range(from, from + batchSize - 1);
    if (error) {
      console.error("Error fetching:", error);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    allProducts = allProducts.concat(data);
    if (data.length < batchSize) break;
    from += batchSize;
  }

  console.log(`Total products: ${allProducts.length}`);

  // Group products by their new tier
  const updates = {}; // tier -> [ids]
  const nullTierIds = [];
  let changed = 0;

  for (const p of allProducts) {
    const newTier = getTier(p.price_cny);
    if (newTier !== p.tier) {
      changed++;
      if (newTier === null) {
        nullTierIds.push(p.id);
      } else {
        if (!updates[newTier]) updates[newTier] = [];
        updates[newTier].push(p.id);
      }
    }
  }

  console.log(`Products needing tier update: ${changed}`);

  // Batch update by tier
  for (const [tier, ids] of Object.entries(updates)) {
    // Update in chunks of 500
    for (let i = 0; i < ids.length; i += 500) {
      const chunk = ids.slice(i, i + 500);
      const { error } = await supabase
        .from("products")
        .update({ tier })
        .in("id", chunk);
      if (error) {
        console.error(`Error updating tier=${tier}:`, error);
      }
    }
    console.log(`  Updated ${ids.length} products to tier="${tier}"`);
  }

  // Set null tier for null-price products
  if (nullTierIds.length > 0) {
    for (let i = 0; i < nullTierIds.length; i += 500) {
      const chunk = nullTierIds.slice(i, i + 500);
      const { error } = await supabase
        .from("products")
        .update({ tier: null })
        .in("id", chunk);
      if (error) {
        console.error("Error setting null tier:", error);
      }
    }
    console.log(`  Set ${nullTierIds.length} products to tier=null`);
  }

  // Count final distribution
  console.log("\n--- Final tier distribution ---");
  for (const tier of ["budget", "value", "quality", "premium"]) {
    const { count, error } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("tier", tier);
    if (error) console.error(`Count error for ${tier}:`, error);
    else console.log(`  ${tier}: ${count}`);
  }
  const { count: nullCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .is("tier", null);
  console.log(`  null: ${nullCount}`);

  console.log("\nDone!");
}

main().catch(console.error);
