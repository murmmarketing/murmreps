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

function hasChinese(str) {
  return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(str);
}

const TYPE_MAP = {
  Shirts: "T-Shirt", Hoodies: "Hoodie", Sweaters: "Sweater", Polos: "Polo Shirt",
  "Long Sleeves": "Long Sleeve Tee", Jerseys: "Jersey", "Tank Tops": "Tank Top", Tops: "Top",
  Pants: "Pants", Shorts: "Shorts", Jackets: "Jacket",
  Shoes: "Sneakers", Boots: "Boots", "Slides & Sandals": "Slides",
  Bags: "Bag", Wallets: "Wallet", "Hats & Caps": "Cap", Belts: "Belt",
  Necklaces: "Necklace", Bracelets: "Bracelet", Earrings: "Earrings", Rings: "Ring",
  Watches: "Watch", Sunglasses: "Sunglasses", Glasses: "Glasses",
  "Socks & Underwear": "Socks", "Scarves & Gloves": "Scarf",
  "Phone Cases": "Phone Case", Accessories: "Accessory",
  "Home & Decor": "Home Decor", Home: "Home Decor",
  Jewelry: "Jewelry", Electronics: "Electronics", Perfumes: "Perfume",
  Unique: "Item", "Old Money": "Item", Keychains: "Keychain",
  Masks: "Mask", Ties: "Tie",
};

function extractEnglishParts(name) {
  // Match runs of latin characters, digits, common punctuation
  const parts = name.match(/[A-Za-z0-9][\w\s&\-'.,]+/g);
  if (!parts) return null;

  const skipWords = new Set([
    "P", "L", "M", "S", "CM", "KG", "MM", "XL", "XXL", "XXXL", "XS",
    "A", "I", "IN", "OF", "FOR", "AND", "THE", "TO", "OR", "ON", "BY",
    "NEW", "HOT", "TOP", "SALE", "FREE", "SIZE", "BEST", "HIGH",
  ]);

  const cleaned = parts
    .map((s) => s.trim())
    .filter((s) => s.length > 1)
    .filter((s) => !skipWords.has(s.toUpperCase()))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.length > 3 ? cleaned : null;
}

function getNewName(product) {
  const brand = product.brand || "";
  const hasBrand = brand && brand !== "Unknown" && brand !== "Various";
  const category = product.category || "";
  const type = TYPE_MAP[category] || "Item";

  // Try to extract English parts from the Chinese name
  const extracted = extractEnglishParts(product.name);

  if (extracted) {
    // If extracted text already contains the brand, use as-is
    if (hasBrand && extracted.toLowerCase().includes(brand.toLowerCase())) {
      return extracted;
    }
    // Prepend brand if available
    if (hasBrand) {
      return `${brand} ${extracted}`;
    }
    return extracted;
  }

  // No English text found — generate from brand + category
  if (hasBrand) {
    return `${brand} ${type}`;
  }
  return type;
}

async function fetchAll() {
  let all = [];
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from("products")
      .select("id, name, brand, category, image, score")
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
  const allProducts = await fetchAll();
  console.log(`Total products: ${allProducts.length}`);

  const chineseProducts = allProducts.filter((p) => hasChinese(p.name));
  console.log(`Products with Chinese names: ${chineseProducts.length}\n`);

  // Step 1: Rename
  let renamed = 0;
  const logLimit = 80;

  for (let i = 0; i < chineseProducts.length; i += 50) {
    const batch = chineseProducts.slice(i, i + 50);
    for (const p of batch) {
      const newName = getNewName(p);
      if (newName && newName !== p.name) {
        const { error } = await supabase
          .from("products")
          .update({ name: newName })
          .eq("id", p.id);
        if (error) {
          console.error(`Error updating ${p.id}:`, error.message);
        } else {
          renamed++;
          if (renamed <= logLimit) {
            const oldShort = p.name.length > 50 ? p.name.substring(0, 50) + "..." : p.name;
            console.log(`  "${oldShort}" → "${newName}"`);
          }
        }
      }
    }
  }

  if (renamed > logLimit) {
    console.log(`  ... and ${renamed - logLimit} more`);
  }

  console.log(`\nRenamed: ${renamed} products`);

  // Step 2: Demote junk — Chinese name, no brand, no image
  const junkProducts = chineseProducts.filter(
    (p) =>
      (!p.brand || p.brand === "Unknown" || p.brand === "Various") &&
      (!p.image || p.image === "")
  );

  let demoted = 0;
  for (let i = 0; i < junkProducts.length; i += 50) {
    const batch = junkProducts.slice(i, i + 50);
    const ids = batch.map((p) => p.id);
    const { error } = await supabase
      .from("products")
      .update({ score: 0 })
      .in("id", ids);
    if (error) console.error("Demote error:", error.message);
    else demoted += ids.length;
  }

  console.log(`Demoted: ${demoted} unidentifiable products (score → 0)\n`);

  console.log("=== SUMMARY ===");
  console.log(`  Chinese names found: ${chineseProducts.length}`);
  console.log(`  Renamed: ${renamed}`);
  console.log(`  Demoted (no brand, no image): ${demoted}`);
  console.log(`  Unchanged: ${chineseProducts.length - renamed}`);
}

main().catch(console.error);
