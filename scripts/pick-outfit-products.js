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

async function pickProducts() {
  // Fetch all products with images, sorted by score
  let all = [];
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from("products")
      .select("id, name, brand, category, price_cny, image, score, views, likes, review_count, variant_count, collection")
      .not("image", "is", null)
      .neq("image", "")
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 1000) break;
    offset += 1000;
  }

  console.log(`Scanning ${all.length} products for outfit-worthy items...\n`);

  // === SCORING CRITERIA FOR OUTFIT PHOTOS ===

  // Brands that photograph well / are recognizable in flat-lays
  const tierS = ["Chrome Hearts", "Louis Vuitton", "Balenciaga", "Dior", "Chanel", "Supreme", "Off-White", "Nike", "Jordan"];
  const tierA = ["Stussy", "BAPE", "Gucci", "Prada", "Vivienne Westwood", "Rick Owens", "Hermes", "Moncler", "Burberry", "Acne Studios", "Stone Island", "New Balance", "Fear of God", "Essentials"];
  const tierB = ["Adidas", "Carhartt", "Ralph Lauren", "The North Face", "Corteiz", "Gallery Dept", "Amiri", "Undercover", "Maison Margiela", "Raf Simons", "Loewe", "Miu Miu"];

  // Categories that work best in flat-lays
  const greatForFlatlay = {
    Hoodies: 10,
    Jackets: 9,
    Sweaters: 8,
    Shirts: 7,
    Shoes: 9,
    Boots: 8,
    Pants: 7,
    Shorts: 7,
    "Hats & Caps": 8,
    Bags: 8,
    Necklaces: 6,
    Bracelets: 6,
    Rings: 5,
    Watches: 7,
    Belts: 6,
    Sunglasses: 7,
    "Slides & Sandals": 6,
    "Scarves & Gloves": 5,
    Wallets: 5,
    Earrings: 5,
    Polos: 7,
    Jerseys: 7,
    "Long Sleeves": 7,
    "Tank Tops": 5,
    Tops: 6,
  };

  // Score each product for "outfit photo worthiness"
  const scored = all.map((p) => {
    let photoScore = 0;
    const brand = p.brand || "";
    const name = (p.name || "").toLowerCase();
    const img = (p.image || "").toLowerCase();

    // 1. Brand recognition (0-30)
    if (tierS.some((b) => brand.toLowerCase().includes(b.toLowerCase()))) photoScore += 30;
    else if (tierA.some((b) => brand.toLowerCase().includes(b.toLowerCase()))) photoScore += 22;
    else if (tierB.some((b) => brand.toLowerCase().includes(b.toLowerCase()))) photoScore += 15;
    else photoScore += 5;

    // 2. Category suitability (0-10)
    photoScore += greatForFlatlay[p.category] || 3;

    // 3. Image quality heuristic (0-15)
    if (img.includes("yupoo.com")) photoScore += 15;
    else if (img.includes("weidian.com") || img.includes("alicdn.com")) photoScore += 8;
    else if (img.includes("geilicdn.com")) photoScore += 3;
    else photoScore += 5;

    // 4. Engagement signals (0-15)
    if (p.views > 200) photoScore += 10;
    else if (p.views > 50) photoScore += 6;
    else if (p.views > 10) photoScore += 3;
    if (p.likes > 10) photoScore += 5;

    // 5. Name quality — specific names = identifiable items (0-10)
    const specificModels = [
      "air force", "dunk", "jordan", "yeezy", "tech fleece", "box logo", "bogo",
      "neverfull", "keepall", "birkin", "speed trainer", "triple s", "track",
      "b22", "b23", "shark", "gel-1130", "550", "990", "2002", "samba", "gazelle",
      "cortez", "foam runner", "slides", "runner", "chelsea", "combat",
    ];
    if (specificModels.some((m) => name.includes(m))) photoScore += 10;
    else if (name.length > 15) photoScore += 5;
    else photoScore += 2;

    // 6. Penalties
    if (p.variant_count > 10) photoScore -= 10;
    if (name.includes("(") && name.includes("styles)")) photoScore -= 15;
    if (!p.brand || p.brand === "Unknown" || p.brand === "Various") photoScore -= 15;

    // 7. Collection bonus
    if (p.collection === "girls") photoScore += 3;

    return { ...p, photoScore };
  });

  // Sort by photo score
  scored.sort((a, b) => b.photoScore - a.photoScore);

  // === BUILD OUTFIT-READY PRODUCT LISTS ===

  // Group by category
  const byCategory = {};
  for (const p of scored) {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  }

  // Pick top items per category (diverse brands, no duplicates)
  function pickTopDiverse(items, count, maxPerBrand = 3) {
    const picked = [];
    const brandCounts = {};
    for (const item of items) {
      if (picked.length >= count) break;
      const b = item.brand || "unknown";
      if ((brandCounts[b] || 0) >= maxPerBrand) continue;
      picked.push(item);
      brandCounts[b] = (brandCounts[b] || 0) + 1;
    }
    return picked;
  }

  console.log("===== TOP OUTFIT-WORTHY PRODUCTS BY CATEGORY =====\n");

  const outfitPicks = {};
  const categories = [
    "Hoodies", "Jackets", "Sweaters", "Shirts", "Polos", "Jerseys",
    "Shoes", "Boots", "Pants", "Shorts",
    "Hats & Caps", "Bags", "Wallets",
    "Necklaces", "Bracelets", "Watches", "Sunglasses", "Belts",
    "Slides & Sandals",
  ];

  for (const cat of categories) {
    const items = byCategory[cat] || [];
    const top = pickTopDiverse(items, 15, 3);
    outfitPicks[cat] = top;

    console.log(`\n${cat} (${items.length} total, top 15):`);
    for (const p of top) {
      console.log(`  [${p.photoScore}] ${p.brand} - ${p.name} | ¥${p.price_cny || "?"} | ${p.views || 0} views`);
    }
  }

  // === SUGGEST 10 COMPLETE OUTFITS ===

  console.log("\n\n===== 10 SUGGESTED OUTFIT COMBINATIONS =====\n");

  const outfitStyles = [
    {
      name: "Chrome Hearts Monochrome",
      rules: { brands: ["Chrome Hearts"], colors: "black/grey" },
      slots: ["Hoodies", "Pants", "Shoes", "Necklaces", "Hats & Caps"],
    },
    {
      name: "Nike Summer Clean",
      rules: { brands: ["Nike", "Jordan"], colors: "white/black" },
      slots: ["Shirts", "Shorts", "Shoes", "Hats & Caps", "Bags"],
    },
    {
      name: "Old Money Luxury",
      rules: { brands: ["Ralph Lauren", "Burberry", "Acne Studios", "Hermes", "New Balance"], colors: "cream/beige/brown" },
      slots: ["Sweaters", "Pants", "Shoes", "Belts", "Watches"],
    },
    {
      name: "Dark Aesthetic",
      rules: { brands: ["Rick Owens", "Balenciaga", "Chrome Hearts", "Raf Simons", "Undercover"], colors: "all black" },
      slots: ["Jackets", "Pants", "Shoes", "Necklaces", "Bags"],
    },
    {
      name: "Hypebeast Statement",
      rules: { brands: ["Supreme", "Off-White", "BAPE", "Stussy"], colors: "bold/mixed" },
      slots: ["Hoodies", "Shorts", "Shoes", "Hats & Caps", "Bags"],
    },
    {
      name: "Balenciaga Full Set",
      rules: { brands: ["Balenciaga"], colors: "black/grey" },
      slots: ["Jackets", "Pants", "Shoes", "Sunglasses", "Bags"],
    },
    {
      name: "Stussy Casual",
      rules: { brands: ["Stussy", "Nike", "New Balance"], colors: "neutral" },
      slots: ["Shirts", "Shorts", "Shoes", "Hats & Caps", "Necklaces"],
    },
    {
      name: "Girls Luxury",
      rules: { brands: ["Chanel", "Dior", "Vivienne Westwood", "Miu Miu", "Prada"], colors: "mixed", collection: "girls" },
      slots: ["Bags", "Shoes", "Earrings", "Necklaces", "Sunglasses"],
    },
    {
      name: "Earth Tones Workwear",
      rules: { brands: ["Carhartt", "The North Face", "Stone Island", "Nike"], colors: "olive/brown/cream" },
      slots: ["Jackets", "Pants", "Shoes", "Hats & Caps", "Belts"],
    },
    {
      name: "Louis Vuitton Flex",
      rules: { brands: ["Louis Vuitton"], colors: "brown/monogram" },
      slots: ["Bags", "Belts", "Shoes", "Shirts", "Wallets"],
    },
  ];

  const outfitResults = [];

  for (let i = 0; i < outfitStyles.length; i++) {
    const style = outfitStyles[i];
    console.log(`\nOutfit ${i + 1}: ${style.name}`);
    console.log(`   Style: ${style.rules.colors}`);

    const outfitItems = [];

    for (const slot of style.slots) {
      const candidates = byCategory[slot] || [];
      // Filter by preferred brands
      let filtered = candidates.filter((p) =>
        style.rules.brands.some((b) => (p.brand || "").toLowerCase().includes(b.toLowerCase()))
      );
      // If no brand matches, use top scored from category
      if (filtered.length === 0) filtered = candidates;
      // Filter by collection if specified
      if (style.rules.collection === "girls") {
        const girlsFiltered = filtered.filter((p) => p.collection === "girls" || p.collection === "both");
        if (girlsFiltered.length > 0) filtered = girlsFiltered;
      }

      const pick = filtered[0];
      if (pick) {
        console.log(`   ${slot}: ${pick.brand} - ${pick.name} | ¥${pick.price_cny || "?"} | Score: ${pick.photoScore}`);
        outfitItems.push({ slot, id: pick.id, brand: pick.brand, name: pick.name, price_cny: pick.price_cny, photoScore: pick.photoScore });
      } else {
        console.log(`   ${slot}: (no match found)`);
      }
    }

    outfitResults.push({ name: style.name, colors: style.rules.colors, items: outfitItems });
  }

  // === SAVE RESULTS ===

  // Save top picks per category
  const exportData = {};
  for (const [cat, items] of Object.entries(outfitPicks)) {
    exportData[cat] = items.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price_cny: p.price_cny,
      photoScore: p.photoScore,
      views: p.views,
      image: p.image,
    }));
  }
  fs.writeFileSync(path.join(__dirname, "..", "outfit-worthy-products.json"), JSON.stringify(exportData, null, 2));

  // Save outfit suggestions with actual product picks
  fs.writeFileSync(path.join(__dirname, "..", "suggested-outfits.json"), JSON.stringify(outfitResults, null, 2));

  console.log("\n\nSaved to outfit-worthy-products.json and suggested-outfits.json");
  console.log(`Total outfit-worthy products: ${Object.values(outfitPicks).flat().length}`);
}

pickProducts().catch(console.error);
