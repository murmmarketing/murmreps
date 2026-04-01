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

async function fetchCategory(cat) {
  let all = [];
  let offset = 0;
  while (true) {
    const { data } = await supabase.from("products").select("id, name, category").eq("category", cat).range(offset, offset + 999);
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 1000) break;
    offset += 1000;
  }
  return all;
}

// Returns new category or null (keep)
function checkShirts(name) {
  // Hats
  if (/\b(beanie|beanies|snapback|visor|beret|balaclava|bucket hat|fitted cap)\b/.test(name)) return "Hats & Caps";
  if (/\b(cap|hat)\b/.test(name) && !/\bcap(ital|acity|sule|tain|ture|e)\b/.test(name) && !/\bt-shirt|tee|shirt\b/.test(name)) return "Hats & Caps";
  // Home
  if (/\b(dog clothes|pet |figurine|figure |plush|toy |stuffed|doll|lego|candle|rug |pillow|blanket|ashtray|incense|decoration|ornament|mug |cup |steering wheel|flag)\b/.test(name)) return "Home & Decor";
  // Bags
  if (/\b(backpack|duffle|tote bag|messenger bag|crossbody|shoulder bag|fanny pack|waist bag|suitcase|luggage|keepall|satchel|clutch bag)\b/.test(name)) return "Bags";
  if (/\b(bag|pouch)\b/.test(name) && !/\bsleeping bag\b/.test(name) && !/\bt-shirt|tee|shirt\b/.test(name)) return "Bags";
  // Wallets
  if (/\b(wallet|card holder|cardholder|card case|money clip|coin purse|key pouch)\b/.test(name)) return "Wallets";
  // Phone cases
  if (/\b(phone case|iphone case|airpod|airpods case)\b/.test(name)) return "Phone Cases";
  // Perfumes
  if (/\b(perfume|cologne|fragrance|sauvage|eau de|deodorant)\b/.test(name)) return "Perfumes";
  // Sunglasses
  if (/\b(sunglasses|sun glasses|eyewear|goggles)\b/.test(name) && !/\bcase\b/.test(name)) return "Sunglasses";
  if (/\bglasses\b/.test(name) && !/\bcase|cloth|t-shirt|tee\b/.test(name)) return "Glasses";
  // Watches
  if (/\bwatch\b/.test(name) && !/\bwatchband|strap\b/.test(name) && !/\bt-shirt|tee|shirt\b/.test(name)) return "Watches";
  // Socks & Underwear
  if (/\b(socks?|underwear|boxer|briefs|undershirt)\b/.test(name) && !/\bt-shirt|tee|shirt\b/.test(name)) return "Socks & Underwear";
  // Necklaces
  if (/\b(necklace|pendant|choker)\b/.test(name) && !/\bkeychain\b/.test(name)) return "Necklaces";
  // Bracelets
  if (/\b(bracelet|bangle)\b/.test(name)) return "Bracelets";
  // Earrings
  if (/\bearring|ear ring\b/.test(name)) return "Earrings";
  // Rings
  if (/\bring\b/.test(name) && !/\bearring|keyring|spring|binder|key ring|string\b/.test(name) && !/\bt-shirt|tee|shirt\b/.test(name)) return "Rings";
  // Belts
  if (/\bbelt\b/.test(name) && !/\bseatbelt|belt bag\b/.test(name) && !/\bt-shirt|tee|shirt\b/.test(name)) return "Belts";
  // Keychains
  if (/\b(keychain|key chain|key ring|lanyard)\b/.test(name)) return "Keychains";
  // Accessories
  if (/\b(pin |pins |badge|patch |sticker|glove|scarf|armband|scrunchie|hair tie)\b/.test(name) && !/\bt-shirt|tee|shirt\b/.test(name)) return "Accessories";
  // Shoes (shouldn't be here)
  if (/\b(sneaker|loafer|boot |boots|slide |sandal|slipper|trainer|runner)\b/.test(name) && !/\bt-shirt|tee|shirt\b/.test(name)) return "Shoes";
  // Pants
  if (/\b(jeans|denim|trousers|jogger|sweatpant|cargo pants|chinos)\b/.test(name) && !/\bjacket|shirt\b/.test(name)) return "Pants";
  // Shorts
  if (/\bshorts\b/.test(name) && !/\bshirt\b/.test(name)) return "Shorts";
  // Hoodies
  if (/\bhoodie|hoody\b/.test(name)) return "Hoodies";
  // Sweaters
  if (/\b(sweater|cardigan|crewneck|knitwear)\b/.test(name) && !/\bhoodie\b/.test(name)) return "Sweaters";
  // Jackets
  if (/\b(jacket|puffer|bomber|windbreaker|blazer|parka|anorak)\b/.test(name) && !/\bshirt\b/.test(name)) return "Jackets";

  // KEEP if it matches shirt keywords
  if (/\b(shirt|tee|t-shirt|tshirt|polo|jersey|henley|tank top|top|blouse|button.up|button.down|flannel|hawaiian)\b/.test(name)) return null;

  // Doesn't match anything — keep
  return null;
}

