#!/usr/bin/env node

/**
 * Tag "Unique" products — one-of-a-kind items where no other product
 * shares the same brand + category combination.
 *
 * Usage: node scripts/tag-unique.js
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

async function main() {
  console.log("Fetching all products...");

  // Fetch all products with id, brand, category
  let all = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id,brand,category")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  console.log(`Total products: ${all.length}`);

  // Count how many products share each brand+category combo
  const comboCounts = {};
  for (const p of all) {
    const key = `${p.brand}|||${p.category}`;
    if (!comboCounts[key]) comboCounts[key] = [];
    comboCounts[key].push(p.id);
  }

  // Find combos with exactly 1 product
  const uniqueIds = [];
  for (const [key, ids] of Object.entries(comboCounts)) {
    if (ids.length === 1) {
      uniqueIds.push(ids[0]);
    }
  }

  console.log(`Found ${uniqueIds.length} one-of-a-kind products (unique brand+category combo)`);

  // Filter out products already in special categories like "Old Money"
  // and products without images (they won't display well)
  const { data: candidates, error: candErr } = await supabase
    .from("products")
    .select("id,name,brand,category,image,score")
    .in("id", uniqueIds.slice(0, 1000)); // Supabase .in() limit
  if (candErr) throw candErr;

  // Fetch remaining if > 1000
  let allCandidates = [...(candidates || [])];
  if (uniqueIds.length > 1000) {
    for (let i = 1000; i < uniqueIds.length; i += 1000) {
      const batch = uniqueIds.slice(i, i + 1000);
      const { data: more } = await supabase
        .from("products")
        .select("id,name,brand,category,image,score")
        .in("id", batch);
      if (more) allCandidates.push(...more);
    }
  }

  // Filter: must have image, not already "Unique" or "Old Money", score > 0
  const eligible = allCandidates.filter(
    (p) =>
      p.image &&
      p.image !== "" &&
      p.category !== "Unique" &&
      p.category !== "Old Money" &&
      (p.score || 0) > 0
  );

  // Sort by score descending, take top products
  eligible.sort((a, b) => (b.score || 0) - (a.score || 0));

  console.log(`Eligible after filtering: ${eligible.length}`);
  console.log("\nTop 20 unique finds:");
  eligible.slice(0, 20).forEach((p, i) => {
    console.log(`  ${i + 1}. [${p.brand}] ${p.name} (was: ${p.category}, score: ${p.score})`);
  });

  // Tag all eligible products as category "Unique"
  const idsToTag = eligible.map((p) => p.id);
  console.log(`\nTagging ${idsToTag.length} products as "Unique"...`);

  // Batch update in chunks of 500
  for (let i = 0; i < idsToTag.length; i += 500) {
    const batch = idsToTag.slice(i, i + 500);
    const { error: upErr } = await supabase
      .from("products")
      .update({ category: "Unique" })
      .in("id", batch);
    if (upErr) {
      console.error(`Error updating batch at ${i}:`, upErr.message);
    } else {
      console.log(`  Updated ${Math.min(i + 500, idsToTag.length)}/${idsToTag.length}`);
    }
  }

  console.log("Done!");
}

main().catch(console.error);
