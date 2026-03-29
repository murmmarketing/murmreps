const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

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

async function fetchAll(queryFn) {
  let all = [];
  let offset = 0;
  while (true) {
    const { data, error } = await queryFn(offset);
    if (error) { console.error("  Query error:", error.message); break; }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < 1000) break;
    offset += 1000;
  }
  return all;
}

async function batchUpdate(ids, updates, label) {
  if (ids.length === 0) { console.log(`  ${label}: 0 products (no matches)`); return 0; }
  let updated = 0;
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const { error } = await supabase.from("products").update(updates).in("id", batch);
    if (error) console.error(`  Batch error:`, error.message);
    else updated += batch.length;
  }
  console.log(`  ${label}: ${updated} products updated`);
  return updated;
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  Step 1: Diagnostics — Current Category Distribution");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Fetch all products
  const allProducts = await fetchAll((offset) =>
    supabase.from("products").select("id,name,brand,category,collection").range(offset, offset + 999)
  );
  console.log(`Total products: ${allProducts.length}\n`);

  // Category distribution
  const catCounts = {};
  allProducts.forEach(p => { catCounts[p.category || "null"] = (catCounts[p.category || "null"] || 0) + 1; });
  console.log("Category Distribution:");
  Object.entries(catCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`  ${cat.padEnd(25)} ${count}`);
  });

  // Diagnostic samples
  const n = (p, kw) => (p.name || "").toLowerCase().includes(kw);

  const shoesInTops = allProducts.filter(p => p.category === "Tops" && (
    n(p,"sneaker") || n(p,"shoe") || n(p,"boot") || n(p,"sandal") || n(p,"jordan") || n(p,"dunk") || n(p,"yeezy") || n(p,"trainer") || n(p,"runner")
  ));
  console.log(`\nShoes stuck in Tops: ${shoesInTops.length}`);
  shoesInTops.slice(0, 5).forEach(p => console.log(`  [${p.id}] ${p.name} (${p.brand})`));

  const outerwearInTops = allProducts.filter(p => p.category === "Tops" && (
    n(p,"jacket") || n(p,"hoodie") || n(p,"coat") || n(p,"windbreaker") || n(p,"puffer") || n(p,"zip up") || n(p,"zip-up")
  ));
  console.log(`\nOuterwear stuck in Tops: ${outerwearInTops.length}`);
  outerwearInTops.slice(0, 5).forEach(p => console.log(`  [${p.id}] ${p.name} (${p.brand})`));

  const bottomsInTops = allProducts.filter(p => p.category === "Tops" && (
    n(p,"pants") || n(p,"jeans") || n(p,"shorts") || n(p,"trousers") || n(p,"jogger") || n(p,"sweatpant")
  ));
  console.log(`\nBottoms stuck in Tops: ${bottomsInTops.length}`);
  bottomsInTops.slice(0, 5).forEach(p => console.log(`  [${p.id}] ${p.name} (${p.brand})`));

  const accInTops = allProducts.filter(p => p.category === "Tops" && (
    n(p,"belt") || n(p,"cap") || n(p,"hat") || n(p,"beanie") || n(p,"scarf") || n(p,"watch") || n(p,"socks") || n(p,"sunglasses") || n(p,"wallet")
  ));
  console.log(`\nAccessories stuck in Tops: ${accInTops.length}`);
  accInTops.slice(0, 5).forEach(p => console.log(`  [${p.id}] ${p.name} (${p.brand})`));

  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  Step 2: Bulk Fixes");
  console.log("═══════════════════════════════════════════════════════════════\n");

  let totalFixed = 0;

  // ── Fix 1: Shoes ──
  const shoeKeywords = [
    "sneaker", "shoe", "boot", "sandal", "slipper", "loafer", "trainer",
    "dunk", "air force", "air max", "crocs", "slide", "mule", "heel",
    "derby", "b30", "defender", "flexy walk", "9060", "990", "gel-",
    "speed 2", "foam runner", "birkenstock", "shox", "cup sneaker",
    "footprint", "flip flop", "clog", "espadrille", "kitten heel",
    "stiletto", "platform shoe", "mary jane", "oxford"
  ];
  const shoeIds = allProducts.filter(p => {
    if (["Shoes","Sneakers","Boots","Slides & Sandals"].includes(p.category)) return false;
    const name = (p.name || "").toLowerCase();
    if (/\bjordan\b/i.test(p.name) && !n(p, "jersey")) return true;
    if (/\byeezy\b/i.test(p.name) && (n(p,"slide") || n(p,"foam") || n(p,"boost") || n(p,"700") || n(p,"350") || n(p,"500"))) return true;
    if (/\bnew balance\b/i.test(p.name) && !n(p,"hoodie") && !n(p,"shirt") && !n(p,"jacket") && !n(p,"pants") && !n(p,"shorts") && !n(p,"cap") && !n(p,"hat")) return true;
    return shoeKeywords.some(kw => name.includes(kw));
  }).map(p => p.id);
  totalFixed += await batchUpdate(shoeIds, { category: "Shoes" }, "Fix 1 — Shoes");

  // ── Fix 2: Bags ──
  const bagKeywords = [
    "bag", "backpack", "suitcase", "keepall", "tote", "crossbody", "clutch",
    "luggage", "duffle", "messenger", "birkin", "neverfull", "pochette",
    "toiletry", "handbag", "purse", "satchel", "briefcase", "fanny pack",
    "bum bag", "waist bag", "shoulder bag", "hobo", "cosmetic pouch"
  ];
  const bagIds = allProducts.filter(p => {
    if (p.category === "Bags" || p.category === "Wallets") return false;
    const name = (p.name || "").toLowerCase();
    return bagKeywords.some(kw => name.includes(kw));
  }).map(p => p.id);
  totalFixed += await batchUpdate(bagIds, { category: "Bags" }, "Fix 2 — Bags");

  // ── Fix 3: Wallets ──
  const walletKeywords = ["wallet", "card holder", "cardholder", "coin purse"];
  const walletIds = allProducts.filter(p => {
    if (p.category === "Wallets") return false;
    const name = (p.name || "").toLowerCase();
    return walletKeywords.some(kw => name.includes(kw));
  }).map(p => p.id);
  totalFixed += await batchUpdate(walletIds, { category: "Wallets" }, "Fix 3 — Wallets");

  // ── Fix 4: Outerwear (from Tops only) ──
  const outerwearKeywords = [
    "jacket", "coat", "windbreaker", "puffer", "bomber", "parka", "blazer",
    "anorak", "trench", "down jacket", "leather jacket", "denim jacket",
    "fleece", "zip up", "zip-up", "full zip", "hoodie", "maya", "parana",
    "gilet", "overcoat", "raincoat", "poncho", "cape", "shearling"
  ];
  const outerwearIds = allProducts.filter(p => {
    if (p.category !== "Tops") return false;
    const name = (p.name || "").toLowerCase();
    if (name.includes("vest") && !name.includes("sweater vest")) return true;
    return outerwearKeywords.some(kw => name.includes(kw));
  }).map(p => p.id);
  totalFixed += await batchUpdate(outerwearIds, { category: "Outerwear" }, "Fix 4 — Outerwear (from Tops)");

  // ── Fix 5: Bottoms (from Tops only) ──
  const bottomsKeywords = [
    "pants", "jeans", "shorts", "trousers", "jogger", "trackpant", "sweatpant",
    "cargo", "chino", "swim short", "swim trunk", "legging", "skirt", "culottes"
  ];
  const bottomsIds = allProducts.filter(p => {
    if (p.category !== "Tops") return false;
    const name = (p.name || "").toLowerCase();
    return bottomsKeywords.some(kw => name.includes(kw));
  }).map(p => p.id);
  totalFixed += await batchUpdate(bottomsIds, { category: "Bottoms" }, "Fix 5 — Bottoms (from Tops)");

  // ── Fix 6: Accessories ──
  const accKeywords = [
    "belt", "baseball cap", "beanie", "scarf", "sunglasses", "glasses",
    "socks", "glove", "keychain", "phone case", "iphone", "airpod",
    "snapback", "trucker cap", "fitted cap", "bucket hat", "visor",
    "umbrella", "headband", "bandana", "bow tie"
  ];
  const accIds = allProducts.filter(p => {
    if (p.category === "Accessories" || p.category === "Jewelry") return false;
    const name = (p.name || "").toLowerCase();
    if (/\bcap\b/i.test(p.name) && !n(p, "capacity")) return true;
    if (/\bhat\b/i.test(p.name)) return true;
    if (/\bwatch\b/i.test(p.name) && !n(p, "watchman")) return true;
    return accKeywords.some(kw => name.includes(kw));
  }).map(p => p.id);
  totalFixed += await batchUpdate(accIds, { category: "Accessories" }, "Fix 6 — Accessories");

  // ── Fix 7: Jewelry ──
  const jewelryKeywords = [
    "bracelet", "necklace", "earring", "pendant", "brooch", "anklet",
    "choker", "van cleef", "ankh cross", "tennis bracelet"
  ];
  const jewelryIds = allProducts.filter(p => {
    if (p.category === "Jewelry") return false;
    const name = (p.name || "").toLowerCase();
    if (n(p, "keychain")) return false;
    if (/\bring\b/i.test(p.name) && !n(p, "keyring") && !n(p, "o-ring")) return true;
    // 'chain' only if it looks like jewelry (not keychain, not chain stitch)
    if (n(p, "chain") && !n(p, "keychain") && !n(p, "stitch") && (n(p, "necklace") || n(p, "silver") || n(p, "gold") || n(p, "tennis") || n(p, "cuban"))) return true;
    return jewelryKeywords.some(kw => name.includes(kw));
  }).map(p => p.id);
  totalFixed += await batchUpdate(jewelryIds, { category: "Jewelry" }, "Fix 7 — Jewelry");

  // ── Fix 8: Home ──
  const homeKeywords = [
    "figure", "lego", "rug", "mirror", "decoration", "candle", "wine rack",
    "billiard", "basketball set", "kaws", "leblon", "incense",
    "vase", "cushion", "pillow", "blanket", "ashtray", "lamp",
    "poster", "art print", "plush", "stuffed"
  ];
  const homeIds = allProducts.filter(p => {
    if (p.category === "Home" || p.category === "Home & Decor") return false;
    const name = (p.name || "").toLowerCase();
    return homeKeywords.some(kw => name.includes(kw));
  }).map(p => p.id);
  totalFixed += await batchUpdate(homeIds, { category: "Home" }, "Fix 8 — Home");

  // ── Fix 9: Collection reassignment to girls ──
  console.log("\n── Fix 9: Collection reassignment (main → girls) ──");
  let girlsMoved = 0;

  // Re-read products since categories changed
  const freshProducts = await fetchAll((offset) =>
    supabase.from("products").select("id,name,brand,category,collection").range(offset, offset + 999)
  );

  const mainOnly = freshProducts.filter(p => p.collection === "main");

  // 9a: All Jewelry in main → girls
  const jewelryToGirls = mainOnly.filter(p => p.category === "Jewelry").map(p => p.id);
  girlsMoved += await batchUpdate(jewelryToGirls, { collection: "girls" }, "  9a — Jewelry → girls");

  // 9b: Miu Miu
  const miuMiu = mainOnly.filter(p => /miu miu/i.test(p.brand)).map(p => p.id);
  girlsMoved += await batchUpdate(miuMiu, { collection: "girls" }, "  9b — Miu Miu → girls");

  // 9c: VW jewelry
  const vwToGirls = mainOnly.filter(p =>
    /vivienne westwood/i.test(p.name || p.brand) &&
    (n(p,"bracelet") || n(p,"necklace") || n(p,"earring") || /\bring\b/i.test(p.name) || n(p,"pendant"))
  ).map(p => p.id);
  girlsMoved += await batchUpdate(vwToGirls, { collection: "girls" }, "  9c — VW jewelry → girls");

  // 9d: Van Cleef
  const vanCleef = mainOnly.filter(p => /van cleef/i.test(p.name || p.brand)).map(p => p.id);
  girlsMoved += await batchUpdate(vanCleef, { collection: "girls" }, "  9d — Van Cleef → girls");

  // 9e: Jacquemus
  const jacquemus = mainOnly.filter(p => /jacquemus/i.test(p.name || p.brand)).map(p => p.id);
  girlsMoved += await batchUpdate(jacquemus, { collection: "girls" }, "  9e — Jacquemus → girls");

  // 9f: Luxury scarves
  const luxScarves = mainOnly.filter(p =>
    n(p, "scarf") && /hermes|chanel|burberry|louis vuitton|fendi|loro piana|loewe/i.test(p.brand)
  ).map(p => p.id);
  girlsMoved += await batchUpdate(luxScarves, { collection: "girls" }, "  9f — Luxury scarves → girls");

  // 9g: Hermes sandals
  const hermesSandals = mainOnly.filter(p =>
    /hermes/i.test(p.brand) && (n(p,"sandal") || n(p,"slipper") || n(p,"oran"))
  ).map(p => p.id);
  girlsMoved += await batchUpdate(hermesSandals, { collection: "girls" }, "  9g — Hermes sandals → girls");

  // 9h: Chanel shoes/acc
  const chanelShoes = mainOnly.filter(p =>
    /chanel/i.test(p.brand) &&
    (n(p,"flat") || n(p,"sandal") || n(p,"loafer") || n(p,"slipper") || n(p,"ballet") || n(p,"earring") || n(p,"beanie") || n(p,"scarf"))
  ).map(p => p.id);
  girlsMoved += await batchUpdate(chanelShoes, { collection: "girls" }, "  9h — Chanel shoes/acc → girls");

  // 9i: Gucci mules
  const gucciMules = mainOnly.filter(p => /gucci/i.test(p.brand) && n(p,"mule")).map(p => p.id);
  girlsMoved += await batchUpdate(gucciMules, { collection: "girls" }, "  9i — Gucci mules → girls");

  // 9j: LV bucket bag
  const lvBucket = mainOnly.filter(p => /louis vuitton/i.test(p.brand) && n(p,"bucket")).map(p => p.id);
  girlsMoved += await batchUpdate(lvBucket, { collection: "girls" }, "  9j — LV bucket bags → girls");

  // 9k: Book tote / hobo
  const bookTote = mainOnly.filter(p => n(p,"book tote") || n(p,"hobo")).map(p => p.id);
  girlsMoved += await batchUpdate(bookTote, { collection: "girls" }, "  9k — Book totes/hobos → girls");

  // 9l: Luxury caps/beanies
  const luxCaps = mainOnly.filter(p =>
    /dior|fendi|prada|celine|loewe/i.test(p.brand) &&
    (n(p,"beanie") || (/\bcap\b/i.test(p.name) && !n(p,"capacity")))
  ).map(p => p.id);
  girlsMoved += await batchUpdate(luxCaps, { collection: "girls" }, "  9l — Luxury caps/beanies → girls");

  // 9m: Luxury clutches
  const luxClutch = mainOnly.filter(p =>
    n(p,"clutch") && /chanel|dior|louis vuitton|hermes|fendi|prada/i.test(p.brand)
  ).map(p => p.id);
  girlsMoved += await batchUpdate(luxClutch, { collection: "girls" }, "  9m — Luxury clutches → girls");

  // 9n: Celine shirts
  const celineShirt = mainOnly.filter(p =>
    /celine/i.test(p.brand) && (n(p,"t-shirt") || n(p,"tee"))
  ).map(p => p.id);
  girlsMoved += await batchUpdate(celineShirt, { collection: "girls" }, "  9n — Celine shirts → girls");

  console.log(`\n  Total moved to girls: ${girlsMoved}`);
  totalFixed += girlsMoved;

  // ═══ Step 3: Verify ═══
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  Step 3: Verification");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const updated = await fetchAll((offset) =>
    supabase.from("products").select("id,name,brand,category,collection").range(offset, offset + 999)
  );

  const newCatCounts = {};
  updated.forEach(p => { newCatCounts[p.category || "null"] = (newCatCounts[p.category || "null"] || 0) + 1; });
  console.log("NEW Category Distribution:");
  Object.entries(newCatCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`  ${cat.padEnd(25)} ${count}`);
  });

  const colCounts = {};
  updated.forEach(p => { colCounts[p.collection || "none"] = (colCounts[p.collection || "none"] || 0) + 1; });
  console.log("\nNEW Collection Distribution:");
  Object.entries(colCounts).sort((a, b) => b[1] - a[1]).forEach(([col, count]) => {
    console.log(`  ${col.padEnd(15)} ${count}`);
  });

  // Spot check
  console.log("\n── Spot Check: 5 random products per category ──");
  const categories = [...new Set(updated.map(p => p.category))].sort();
  for (const cat of categories) {
    const inCat = updated.filter(p => p.category === cat);
    const sample = inCat.sort(() => Math.random() - 0.5).slice(0, 5);
    console.log(`\n[${cat}] (${inCat.length} products):`);
    sample.forEach(p => console.log(`  ${String(p.id).padStart(6)} | ${(p.brand || "").padEnd(18).slice(0,18)} | ${(p.name || "").slice(0,50)}`));
  }

  console.log(`\n\n════════════════════════════════════════`);
  console.log(`  TOTAL PRODUCTS FIXED: ${totalFixed}`);
  console.log(`════════════════════════════════════════`);
}

main().catch(console.error);