function checkPants(name) {
  if (/\bhoodie|hoody\b/.test(name) && !/\bpant|jean|trouser\b/.test(name)) return "Hoodies";
  if (/\b(jacket|puffer|bomber|blazer|windbreaker)\b/.test(name) && !/\bpant|jean\b/.test(name)) return "Jackets";
  if (/\b(sweater|cardigan|crewneck|knitwear)\b/.test(name) && !/\bpant|jean\b/.test(name)) return "Sweaters";
  if (/\b(sneaker|shoe |shoes|loafer|boot |slide |sandal|air force|air max|dunk|jordan|yeezy)\b/.test(name) && !/\bpant|jean|trouser\b/.test(name)) return "Shoes";
  if (/\b(bag|backpack|tote|crossbody|duffle|satchel)\b/.test(name) && !/\bpant\b/.test(name)) return "Bags";
  if (/\b(necklace|pendant|choker)\b/.test(name) && !/\bpant\b/.test(name)) return "Necklaces";
  if (/\b(bracelet|bangle)\b/.test(name) && !/\bpant\b/.test(name)) return "Bracelets";
  if (/\bring\b/.test(name) && !/\bearring|spring|string|pant|jean\b/.test(name)) return "Rings";
  if (/\b(keychain|key chain)\b/.test(name)) return "Keychains";
  if (/\b(phone case|iphone|airpod)\b/.test(name)) return "Phone Cases";
  if (/\b(figurine|plush|toy |lego|doll|pillow|candle|flag)\b/.test(name)) return "Home & Decor";
  if (/\b(wallet|card holder|cardholder)\b/.test(name)) return "Wallets";
  if (/\b(cap |hat |beanie|snapback|bucket hat|balaclava)\b/.test(name) && !/\bpant|jean\b/.test(name)) return "Hats & Caps";
  if (/\b(belt)\b/.test(name) && !/\bpant|jean|belt loop\b/.test(name)) return "Belts";
  if (/\b(t-shirt|tshirt|tee )\b/.test(name) && !/\bpant|jean\b/.test(name)) return "Shirts";
  return null;
}

