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

const indicators = {
  Shoes: ["air force 1", "air max", "dunk low", "dunk high", "jordan 1", "jordan 4", "jordan 11", "yeezy 350", "yeezy 700", "new balance 550", "new balance 990", "new balance 2002", "vomero", "shox", "cortez", "gel-1130", "gel kayano", "foam runner", "air more uptempo", "speed trainer", "track runner", "b22", "b23", "b30", "triple s", "mars yard", "zoom fly", "kobe", "gazelle", "samba og"],
  "Slides & Sandals": ["birkenstock", "crocs", "clog", "yeezy slide", "oran sandal"],
  Boots: ["combat boot", "chelsea boot", "hiking boot", "ankle boot", "biker boot"],
  Hoodies: ["hoodie", "zip up hoodie", "hooded sweatshirt"],
  Sweaters: ["sweater", "cardigan", "crewneck sweater", "knitwear", "turtleneck"],
  Jackets: ["jacket", "bomber jacket", "windbreaker", "puffer", "parka", "anorak", "varsity jacket", "blazer", "down jacket", "leather jacket", "denim jacket"],
  Pants: ["pants", "trousers", "jeans", "cargo pants", "joggers", "sweatpants", "chinos", "trackpants", "flared jeans"],
  Shorts: ["shorts", "swim trunks", "board shorts", "gym shorts"],
  Bags: ["backpack", "tote bag", "duffle bag", "messenger bag", "crossbody bag", "shoulder bag", "fanny pack", "keepall", "satchel", "pochette", "clutch bag", "purse", "handbag", "makeup bag", "book tote"],
  Wallets: ["wallet", "card holder", "cardholder", "coin purse", "key pouch"],
  "Hats & Caps": ["baseball cap", "snapback", "fitted cap", "bucket hat", "beanie", "trucker cap", "balaclava", "knitted beanie"],
  Belts: ["leather belt", "chain belt", "canvas belt", "reversible belt"],
  Necklaces: ["necklace", "chain necklace", "pendant necklace", "choker", "pearl necklace", "tennis chain"],
  Bracelets: ["bracelet", "bangle", "cuff bracelet", "tennis bracelet"],
  Earrings: ["earring", "stud earring", "hoop earring", "drop earring"],
  Watches: ["datejust", "submariner", "daytona", "royal oak", "speedmaster", "nautilus", "gmt-master"],
  Sunglasses: ["sunglasses", "aviator sunglasses", "wayfarer"],
  "Socks & Underwear": ["socks", "underwear", "boxer briefs"],
  "Phone Cases": ["phone case", "iphone case", "airpods case", "airpod case"],
  "Home & Decor": ["lego", "rug", "candle", "figurine", "plush", "pillow", "blanket", "ashtray", "incense", "playing cards", "basketball"],
  Perfumes: ["perfume", "cologne", "fragrance", "eau de toilette", "eau de parfum"],
  Keychains: ["keychain", "key chain", "lighter", "sticker pack"],
  "Scarves & Gloves": ["scarf", "gloves", "earmuffs", "shawl"],
};

const falsePositives = {
  Pants: ["baggy"],
  "Slides & Sandals": ["slide deck"],
  Rings: ["earring", "spring", "keyring", "boxing ring", "o-ring", "drawstring"],
  Boots: ["bootstrap", "bootcut", "reboot", "bootleg"],
  Belts: ["belt bag", "seatbelt", "belt loop"],
  Watches: ["watchband"],
  Hoodies: ["hoodie/sweatpant"],
};

const closeCategories = [
  ["Shoes", "Boots"], ["Shoes", "Slides & Sandals"],
  ["Shirts", "Polos"], ["Shirts", "Jerseys"], ["Shirts", "Long Sleeves"], ["Shirts", "Tank Tops"], ["Shirts", "Tops"],
  ["Sweaters", "Hoodies"],
  ["Pants", "Shorts"],
  ["Jackets", "Hoodies"],
  ["Necklaces", "Jewelry"], ["Bracelets", "Jewelry"], ["Rings", "Jewelry"], ["Earrings", "Jewelry"], ["Watches", "Jewelry"],
  ["Keychains", "Accessories"],
  ["Home & Decor", "Home"], ["Home & Decor", "Electronics"],
  ["Scarves & Gloves", "Accessories"],
  ["Socks & Underwear", "Accessories"],
];

function isClose(a, b) {
  return closeCategories.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

function isFP(cat, name) {
  return (falsePositives[cat] || []).some((fp) => name.includes(fp));
}

async function audit() {
  let all = [];
  let offset = 0;
  while (true) {
    const { data } = await supabase.from("products").select("id, name, brand, category").range(offset, offset + 999);
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 1000) break;
    offset += 1000;
  }
  console.log(`Auditing ${all.length} products...\n`);

  const highConf = [];
  const lowConf = [];
  const genericKw = new Set(["slide", "ring", "boot", "belt", "watch", "coat", "hoodie", "jacket", "pants", "shorts", "socks"]);

  for (const p of all) {
    const name = (" " + (p.name || "").toLowerCase() + " ");
    const cat = p.category || "";

    for (const [expectedCat, keywords] of Object.entries(indicators)) {
      if (cat === expectedCat || isClose(cat, expectedCat)) continue;

      for (const kw of keywords) {
        if (name.includes(kw) && !isFP(expectedCat, name)) {
          const issue = { id: p.id, name: p.name, brand: p.brand, currentCategory: cat, suggestedCategory: expectedCat, keyword: kw };
          if (genericKw.has(kw)) lowConf.push(issue);
          else highConf.push(issue);
          break;
        }
      }
    }
  }

  console.log("========== AUDIT RESULTS ==========");
  console.log(`Total products: ${all.length}`);
  console.log(`High confidence mismatches: ${highConf.length}`);
  console.log(`Low confidence (review): ${lowConf.length}`);

  if (highConf.length > 0) {
    console.log("\n--- HIGH CONFIDENCE (auto-fixing) ---");
    const grouped = {};
    for (const m of highConf) {
      const key = `${m.currentCategory} → ${m.suggestedCategory}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    }
    for (const [key, items] of Object.entries(grouped).sort((a, b) => b[1].length - a[1].length)) {
      console.log(`\n${key} (${items.length}):`);
      for (const item of items.slice(0, 5)) {
        console.log(`  "${item.name}" (${item.brand}) [${item.keyword}]`);
      }
      if (items.length > 5) console.log(`  ... and ${items.length - 5} more`);
    }
  }

  if (lowConf.length > 0) {
    console.log("\n--- LOW CONFIDENCE (skipped) ---");
    for (const m of lowConf.slice(0, 20)) {
      console.log(`  "${m.name}" | ${m.currentCategory} → ${m.suggestedCategory}? [${m.keyword}]`);
    }
    if (lowConf.length > 20) console.log(`  ... and ${lowConf.length - 20} more`);
  }

  // Auto-fix high confidence
  if (highConf.length > 0) {
    console.log(`\nAuto-fixing ${highConf.length} high-confidence mismatches...`);
    let fixed = 0;
    for (const fix of highConf) {
      const { error } = await supabase.from("products").update({ category: fix.suggestedCategory }).eq("id", fix.id);
      if (!error) fixed++;
      else console.error(`Error ${fix.id}:`, error.message);
    }
    console.log(`Fixed ${fixed} products.`);
  }

  // Save low confidence for review
  fs.writeFileSync(path.join(__dirname, "..", "audit-review-needed.json"), JSON.stringify(lowConf, null, 2));
  console.log(`\nLow confidence saved to audit-review-needed.json`);
}

audit().catch(console.error);
