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

// Rules: first match wins. validCats = skip if product already in one of these.
const RULES = [
  // PANTS (denim, jeans first — very specific)
  {
    to: "Pants",
    match: ["denim", "jeans", "trousers", "cargo pants", "jogger", "sweatpant", "chino", "flared", "wide leg", "straight leg", "slim fit pants", "track pants"],
    block: ["jacket", "denim jacket", "denim shirt", "shoe", "bag", "denim bag", "skirt"],
    validCats: ["Pants"],
  },
  // SHORTS
  {
    to: "Shorts",
    match: ["shorts", "short pants", "swim trunk"],
    block: ["shoe", "shirt"],
    validCats: ["Shorts"],
  },
  // SHOES
  {
    to: "Shoes",
    match: ["sneaker", "air force", "air max", "dunk low", "dunk high", "jordan 1", "jordan 3", "jordan 4", "jordan 5", "jordan 11", "jordan 12", "jordan 6", "yeezy 350", "yeezy 500", "yeezy 700", "foam runner", "crocs", "loafer", "gel-kayano", "gel-1130", "new balance 550", "new balance 2002", "campus 00", "samba og", "vans old skool"],
    block: ["bag", "case", "keychain", "charm", "shirt", "hoodie", "jacket", "sock", "short", "pant"],
    validCats: ["Shoes", "Boots", "Slides & Sandals"],
  },
  {
    to: "Boots",
    match: ["chelsea boot", "combat boot", "snow boot", "hiking boot", "ankle boot", "timberland boot", "dr. marten"],
    block: ["bootcut", "bootleg"],
    validCats: ["Boots", "Shoes"],
  },
  {
    to: "Slides & Sandals",
    match: ["slide sandal", "flip flop", "pool slide", "yeezy slide"],
    block: [],
    validCats: ["Slides & Sandals", "Shoes"],
  },
  // HOODIES
  {
    to: "Hoodies",
    match: ["hoodie", "hooded sweatshirt", "hoody", "zip-up hoodie"],
    block: ["shoe", "keychain"],
    validCats: ["Hoodies"],
  },
  // SWEATERS
  {
    to: "Sweaters",
    match: ["sweater", "knitwear", "cardigan", "crewneck", "crew neck", "knitted"],
    block: ["hoodie", "shoe"],
    validCats: ["Sweaters", "Hoodies"],
  },
  // JACKETS
  {
    to: "Jackets",
    match: ["jacket", "puffer", "bomber jacket", "windbreaker", "blazer", "varsity", "parka", "anorak", "down jacket", "leather jacket", "denim jacket"],
    block: ["shoe", "hoodie"],
    validCats: ["Jackets"],
  },
  // SHIRTS
  {
    to: "Shirts",
    match: ["t-shirt", "tshirt", "t shirt", "henley"],
    block: ["shoe", "keychain"],
    validCats: ["Shirts"],
  },
  {
    to: "Jerseys",
    match: ["jersey", "football shirt", "basketball shirt"],
    block: ["shoe"],
    validCats: ["Jerseys"],
  },
  // BAGS
  {
    to: "Bags",
    match: ["backpack", "duffle bag", "tote bag", "messenger bag", "crossbody", "shoulder bag", "fanny pack", "waist bag", "suitcase", "luggage", "keepall", "satchel", "clutch bag"],
    block: [],
    validCats: ["Bags"],
  },
  // WALLETS
  {
    to: "Wallets",
    match: ["wallet", "card holder", "cardholder", "card case", "money clip", "coin purse"],
    block: [],
    validCats: ["Wallets"],
  },
  // HATS
  {
    to: "Hats & Caps",
    match: ["baseball cap", "beanie", "bucket hat", "snapback", "fitted cap", "balaclava", "visor hat", "beret"],
    block: ["shoe", "jacket", "capacity"],
    validCats: ["Hats & Caps"],
  },
  // BELTS
  {
    to: "Belts",
    match: ["leather belt", "chain belt", "waist belt", "designer belt"],
    block: ["seatbelt", "belt bag"],
    validCats: ["Belts"],
  },
  // NECKLACES
  {
    to: "Necklaces",
    match: ["necklace", "pendant necklace", "choker necklace"],
    block: ["keychain"],
    validCats: ["Necklaces"],
  },
  // BRACELETS
  {
    to: "Bracelets",
    match: ["bracelet", "bangle", "wristband"],
    block: [],
    validCats: ["Bracelets"],
  },
  // EARRINGS (before rings!)
  {
    to: "Earrings",
    match: ["earring", "ear ring", "stud earring", "hoop earring"],
    block: [],
    validCats: ["Earrings"],
  },
  // RINGS
  {
    to: "Rings",
    match: [" ring ", " ring,", " rings "],
    block: ["earring", "keyring", "spring", "binder", "key ring", "string", "earing"],
    validCats: ["Rings"],
  },
  // WATCHES
  {
    to: "Watches",
    match: ["wristwatch", "chronograph", "quartz watch", "mechanical watch"],
    block: ["watchband", "strap only"],
    validCats: ["Watches"],
  },
  // SUNGLASSES
  {
    to: "Sunglasses",
    match: ["sunglasses", "sun glasses"],
    block: ["case", "cloth"],
    validCats: ["Sunglasses"],
  },
  // SOCKS
  {
    to: "Socks & Underwear",
    match: ["socks", "underwear", "boxer brief"],
    block: ["shoe"],
    validCats: ["Socks & Underwear"],
  },
  // HOME / TOYS — aggressive catch for miscategorized toys
  {
    to: "Home & Decor",
    match: ["lego", "figurine", "plush", "stuffed animal", "stuffed toy", "toy figure", "doll", "pillow", "blanket", "candle", "incense", "ashtray", "decoration", "ornament", "action figure", "building block", "model kit", "steering wheel", "raccoon", "teddy"],
    block: [],
    validCats: ["Home & Decor", "Home"],
  },
  // PHONE CASES
  {
    to: "Phone Cases",
    match: ["phone case", "iphone case", "airpod case", "airpods case"],
    block: [],
    validCats: ["Phone Cases"],
  },
  // KEYCHAINS
  {
    to: "Keychains",
    match: ["keychain", "key chain"],
    block: [],
    validCats: ["Keychains"],
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
  console.log(`Scanned: ${products.length}\n`);

  const fixes = [];
  const counts = {};

  for (const p of products) {
    const name = " " + (p.name || "").toLowerCase() + " ";

    for (const rule of RULES) {
      if (rule.validCats.includes(p.category)) continue;

      const matches = rule.match.some((kw) => name.includes(kw));
      if (!matches) continue;

      const blocked = rule.block.length > 0 && rule.block.some((kw) => name.includes(kw));
      if (blocked) continue;

      if (p.category === rule.to) continue;

      fixes.push({ id: p.id, name: p.name, from: p.category, to: rule.to });
      const key = `${p.category} -> ${rule.to}`;
      counts[key] = (counts[key] || 0) + 1;
      break;
    }
  }

  console.log(`Found ${fixes.length} products to fix\n`);

  for (const f of fixes) {
    const short = f.name.length > 65 ? f.name.substring(0, 65) + "..." : f.name;
    console.log(`  "${short}" (${f.from} -> ${f.to})`);
  }

  console.log("\nApplying...");
  let applied = 0;
  for (let i = 0; i < fixes.length; i += 50) {
    const batch = fixes.slice(i, i + 50);
    const byTarget = {};
    for (const f of batch) {
      if (!byTarget[f.to]) byTarget[f.to] = [];
      byTarget[f.to].push(f.id);
    }
    for (const [cat, ids] of Object.entries(byTarget)) {
      const { error } = await supabase.from("products").update({ category: cat }).in("id", ids);
      if (error) console.error(`Error:`, error.message);
      else applied += ids.length;
    }
  }

  console.log(`Applied: ${applied}\n`);

  console.log("=== SUMMARY ===");
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  for (const [key, count] of sorted) {
    console.log(`  ${key}: ${count}`);
  }

  console.log("\n=== FINAL DISTRIBUTION ===");
  const final = await fetchAll();
  const dist = {};
  for (const p of final) dist[p.category] = (dist[p.category] || 0) + 1;
  const dSorted = Object.entries(dist).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of dSorted) console.log(`  ${cat}: ${count}`);
  console.log(`  TOTAL: ${final.length} | CATEGORIES: ${dSorted.length}`);
}

main().catch(console.error);