function checkShoes(name) {
  if (/\b(t-shirt|tshirt|tee |shirt)\b/.test(name) && !/\bshoe|sneaker|boot|slide|sandal|trainer|runner\b/.test(name)) return "Shirts";
  if (/\b(hoodie|hoody)\b/.test(name) && !/\bshoe|sneaker\b/.test(name)) return "Hoodies";
  if (/\b(jacket|coat |puffer|bomber)\b/.test(name) && !/\bshoe|sneaker|boot\b/.test(name)) return "Jackets";
  if (/\b(pants|jeans|trousers|jogger|sweatpant)\b/.test(name) && !/\bshoe|sneaker|boot\b/.test(name)) return "Pants";
  if (/\bshorts\b/.test(name) && !/\bshoe|sneaker\b/.test(name)) return "Shorts";
  if (/\b(bag|backpack|tote|crossbody)\b/.test(name) && !/\bshoe\b/.test(name)) return "Bags";
  if (/\b(necklace|pendant|chain)\b/.test(name) && !/\bshoe|sneaker|chain shoe\b/.test(name)) return "Necklaces";
  if (/\b(socks?)\b/.test(name) && !/\bshoe|sneaker\b/.test(name)) return "Socks & Underwear";
  if (/\b(keychain|key chain)\b/.test(name)) return "Keychains";
  if (/\b(wallet|card holder)\b/.test(name)) return "Wallets";
  if (/\b(phone case|iphone|airpod)\b/.test(name)) return "Phone Cases";
  if (/\b(figurine|plush|toy |lego|doll|pillow|flag)\b/.test(name)) return "Home & Decor";
  return null;
}

function checkJackets(name) {
  if (/\bhoodie|hoody|hooded sweatshirt\b/.test(name) && !/\bjacket|coat|bomber|puffer\b/.test(name)) return "Hoodies";
  if (/\b(sweater|cardigan|crewneck|knitwear|knitted)\b/.test(name) && !/\bjacket|coat\b/.test(name)) return "Sweaters";
  if (/\b(t-shirt|tshirt|tee )\b/.test(name) && !/\bjacket\b/.test(name)) return "Shirts";
  if (/\b(pants|jeans|trousers|jogger)\b/.test(name) && !/\bjacket|coat\b/.test(name)) return "Pants";
  if (/\bshorts\b/.test(name) && !/\bjacket\b/.test(name)) return "Shorts";
  if (/\b(sneaker|shoe |shoes|boot |slide |sandal|air force|dunk|jordan|yeezy)\b/.test(name) && !/\bjacket|coat\b/.test(name)) return "Shoes";
  if (/\b(bag|backpack|tote|crossbody)\b/.test(name) && !/\bjacket\b/.test(name)) return "Bags";
  if (/\b(figurine|plush|toy |lego|doll|pillow|flag)\b/.test(name)) return "Home & Decor";
  if (/\b(keychain|key chain)\b/.test(name)) return "Keychains";
  if (/\b(sunglasses)\b/.test(name) && !/\bjacket\b/.test(name)) return "Sunglasses";
  return null;
}

function checkHoodies(name) {
  if (/\b(t-shirt|tshirt|tee )\b/.test(name) && !/\bhoodie|hoody\b/.test(name)) return "Shirts";
  if (/\b(jacket|coat |puffer|bomber|blazer)\b/.test(name) && !/\bhoodie|hoody\b/.test(name)) return "Jackets";
  if (/\b(sweater|cardigan|crewneck)\b/.test(name) && !/\bhoodie|hoody\b/.test(name)) return "Sweaters";
  if (/\b(pants|jeans|trousers|jogger|sweatpant)\b/.test(name) && !/\bhoodie|hoody\b/.test(name)) return "Pants";
  if (/\b(sneaker|shoe |shoes|boot |slide)\b/.test(name) && !/\bhoodie\b/.test(name)) return "Shoes";
  if (/\b(bag|backpack|tote)\b/.test(name) && !/\bhoodie\b/.test(name)) return "Bags";
  if (/\b(keychain|key chain)\b/.test(name)) return "Keychains";
  if (/\b(figurine|plush|toy |lego|doll|pillow|flag)\b/.test(name)) return "Home & Decor";
  return null;
}

