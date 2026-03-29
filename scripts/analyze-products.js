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

async function fetchAll(query) {
  // Paginate through all results
  let all = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await query.range(from, from + PAGE - 1);
    if (error) { console.error(error.message); break; }
    all = all.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  MurmReps Product Database Analysis");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Fetch ALL products
  const allProducts = await fetchAll(
    supabase.from("products").select("id, name, brand, category, price_cny, tier, quality, source_link, image, collection, views, likes, dislikes, created_at")
  );
  console.log(`Total products fetched: ${allProducts.length}\n`);

  // ─── Query 1: Top performers by views ───
  console.log("═══ QUERY 1: Top 50 Products by Views ═══");
  const withViews = allProducts.filter(p => p.views > 0).sort((a, b) => b.views - a.views);
  console.log(`Products with views > 0: ${withViews.length}\n`);
  console.log("Rank | ID    | Views | Likes | Brand            | Category     | Price | Collection | Name");
  console.log("─".repeat(130));
  withViews.slice(0, 50).forEach((p, i) => {
    console.log(
      `${String(i + 1).padStart(4)} | ${String(p.id).padStart(5)} | ${String(p.views).padStart(5)} | ${String(p.likes).padStart(5)} | ${(p.brand || "").padEnd(16).slice(0, 16)} | ${(p.category || "").padEnd(12).slice(0, 12)} | ${p.price_cny ? ("¥" + p.price_cny).padStart(5) : "  N/A"} | ${(p.collection || "").padEnd(10)} | ${(p.name || "").slice(0, 40)}`
    );
  });

  // ─── Query 2: Brand popularity ───
  console.log("\n\n═══ QUERY 2: Brand Popularity (Top 30) ═══");
  const brandMap = {};
  allProducts.forEach(p => {
    const b = p.brand || "Unknown";
    if (!brandMap[b]) brandMap[b] = { count: 0, views: 0, likes: 0 };
    brandMap[b].count++;
    brandMap[b].views += (p.views || 0);
    brandMap[b].likes += (p.likes || 0);
  });
  const brands = Object.entries(brandMap).map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.views - a.views);
  console.log("\nBrand                | Products | Total Views | Total Likes");
  console.log("─".repeat(70));
  brands.slice(0, 30).forEach(b => {
    console.log(`${b.name.padEnd(20).slice(0, 20)} | ${String(b.count).padStart(8)} | ${String(b.views).padStart(11)} | ${String(b.likes).padStart(11)}`);
  });

  // ─── Query 3: Category breakdown per collection ───
  console.log("\n\n═══ QUERY 3: Category Breakdown per Collection ═══");
  const catMap = {};
  allProducts.forEach(p => {
    const key = `${p.collection || "none"}|${p.category || "Uncategorized"}`;
    catMap[key] = (catMap[key] || 0) + 1;
  });
  const catEntries = Object.entries(catMap).map(([k, count]) => {
    const [collection, category] = k.split("|");
    return { collection, category, count };
  }).sort((a, b) => a.collection.localeCompare(b.collection) || b.count - a.count);

  let lastCol = "";
  catEntries.forEach(e => {
    if (e.collection !== lastCol) {
      console.log(`\n── ${e.collection.toUpperCase()} ──`);
      lastCol = e.collection;
    }
    console.log(`  ${e.category.padEnd(25)} ${e.count}`);
  });

  // ─── Query 4: Price ranges ───
  console.log("\n\n═══ QUERY 4: Price Range Performance ═══");
  const priceRanges = {
    "Under ¥100": { count: 0, views: 0 },
    "¥100-199": { count: 0, views: 0 },
    "¥200-299": { count: 0, views: 0 },
    "¥300-499": { count: 0, views: 0 },
    "¥500-799": { count: 0, views: 0 },
    "¥800+": { count: 0, views: 0 },
  };
  allProducts.forEach(p => {
    const price = p.price_cny || 0;
    let range;
    if (price < 100) range = "Under ¥100";
    else if (price < 200) range = "¥100-199";
    else if (price < 300) range = "¥200-299";
    else if (price < 500) range = "¥300-499";
    else if (price < 800) range = "¥500-799";
    else range = "¥800+";
    priceRanges[range].count++;
    priceRanges[range].views += (p.views || 0);
  });
  console.log("\nPrice Range    | Products | Total Views | Avg Views");
  console.log("─".repeat(60));
  Object.entries(priceRanges).forEach(([range, d]) => {
    const avg = d.count > 0 ? (d.views / d.count).toFixed(1) : "0";
    console.log(`${range.padEnd(14)} | ${String(d.count).padStart(8)} | ${String(d.views).padStart(11)} | ${String(avg).padStart(9)}`);
  });

  // ─── Query 5: Image coverage ───
  console.log("\n\n═══ QUERY 5: Image Coverage ═══");
  const imgMap = {};
  allProducts.forEach(p => {
    const col = p.collection || "none";
    if (!imgMap[col]) imgMap[col] = { total: 0, withImg: 0 };
    imgMap[col].total++;
    if (p.image && p.image.trim() !== "") imgMap[col].withImg++;
  });
  console.log("\nCollection | Total | With Images | Without | Coverage");
  console.log("─".repeat(60));
  Object.entries(imgMap).forEach(([col, d]) => {
    const pct = ((d.withImg / d.total) * 100).toFixed(1);
    console.log(`${col.padEnd(10)} | ${String(d.total).padStart(5)} | ${String(d.withImg).padStart(11)} | ${String(d.total - d.withImg).padStart(7)} | ${pct}%`);
  });

  // ─── Query 6: Girls collection standouts ───
  console.log("\n\n═══ QUERY 6: Girls Collection Standouts (with images, top 30) ═══");
  const girlsStandouts = allProducts
    .filter(p => p.collection === "girls" && p.image && p.image.trim() !== "")
    .sort((a, b) => (b.views || 0) - (a.views || 0));
  console.log("\nRank | ID    | Views | Likes | Brand            | Category     | Price | Name");
  console.log("─".repeat(110));
  girlsStandouts.slice(0, 30).forEach((p, i) => {
    console.log(
      `${String(i + 1).padStart(4)} | ${String(p.id).padStart(5)} | ${String(p.views || 0).padStart(5)} | ${String(p.likes || 0).padStart(5)} | ${(p.brand || "").padEnd(16).slice(0, 16)} | ${(p.category || "").padEnd(12).slice(0, 12)} | ${p.price_cny ? ("¥" + p.price_cny).padStart(5) : "  N/A"} | ${(p.name || "").slice(0, 40)}`
    );
  });

  // ─── Query 7: Main collection standouts ───
  console.log("\n\n═══ QUERY 7: Main Collection Standouts (with images, top 30) ═══");
  const mainStandouts = allProducts
    .filter(p => p.collection === "main" && p.image && p.image.trim() !== "")
    .sort((a, b) => (b.views || 0) - (a.views || 0));
  console.log("\nRank | ID    | Views | Likes | Brand            | Category     | Price | Name");
  console.log("─".repeat(110));
  mainStandouts.slice(0, 30).forEach((p, i) => {
    console.log(
      `${String(i + 1).padStart(4)} | ${String(p.id).padStart(5)} | ${String(p.views || 0).padStart(5)} | ${String(p.likes || 0).padStart(5)} | ${(p.brand || "").padEnd(16).slice(0, 16)} | ${(p.category || "").padEnd(12).slice(0, 12)} | ${p.price_cny ? ("¥" + p.price_cny).padStart(5) : "  N/A"} | ${(p.name || "").slice(0, 40)}`
    );
  });

  // ─── Summary ───
  console.log("\n\n═══════════════════════════════════════════════════════════════");
  console.log("  SUMMARY");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const mainCount = allProducts.filter(p => p.collection === "main").length;
  const girlsCount = allProducts.filter(p => p.collection === "girls").length;
  const otherCount = allProducts.filter(p => p.collection !== "main" && p.collection !== "girls").length;
  const totalViews = allProducts.reduce((s, p) => s + (p.views || 0), 0);
  const totalLikes = allProducts.reduce((s, p) => s + (p.likes || 0), 0);
  const withImages = allProducts.filter(p => p.image && p.image.trim() !== "").length;
  const withViews2 = allProducts.filter(p => (p.views || 0) > 0).length;

  console.log(`Total Products:     ${allProducts.length}`);
  console.log(`  Main collection:  ${mainCount}`);
  console.log(`  Girls collection: ${girlsCount}`);
  console.log(`  Other/none:       ${otherCount}`);
  console.log(`\nTotal Views:        ${totalViews}`);
  console.log(`Total Likes:        ${totalLikes}`);
  console.log(`Products w/ views:  ${withViews2} (${((withViews2 / allProducts.length) * 100).toFixed(1)}%)`);
  console.log(`Products w/ images: ${withImages} (${((withImages / allProducts.length) * 100).toFixed(1)}%)`);
  console.log(`Products w/o images: ${allProducts.length - withImages}`);

  console.log(`\nTop 10 brands by views:`);
  brands.slice(0, 10).forEach((b, i) => {
    console.log(`  ${i + 1}. ${b.name} — ${b.views} views, ${b.count} products`);
  });

  console.log(`\nTop categories by views:`);
  const catViews = {};
  allProducts.forEach(p => {
    const cat = p.category || "Uncategorized";
    if (!catViews[cat]) catViews[cat] = { views: 0, count: 0 };
    catViews[cat].views += (p.views || 0);
    catViews[cat].count++;
  });
  Object.entries(catViews).sort((a, b) => b[1].views - a[1].views).slice(0, 15).forEach(([cat, d], i) => {
    console.log(`  ${i + 1}. ${cat} — ${d.views} views, ${d.count} products`);
  });
}

main().catch(console.error);
