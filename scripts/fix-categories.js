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

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// Order matters: more specific rules first, broader rules last
const RULES = [
  // SHOES — specific shoe keywords
  {
    to: "Shoes",
    match: ["air force", "air max", "dunk low", "dunk high", "jordan 1", "jordan 3", "jordan 4", "jordan 5", "jordan 11", "yeezy 350", "yeezy 500", "yeezy 700", "sneaker", "trainer", "loafer", "foam runner", "crocs", "gel-", "samba", "campus 00", "new balance 550", "new balance 2002", "converse", "vans old skool"],
    block: ["bag", "case", "keychain", "charm", "shirt", "hoodie", "jacket", "sock", "short"],
    skipIf: ["Shoes"],
  },
  {
    to: "Boots",
    match: ["chelsea boot", "combat boot", "snow boot", "hiking boot", "ankle boot", "dr. marten", "timberland boot"],
    block: ["bootcut", "bootleg"],
    skipIf: ["Boots", "Shoes"],
  },
  {
    to: "Slides & Sandals",
    match: ["slide ", " slides", "sandal", "slipper", "flip flop", "mule shoe", "oran sandal"],
    block: ["bag", "keychain", "slider"],
    skipIf: ["Slides & Sandals", "Shoes"],
  },
  // HOODIES — before sweaters
  {
    to: "Hoodies",
    match: ["hoodie", "hoody", "hooded sweatshirt", "zip-up hoodie"],
    block: ["shoe", "sneaker", "keychain"],
    skipIf: ["Hoodies"],
  },
  // SWEATERS
  {
    to: "Sweaters",
    match: ["sweater", "knitwear", "cardigan", "crewneck", "crew neck", "sweatshirt"],
    block: ["hoodie", "shoe", "sneaker"],
    skipIf: ["Sweaters", "Hoodies"],
  },
  // JACKETS
  {
    to: "Jackets",
    match: ["jacket", " coat", "puffer", "bomber jacket", "windbreaker", "blazer", "varsity", "down jacket", "parka", "anorak", "trench coat"],
    block: ["shoe", "sneaker", "bootcut", "overcoat dress"],
    skipIf: ["Jackets"],
  },
  // PANTS — jeans first
  {
    to: "Pants",
    match: ["jeans", "denim pants"],
    block: ["jacket", "shoe", "bag"],
    skipIf: ["Pants"],
  },
  {
    to: "Pants",
    match: ["pants", "trousers", "jogger", "sweatpant", "cargo pants", "track pants", "chinos", "trackpant"],
    block: ["shoe", "bag"],
    skipIf: ["Pants"],
  },
  // SHORTS
  {
    to: "Shorts",
    match: [" shorts", "shorts ", "swim shorts", "board shorts"],
    block: ["shoe", "shirt"],
    skipIf: ["Shorts"],
  },
  // SHIRTS
  {
    to: "Shirts",
    match: ["t-shirt", "tshirt", "t shirt"],
    block: ["shoe", "sneaker", "keychain"],
    skipIf: ["Shirts"],
  },
  {
    to: "Jerseys",
    match: ["jersey", "football shirt", "basketball shirt"],
    block: ["shoe"],
    skipIf: ["Jerseys"],
  },
  // BAGS
  {
    to: "Bags",
    match: ["backpack", "duffle", "tote bag", "messenger bag", "crossbody", "shoulder bag", "fanny pack", "waist bag", "suitcase", "luggage", "keepall", "satchel"],
    block: [],
    skipIf: ["Bags"],
  },
  // WALLETS
  {
    to: "Wallets",
    match: ["wallet", "card holder", "cardholder", "card case", "money clip", "coin purse"],
    block: [],
    skipIf: ["Wallets"],
  },
  // HATS & CAPS
  {
    to: "Hats & Caps",
    match: [" cap ", " cap,", "beanie", "bucket hat", "snapback", "fitted cap", "balaclava", "baseball cap"],
    block: ["shoe", "sneaker", "jacket", "capacity"],
    skipIf: ["Hats & Caps"],
  },
  // BELTS
  {
    to: "Belts",
    match: [" belt", "belt "],
    block: ["shoe", "bag", "seat", "beltway"],
    skipIf: ["Belts"],
  },
  // NECKLACES
  {
    to: "Necklaces",
    match: ["necklace", "pendant", "choker"],
    block: ["wallet", "bag", "keychain"],
    skipIf: ["Necklaces"],
  },
  // BRACELETS
  {
    to: "Bracelets",
    match: ["bracelet", "bangle"],
    block: [],
    skipIf: ["Bracelets"],
  },
  // EARRINGS — before rings
  {
    to: "Earrings",
    match: ["earring", "ear ring"],
    block: [],
    skipIf: ["Earrings"],
  },
  // RINGS
  {
    to: "Rings",
    match: [" ring ", " ring,", " rings"],
    block: ["spring", "earring", "binder", "keyring", "o-ring", "key ring", "earing", "string"],
    skipIf: ["Rings"],
  },
  // WATCHES
  {
    to: "Watches",
    match: [" watch", "watch "],
    block: ["watchband", "strap only", "band only"],
    skipIf: ["Watches"],
  },
  // SUNGLASSES
  {
    to: "Sunglasses",
    match: ["sunglasses", "sun glasses"],
    block: ["case", "cloth"],
    skipIf: ["Sunglasses"],
  },
  // SOCKS & UNDERWEAR
  {
    to: "Socks & Underwear",
    match: [" socks", "socks ", " sock ", "underwear", "boxer"],
    block: ["shoe", "sneaker"],
    skipIf: ["Socks & Underwear"],
  },
  // HOME
  {
    to: "Home & Decor",
    match: ["lego ", "candle", "figurine", " pillow", "blanket", " vase", "incense", "ashtray", "steering wheel"],
    block: [],
    skipIf: ["Home & Decor", "Home"],
  },
];