function checkAccessories(name) {
  if (/\b(necklace|pendant|choker)\b/.test(name) && !/\bkeychain\b/.test(name)) return "Necklaces";
  if (/\b(bracelet|bangle)\b/.test(name)) return "Bracelets";
  if (/\bearring|ear ring\b/.test(name)) return "Earrings";
  if (/\bring\b/.test(name) && !/\bearring|keyring|spring|key ring|string\b/.test(name)) return "Rings";
  if (/\bwatch\b/.test(name) && !/\bwatchband|strap\b/.test(name)) return "Watches";
  if (/\b(sunglasses|sun glasses)\b/.test(name)) return "Sunglasses";
  if (/\b(keychain|key chain|key ring)\b/.test(name)) return "Keychains";
  if (/\b(phone case|iphone|airpod)\b/.test(name)) return "Phone Cases";
  if (/\b(wallet|card holder|cardholder)\b/.test(name)) return "Wallets";
  if (/\b(belt)\b/.test(name) && !/\bseatbelt\b/.test(name)) return "Belts";
  if (/\b(cap |hat |beanie|snapback|bucket hat|balaclava|visor)\b/.test(name)) return "Hats & Caps";
  if (/\b(bag|backpack|tote|crossbody|pouch)\b/.test(name)) return "Bags";
  if (/\b(socks?|underwear|boxer)\b/.test(name)) return "Socks & Underwear";
  if (/\b(figurine|plush|toy |lego|doll|pillow|candle|flag)\b/.test(name)) return "Home & Decor";
  if (/\b(perfume|cologne|fragrance)\b/.test(name)) return "Perfumes";
  if (/\b(scarf|glove)\b/.test(name)) return "Scarves & Gloves";
  return null;
}

const CATEGORY_CHECKS = {
  Shirts: checkShirts,
  Pants: checkPants,
  Shoes: checkShoes,
  Jackets: checkJackets,
  Hoodies: checkHoodies,
  Accessories: checkAccessories,
};

async function main() {
  const allFixes = [];
  const counts = {};

  for (const [cat, checkFn] of Object.entries(CATEGORY_CHECKS)) {
    console.log(`\nChecking ${cat}...`);
    const products = await fetchCategory(cat);
    console.log(`  ${products.length} products`);

    let fixes = 0;
    for (const p of products) {
      const name = " " + (p.name || "").toLowerCase() + " ";
      const newCat = checkFn(name);
      if (newCat && newCat !== cat) {
        allFixes.push({ id: p.id, name: p.name, from: cat, to: newCat });
        const key = `${cat} -> ${newCat}`;
        counts[key] = (counts[key] || 0) + 1;
        fixes++;
      }
    }
    console.log(`  ${fixes} to fix`);
  }

  console.log(`\nTotal fixes: ${allFixes.length}\n`);

  // Log all
  for (const f of allFixes) {
    const short = f.name.length > 60 ? f.name.substring(0, 60) + "..." : f.name;
    console.log(`  "${short}" (${f.from} -> ${f.to})`);
  }

  // Apply
  console.log("\nApplying...");
  let applied = 0;
  for (let i = 0; i < allFixes.length; i += 50) {
    const batch = allFixes.slice(i, i + 50);
    const byTarget = {};
    for (const f of batch) {
      if (!byTarget[f.to]) byTarget[f.to] = [];
      byTarget[f.to].push(f.id);
    }
    for (const [targetCat, ids] of Object.entries(byTarget)) {
      const { error } = await supabase.from("products").update({ category: targetCat }).in("id", ids);
      if (error) console.error("Error:", error.message);
      else applied += ids.length;
    }
  }
  console.log(`Applied: ${applied}\n`);

  console.log("=== SUMMARY ===");
  Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

  // Final dist
  console.log("\n=== FINAL DISTRIBUTION ===");
  let all = [], offset = 0;
  while (true) {
    const { data } = await supabase.from("products").select("category").range(offset, offset + 999);
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 1000) break;
    offset += 1000;
  }
  const dist = {};
  for (const p of all) dist[p.category] = (dist[p.category] || 0) + 1;
  Object.entries(dist).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  console.log(`  TOTAL: ${all.length} | CATEGORIES: ${Object.keys(dist).length}`);
}

main().catch(console.error);
