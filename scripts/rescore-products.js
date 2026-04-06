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

const BRAND_TIERS = {
  S: ["Chrome Hearts", "Louis Vuitton", "Dior", "Chanel", "Hermes", "Balenciaga", "Rick Owens", "Off-White", "Gucci", "Prada"],
  A: ["Supreme", "Nike", "Jordan", "Stussy", "Vivienne Westwood", "Moncler", "Burberry", "Acne Studios", "Amiri", "Stone Island", "Bape", "New Balance", "Raf Simons", "Maison Margiela"],
  B: ["Ralph Lauren", "Adidas", "Carhartt", "The North Face", "Essentials", "Fear of God", "Corteiz", "Gallery Dept", "Undercover", "Number Nine", "Loewe", "Miu Miu", "Hellstar"],
  C: ["Lacoste", "Tommy Hilfiger", "Calvin Klein", "Patagonia", "ASICS", "Converse", "Vans", "Puma", "Champion", "Salomon"],
};

function getBrandTier(brand) {
  if (!brand) return 0;
  const b = brand.toLowerCase();
  if (BRAND_TIERS.S.some((s) => b.includes(s.toLowerCase()))) return 20;
  if (BRAND_TIERS.A.some((s) => b.includes(s.toLowerCase()))) return 15;
  if (BRAND_TIERS.B.some((s) => b.includes(s.toLowerCase()))) return 10;
  if (BRAND_TIERS.C.some((s) => b.includes(s.toLowerCase()))) return 5;
  return 2;
}

const CAT_DEMAND = {
  Shoes: 20, Boots: 15, "Slides & Sandals": 12,
  Hoodies: 18, Jackets: 17, Sweaters: 15,
  Shirts: 14, Pants: 14, Shorts: 13, Polos: 12, Jerseys: 11, "Long Sleeves": 12, "Tank Tops": 10, Tops: 10,
  Bags: 16, Wallets: 10,
  Necklaces: 12, Bracelets: 12, Rings: 11, Earrings: 11, Watches: 13, Jewelry: 10,
  "Hats & Caps": 11, Belts: 10, Sunglasses: 11, Glasses: 8,
  "Scarves & Gloves": 8, "Socks & Underwear": 5, "Phone Cases": 6,
  Perfumes: 8, "Home & Decor": 5, Home: 5, Electronics: 4, Keychains: 3,
  Accessories: 6, Unique: 7, "Old Money": 8, Masks: 3, Ties: 3,
};

async function rescore() {
  console.log("Fetching all products...");
  let allProducts = [];
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from("products")
      .select("id, name, brand, category, price_cny, image, views, likes, dislikes, review_count, avg_rating, created_at, variant_count")
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    allProducts = allProducts.concat(data);
    if (data.length < 1000) break;
    offset += 1000;
  }
  console.log(`Scoring ${allProducts.length} products...\n`);

  // Category medians
  const catPrices = {};
  for (const p of allProducts) {
    if (!p.category || !p.price_cny || p.price_cny <= 0) continue;
    if (!catPrices[p.category]) catPrices[p.category] = [];
    catPrices[p.category].push(p.price_cny);
  }
  const catMedians = {};
  for (const [cat, prices] of Object.entries(catPrices)) {
    prices.sort((a, b) => a - b);
    catMedians[cat] = prices[Math.floor(prices.length / 2)];
  }

  const updates = [];
  for (const p of allProducts) {
    let score = 0;
    const price = p.price_cny || 0;
    const views = p.views || 0;
    const likes = p.likes || 0;
    const dislikes = p.dislikes || 0;
    const reviewCount = p.review_count || 0;
    const avgRating = parseFloat(p.avg_rating) || 0;

    // 0. Fresh finds boost
    const ageInDays = (Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays <= 7) score += 15;
    else if (ageInDays <= 14) score += 8;

    // 1. Price Appeal (0-20)
    const median = catMedians[p.category] || 200;
    if (price > 0 && median > 0) {
      const ratio = price / median;
      if (ratio <= 0.3) score += 20;
      else if (ratio <= 0.5) score += 17;
      else if (ratio <= 0.75) score += 14;
      else if (ratio <= 1.0) score += 10;
      else if (ratio <= 1.5) score += 6;
      else score += 2;
    }

    // 2. Engagement (0-20)
    if (views > 500) score += 12;
    else if (views > 200) score += 9;
    else if (views > 50) score += 6;
    else if (views > 10) score += 3;
    else score += 1;

    const totalVotes = likes + dislikes;
    if (totalVotes > 0) {
      score += Math.round((likes / totalVotes) * 8);
    }

    // 3. Brand Power (0-20)
    score += getBrandTier(p.brand);

    // 4. Category Demand (0-20)
    score += CAT_DEMAND[p.category] || 5;

    // 5. Quality Signals (0-20)
    if (p.image && p.image.startsWith("http")) score += 5;
    else score -= 10;

    // Image source quality
    const imgUrl = (p.image || "").toLowerCase();
    if (imgUrl.includes("yupoo.com")) score += 5;
    else if (imgUrl.includes("geilicdn.com")) score -= 3;
    else if (imgUrl.includes("weidian.com") || imgUrl.includes("img.alicdn.com")) score += 2;

    // No image = heavy penalty
    if (!p.image || p.image === "") score -= 20;

    // Review boost
    if (reviewCount > 0) {
      score += Math.min(10, reviewCount * 2);
      score += Math.round((avgRating || 0) * 2);
    }

    // Penalize multi-variant listings that slipped through
    if ((p.variant_count || 0) > 10) score -= 5;

    if (p.brand && p.brand !== "Unknown" && p.brand !== "Various" && p.brand !== "?") score += 3;
    if (p.name && p.name.length > 10 && !p.name.startsWith("Product ")) score += 2;

    score = Math.max(0, Math.min(115, score));
    updates.push({ id: p.id, score });
  }

  // Distribution
  const ranges = { "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
  for (const u of updates) {
    if (u.score <= 20) ranges["0-20"]++;
    else if (u.score <= 40) ranges["21-40"]++;
    else if (u.score <= 60) ranges["41-60"]++;
    else if (u.score <= 80) ranges["61-80"]++;
    else ranges["81-100"]++;
  }
  console.log("Score distribution:");
  for (const [range, count] of Object.entries(ranges)) {
    console.log(`  ${range}: ${count} (${((count / updates.length) * 100).toFixed(1)}%)`);
  }

  // Top 20
  updates.sort((a, b) => b.score - a.score);
  console.log("\nTop 20:");
  for (const u of updates.slice(0, 20)) {
    const p = allProducts.find((x) => x.id === u.id);
    console.log(`  ${u.score}: ${p.brand} — ${p.name} (${p.category}, ¥${p.price_cny || "?"}, ${p.views || 0} views)`);
  }

  // Bottom 10
  console.log("\nBottom 10:");
  for (const u of updates.slice(-10)) {
    const p = allProducts.find((x) => x.id === u.id);
    console.log(`  ${u.score}: ${p.brand} — ${p.name} (${p.category})`);
  }

  // Update in batches
  console.log(`\nUpdating ${updates.length} products...`);
  let updated = 0;
  for (let i = 0; i < updates.length; i += 50) {
    const batch = updates.slice(i, i + 50);
    for (const item of batch) {
      await supabase.from("products").update({ score: item.score }).eq("id", item.id);
    }
    updated += batch.length;
    if (updated % 1000 === 0) console.log(`  ${updated}/${updates.length}`);
  }

  console.log(`\nDone! ${updates.length} products rescored.`);
}

rescore().catch(console.error);
