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

const SHOES = [
  "shoe", "sneaker", "boot", "loafer", "slipper", "slide", "yeezy", "jordan",
  "air force", "af1", "aj1", "aj4", "aj11", "dunk", "trainer", "runner",
  "foam", "clog", "sandal", "mule", "derby", "oxford", "brogue", "heel",
  "pump", "stiletto", "espadrille", "converse", "vans old skool", "new balance",
  "crocs", "air max", "nb550", "nb530", "nb2002", "adidas samba", "adidas campus",
  "adidas gazelle", "gel-kayano", "asics", "salomon", "ugg",
];

const JEWELRY = [
  "necklace", "bracelet", "ring", "earring", "chain", "pendant", "watch",
  "bangle", "anklet", "brooch", "cufflink", "tiara", "choker", "rolex",
  "cartier", "van cleef",
];

const BAGS_ACC = [
  "bag", "wallet", "belt", "cap", "hat", "beanie", "scarf", "glove",
  "sunglasses", "glasses", "keychain", "phone case", "case", "airpod",
  "headphone", "sock", "underwear", "tie", "mask", "bandana", "headband",
  "ornament", "perfume", "fragrance", "lighter", "ashtray", "card holder",
  "pouch", "backpack", "duffle", "tote", "clutch", "crossbody", "shoulder bag",
  "waist bag", "fanny pack", "umbrella", "pillow",
];

function categorize(name) {
  const n = name.toLowerCase();
  for (const kw of SHOES) { if (n.includes(kw)) return "Shoes"; }
  for (const kw of JEWELRY) { if (n.includes(kw)) return "Jewelry"; }
  for (const kw of BAGS_ACC) { if (n.includes(kw)) return "Bags & Acc"; }
  return "Streetwear";
}

function tierFromPrice(price, existingTier) {
  if (price == null) return existingTier || "mid";
  if (price < 50) return "budget";
  if (price < 150) return "mid";
  return "premium";
}

async function main() {
  // Fetch all products
  let allProducts = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, brand, category, tier, price_cny")
      .range(from, from + PAGE - 1)
      .order("id");
    if (error) { console.error("Fetch error:", error.message); break; }
    if (!data || data.length === 0) break;
    allProducts = allProducts.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  console.log(`Fetched ${allProducts.length} products\n`);

  const updates = [];
  const counts = { Shoes: 0, Streetwear: 0, "Bags & Acc": 0, Jewelry: 0 };
  let catChanges = 0;
  let tierChanges = 0;

  for (const p of allProducts) {
    const newCat = categorize(p.name);
    const newTier = tierFromPrice(p.price_cny, p.tier);
    counts[newCat]++;

    const changed = {};
    if (newCat !== p.category) {
      changed.category = newCat;
      console.log(`[${p.id}] ${p.name.slice(0, 50)}: ${p.category} → ${newCat}`);
      catChanges++;
    }
    if (newTier !== p.tier) {
      changed.tier = newTier;
      tierChanges++;
    }

    if (Object.keys(changed).length > 0) {
      updates.push({ id: p.id, ...changed });
    }
  }

  // Batch update
  console.log(`\nApplying ${updates.length} updates...`);
  let applied = 0;
  for (let i = 0; i < updates.length; i += 100) {
    const batch = updates.slice(i, i + 100);
    for (const u of batch) {
      const { id, ...fields } = u;
      const { error } = await supabase
        .from("products")
        .update(fields)
        .eq("id", id);
      if (error) {
        console.error(`  Error updating ${id}: ${error.message}`);
      } else {
        applied++;
      }
    }
    console.log(`  [${Math.min(i + 100, updates.length)}/${updates.length}] updated`);
  }

  console.log(`\nDone! ${catChanges} category changes, ${tierChanges} tier changes (${applied} updates applied)`);
  console.log(`Shoes: ${counts.Shoes}, Streetwear: ${counts.Streetwear}, Bags & Acc: ${counts["Bags & Acc"]}, Jewelry: ${counts.Jewelry}`);
}

main().catch(console.error);
