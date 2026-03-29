const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8").split("\n").forEach((line) => {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) process.env[key.trim()] = vals.join("=").trim();
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function fetchAll() {
  let all = [], off = 0;
  while (true) {
    const { data } = await supabase.from("products").select("id,name,brand,category,collection").range(off, off + 999);
    if (!data || !data.length) break;
    all.push(...data);
    if (data.length < 1000) break;
    off += 1000;
  }
  return all;
}

async function batchUpdate(ids, updates, label) {
  if (!ids.length) { console.log(`  ${label}: 0`); return 0; }
  let n = 0;
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const { error } = await supabase.from("products").update(updates).in("id", batch);
    if (error) console.error(`  ERR:`, error.message);
    else n += batch.length;
  }
  console.log(`  ${label}: ${n}`);
  return n;
}

const lo = (p) => (p.name || "").toLowerCase();
const has = (p, kw) => lo(p).includes(kw);
const word = (p, w) => new RegExp(`\\b${w}\\b`, "i").test(p.name || "");

async function main() {
  const all = await fetchAll();
  console.log(`Total products: ${all.length}\n`);
  let total = 0;

  // ═══════════════════════════════════════════════
  // PHASE 1: Merge small categories into parents
  // ═══════════════════════════════════════════════
  console.log("═══ PHASE 1: Merge small/duplicate categories ═══\n");

  // Merge Necklaces → Jewelry
  total += await batchUpdate(
    all.filter(p => p.category === "Necklaces").map(p => p.id),
    { category: "Jewelry" }, "Necklaces → Jewelry"
  );

  // Merge Bracelets → Jewelry
  total += await batchUpdate(
    all.filter(p => p.category === "Bracelets").map(p => p.id),
    { category: "Jewelry" }, "Bracelets → Jewelry"
  );

  // Merge Earrings → Jewelry (fix false positives first)
  // The 1 FP (S925 Sterling Silver) is actually jewelry, so merge all
  total += await batchUpdate(
    all.filter(p => p.category === "Earrings").map(p => p.id),
    { category: "Jewelry" }, "Earrings → Jewelry"
  );

  // Merge Rings → Jewelry
  total += await batchUpdate(
    all.filter(p => p.category === "Rings").map(p => p.id),
    { category: "Jewelry" }, "Rings → Jewelry"
  );

  // Merge Belts → Accessories
  total += await batchUpdate(
    all.filter(p => p.category === "Belts").map(p => p.id),
    { category: "Accessories" }, "Belts → Accessories"
  );

  // Merge Sunglasses → Accessories
  total += await batchUpdate(
    all.filter(p => p.category === "Sunglasses").map(p => p.id),
    { category: "Accessories" }, "Sunglasses → Accessories"
  );

  // Merge Scarves & Gloves → Accessories
  total += await batchUpdate(
    all.filter(p => p.category === "Scarves & Gloves").map(p => p.id),
    { category: "Accessories" }, "Scarves & Gloves → Accessories"
  );

  // Merge Hats & Caps → Accessories
  total += await batchUpdate(
    all.filter(p => p.category === "Hats & Caps").map(p => p.id),
    { category: "Accessories" }, "Hats & Caps → Accessories"
  );

  // Merge Watches → Accessories
  total += await batchUpdate(
    all.filter(p => p.category === "Watches").map(p => p.id),
    { category: "Accessories" }, "Watches → Accessories"
  );

  // Merge Socks & Underwear → Accessories
  total += await batchUpdate(
    all.filter(p => p.category === "Socks & Underwear").map(p => p.id),
    { category: "Accessories" }, "Socks & Underwear → Accessories"
  );

  // Merge Keychains & Accessories → Accessories
  total += await batchUpdate(
    all.filter(p => p.category === "Keychains & Accessories").map(p => p.id),
    { category: "Accessories" }, "Keychains & Accessories → Accessories"
  );

  // Merge Phone Cases → Accessories
  total += await batchUpdate(
    all.filter(p => p.category === "Phone Cases").map(p => p.id),
    { category: "Accessories" }, "Phone Cases → Accessories"
  );

  // Merge Perfumes → Accessories
  total += await batchUpdate(
    all.filter(p => p.category === "Perfumes").map(p => p.id),
    { category: "Accessories" }, "Perfumes → Accessories"
  );

  // Merge Home → Home & Decor
  total += await batchUpdate(
    all.filter(p => p.category === "Home").map(p => p.id),
    { category: "Home & Decor" }, "Home → Home & Decor"
  );

  // Merge Jackets → Outerwear
  total += await batchUpdate(
    all.filter(p => p.category === "Jackets").map(p => p.id),
    { category: "Outerwear" }, "Jackets → Outerwear"
  );

  // Merge Coats & Puffers → Outerwear
  total += await batchUpdate(
    all.filter(p => p.category === "Coats & Puffers").map(p => p.id),
    { category: "Outerwear" }, "Coats & Puffers → Outerwear"
  );

  // Merge Vests → Outerwear
  total += await batchUpdate(
    all.filter(p => p.category === "Vests").map(p => p.id),
    { category: "Outerwear" }, "Vests → Outerwear"
  );

  // Merge Pants → Bottoms
  total += await batchUpdate(
    all.filter(p => p.category === "Pants").map(p => p.id),
    { category: "Bottoms" }, "Pants → Bottoms"
  );

  // Merge Jeans → Bottoms
  total += await batchUpdate(
    all.filter(p => p.category === "Jeans").map(p => p.id),
    { category: "Bottoms" }, "Jeans → Bottoms"
  );

  // Merge Shorts → Bottoms
  total += await batchUpdate(
    all.filter(p => p.category === "Shorts").map(p => p.id),
    { category: "Bottoms" }, "Shorts → Bottoms"
  );

  // Merge Crewnecks → Sweaters
  total += await batchUpdate(
    all.filter(p => p.category === "Crewnecks").map(p => p.id),
    { category: "Sweaters" }, "Crewnecks → Sweaters"
  );

  // Merge Sneakers → Shoes
  total += await batchUpdate(
    all.filter(p => p.category === "Sneakers").map(p => p.id),
    { category: "Shoes" }, "Sneakers → Shoes"
  );

  // Merge Boots → Shoes
  total += await batchUpdate(
    all.filter(p => p.category === "Boots").map(p => p.id),
    { category: "Shoes" }, "Boots → Shoes"
  );

  // Merge Slides & Sandals → Shoes
  total += await batchUpdate(
    all.filter(p => p.category === "Slides & Sandals").map(p => p.id),
    { category: "Shoes" }, "Slides & Sandals → Shoes"
  );

  // Merge Electronics → Home & Decor
  total += await batchUpdate(
    all.filter(p => p.category === "Electronics").map(p => p.id),
    { category: "Home & Decor" }, "Electronics → Home & Decor"
  );

  // Merge Trading Cards → Home & Decor
  total += await batchUpdate(
    all.filter(p => p.category === "Trading Cards").map(p => p.id),
    { category: "Home & Decor" }, "Trading Cards → Home & Decor"
  );

  // ═══════════════════════════════════════════════
  // PHASE 2: Fix Tops (1227 miscategorized)
  // ═══════════════════════════════════════════════
  console.log("\n═══ PHASE 2: Fix Tops catch-all ═══\n");

  // Re-fetch since categories changed
  const fresh = await fetchAll();
  const tops = fresh.filter(p => p.category === "Tops");
  console.log(`  Tops to process: ${tops.length}`);

  // Tops → T-Shirts
  const topsToTshirt = tops.filter(p =>
    has(p, "t-shirt") || has(p, "t shirt") || word(p, "tee") || has(p, "tees")
  ).map(p => p.id);
  total += await batchUpdate(topsToTshirt, { category: "T-Shirts" }, "Tops → T-Shirts");

  // Tops → Shirts (polo, shirt but not t-shirt)
  const topsProcessed = new Set(topsToTshirt);
  const topsToShirt = tops.filter(p => {
    if (topsProcessed.has(p.id)) return false;
    return has(p, "shirt") || has(p, "polo") || has(p, "blouse");
  }).map(p => p.id);
  total += await batchUpdate(topsToShirt, { category: "Shirts" }, "Tops → Shirts");
  topsToShirt.forEach(id => topsProcessed.add(id));

  // Tops → Sweaters
  const topsToSweater = tops.filter(p => {
    if (topsProcessed.has(p.id)) return false;
    return has(p, "sweater") || has(p, "cardigan") || has(p, "knit") || has(p, "crewneck") || has(p, "pullover");
  }).map(p => p.id);
  total += await batchUpdate(topsToSweater, { category: "Sweaters" }, "Tops → Sweaters");
  topsToSweater.forEach(id => topsProcessed.add(id));

  // Tops → Tracksuits
  const topsToTracksuit = tops.filter(p => {
    if (topsProcessed.has(p.id)) return false;
    return has(p, "tracksuit");
  }).map(p => p.id);
  total += await batchUpdate(topsToTracksuit, { category: "Tracksuits" }, "Tops → Tracksuits");
  topsToTracksuit.forEach(id => topsProcessed.add(id));

  // Remaining Tops with "long sleeve" or just brand+generic → T-Shirts
  const topsToTshirt2 = tops.filter(p => {
    if (topsProcessed.has(p.id)) return false;
    return has(p, "long sleeve") || has(p, "longsleeve") || has(p, "tank top") || has(p, "jersey");
  }).map(p => p.id);
  total += await batchUpdate(topsToTshirt2, { category: "T-Shirts" }, "Tops (long sleeve/tank/jersey) → T-Shirts");
  topsToTshirt2.forEach(id => topsProcessed.add(id));

  // Remaining Tops that are just "[Brand] [generic]" — default to T-Shirts if they look like clothing
  // These are products like "Louis Vuitton T-Shirt", "Balenciaga T-Shirt", "Dior B27" etc
  const topsRemaining = tops.filter(p => !topsProcessed.has(p.id));
  console.log(`  Remaining Tops after keyword fixes: ${topsRemaining.length}`);

  // ═══════════════════════════════════════════════
  // PHASE 3: Fix T-Shirts containing wrong items
  // ═══════════════════════════════════════════════
  console.log("\n═══ PHASE 3: Fix T-Shirts miscategorizations ═══\n");

  const fresh2 = await fetchAll();
  const tshirts = fresh2.filter(p => p.category === "T-Shirts");

  // Chinese 裤子 (pants) in T-Shirts → Bottoms
  const pantsInTshirts = tshirts.filter(p => /裤/.test(p.name)).map(p => p.id);
  total += await batchUpdate(pantsInTshirts, { category: "Bottoms" }, "裤子 (Chinese pants) → Bottoms");

  // Denim without shirt/tee context → Bottoms
  const denimInTshirts = tshirts.filter(p => {
    if (pantsInTshirts.includes(p.id)) return false;
    const name = lo(p);
    return name.includes("denim") && !name.includes("shirt") && !name.includes("tee") &&
           !name.includes("t-shirt") && !name.includes("jacket") && !name.includes("vest");
  }).map(p => p.id);
  total += await batchUpdate(denimInTshirts, { category: "Bottoms" }, "Denim (no shirt context) → Bottoms");

  // Football boots in T-Shirts → Shoes
  const footballInTshirts = tshirts.filter(p => {
    return has(p, "tiempo") || has(p, "legend fg") || has(p, "football boot") ||
           has(p, "mercurial") || has(p, "predator") || has(p, "copa");
  }).map(p => p.id);
  total += await batchUpdate(footballInTshirts, { category: "Shoes" }, "Football boots → Shoes");

  // Batch shoe codes in T-Shirts (DT Batch 530, etc) → Shoes
  const batchShoes = tshirts.filter(p => {
    const name = lo(p);
    if (/(?:dt|pk|gx|kx|top|hp)\s*batch/i.test(p.name)) {
      return has(p, "530") || has(p, "990") || has(p, "2002") || has(p, "550") ||
             has(p, "9060") || has(p, "574") || has(p, "327") || has(p, "1906");
    }
    return false;
  }).map(p => p.id);
  total += await batchUpdate(batchShoes, { category: "Shoes" }, "Batch shoe codes → Shoes");

  // JBL speakers → Home & Decor
  const jbl = tshirts.filter(p => has(p, "jbl")).map(p => p.id);
  total += await batchUpdate(jbl, { category: "Home & Decor" }, "JBL speakers → Home & Decor");

  // ═══════════════════════════════════════════════
  // PHASE 4: Fix Home & Decor false positives
  // ═══════════════════════════════════════════════
  console.log("\n═══ PHASE 4: Fix Home & Decor false positives ═══\n");

  const fresh3 = await fetchAll();
  const homeItems = fresh3.filter(p => p.category === "Home & Decor");

  // Clothing falsely in Home
  const homeToOuterwear = homeItems.filter(p =>
    has(p, "jacket") || has(p, "flight jacket") || has(p, "hooded") || has(p, "hoodie")
  ).map(p => p.id);
  total += await batchUpdate(homeToOuterwear, { category: "Outerwear" }, "Home clothing → Outerwear");

  const homeToBottoms = homeItems.filter(p =>
    has(p, "pants") || has(p, "trousers") || has(p, "cargo") || has(p, "wide-leg")
  ).map(p => p.id);
  total += await batchUpdate(homeToBottoms, { category: "Bottoms" }, "Home pants → Bottoms");

  // ═══════════════════════════════════════════════
  // PHASE 5: Fix Hats & Caps false positives (now in Accessories)
  // Already merged, so these are fine
  // ═══════════════════════════════════════════════

  // ═══════════════════════════════════════════════
  // PHASE 6: Fix Jerseys - merge into T-Shirts
  // ═══════════════════════════════════════════════
  console.log("\n═══ PHASE 5: Additional merges ═══\n");

  const fresh4 = await fetchAll();

  // Jerseys → T-Shirts (sports jerseys are essentially tops)
  total += await batchUpdate(
    fresh4.filter(p => p.category === "Jerseys").map(p => p.id),
    { category: "T-Shirts" }, "Jerseys → T-Shirts"
  );

  // Tracksuits → Outerwear
  total += await batchUpdate(
    fresh4.filter(p => p.category === "Tracksuits").map(p => p.id),
    { category: "Outerwear" }, "Tracksuits → Outerwear"
  );

  // ═══════════════════════════════════════════════
  // VERIFICATION
  // ═══════════════════════════════════════════════
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  VERIFICATION");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const final = await fetchAll();

  const catCounts = {};
  final.forEach(p => { catCounts[p.category || "null"] = (catCounts[p.category || "null"] || 0) + 1; });
  console.log("FINAL Category Distribution:");
  Object.entries(catCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`  ${cat.padEnd(20)} ${count}`);
  });

  const colCounts = {};
  final.forEach(p => { colCounts[p.collection || "none"] = (colCounts[p.collection || "none"] || 0) + 1; });
  console.log("\nFINAL Collection Distribution:");
  Object.entries(colCounts).forEach(([col, count]) => {
    console.log(`  ${col.padEnd(15)} ${count}`);
  });

  // Spot check
  console.log("\n── Spot Check: 5 random per category ──");
  const categories = [...new Set(final.map(p => p.category))].sort();
  for (const cat of categories) {
    const inCat = final.filter(p => p.category === cat);
    const sample = inCat.sort(() => Math.random() - 0.5).slice(0, 5);
    console.log(`\n[${cat}] (${inCat.length}):`);
    sample.forEach(p => console.log(`  ${String(p.id).padStart(6)} | ${(p.brand || "").padEnd(18).slice(0, 18)} | ${(p.name || "").slice(0, 55)}`));
  }

  console.log(`\n\n${"═".repeat(50)}`);
  console.log(`  TOTAL FIXED: ${total}`);
  console.log(`  FINAL CATEGORIES: ${categories.length}`);
  console.log(`${"═".repeat(50)}`);
}

main().catch(console.error);