async function fetchAll() {
  let all = [];
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from("products")
      .select("id, name, category")
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 1000) break;
    offset += 1000;
  }
  return all;
}

async function main() {
  console.log("Fetching all products...");
  const products = await fetchAll();
  console.log(`Scanned: ${products.length} products\n`);

  const fixes = [];
  const categoryCounts = {};

  for (const p of products) {
    const name = " " + (p.name || "").toLowerCase() + " ";

    for (const rule of RULES) {
      if (rule.skipIf.includes(p.category)) break;

      const matches = rule.match.some((kw) => name.includes(kw));
      if (!matches) continue;

      const blocked = rule.block.length > 0 && rule.block.some((kw) => name.includes(kw));
      if (blocked) continue;

      fixes.push({ id: p.id, name: p.name, from: p.category, to: rule.to });
      const key = `${p.category} -> ${rule.to}`;
      categoryCounts[key] = (categoryCounts[key] || 0) + 1;
      break;
    }
  }

  console.log(`Found ${fixes.length} products to recategorize\n`);

  const logLimit = Math.min(fixes.length, 100);
  for (let i = 0; i < logLimit; i++) {
    const f = fixes[i];
    console.log(`  "${f.name}" (${f.from} -> ${f.to})`);
  }
  if (fixes.length > logLimit) {
    console.log(`  ... and ${fixes.length - logLimit} more\n`);
  }

  console.log("\nApplying fixes...");
  let applied = 0;
  for (let i = 0; i < fixes.length; i += 50) {
    const batch = fixes.slice(i, i + 50);
    const byTarget = {};
    for (const f of batch) {
      if (!byTarget[f.to]) byTarget[f.to] = [];
      byTarget[f.to].push(f.id);
    }
    for (const [cat, ids] of Object.entries(byTarget)) {
      const { error } = await supabase
        .from("products")
        .update({ category: cat })
        .in("id", ids);
      if (error) console.error(`Error updating ${cat}:`, error.message);
      else applied += ids.length;
    }
  }

  console.log(`Applied: ${applied} fixes\n`);

  console.log("=== SUMMARY ===");
  const sorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  for (const [key, count] of sorted) {
    console.log(`  ${key}: ${count}`);
  }

  console.log("\n=== FINAL DISTRIBUTION ===");
  const allCats = {};
  const final = await fetchAll();
  for (const p of final) {
    allCats[p.category] = (allCats[p.category] || 0) + 1;
  }
  const distSorted = Object.entries(allCats).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of distSorted) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log(`  TOTAL: ${final.length}`);
  console.log(`  CATEGORIES: ${distSorted.length}`);
}

main().catch(console.error);
