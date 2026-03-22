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

// --- Category rules (same order as recategorize.js — most specific first) ---
const rules = [
  { cat: "Jeans", kw: ["jeans", "denim pants", "denim pant"] },
  { cat: "T-Shirts", kw: ["tee", "t-shirt", "tshirt", "short sleeve"] },
  { cat: "Hoodies", kw: ["hoodie", "hooded", "zip-up", "zip up hoodie"] },
  { cat: "Crewnecks", kw: ["crewneck", "sweatshirt", "crew neck"] },
  { cat: "Sweaters", kw: ["sweater", "knit", "cardigan", "pullover", "knitwear"] },
  { cat: "Boots", kw: ["boot", "martin", "chelsea", "combat", "desert boot", "texan"] },
  { cat: "Slides & Sandals", kw: ["slide", "sandal", "slipper", "crocs", "foam runner", "yeezy slide", "clog"] },
  { cat: "Sneakers", kw: [
    "sneaker", "jordan", "aj1", "aj4", "aj5", "aj11", "dunk", "air force", "af1",
    "yeezy 350", "yeezy 500", "yeezy 700", "new balance", "converse", "vans",
    "trainer", "runner", "air max", "airmax", "nb550", "nb530", "nb2002",
    "adidas samba", "adidas campus", "adidas gazelle", "gel-kayano", "asics",
    "salomon", "bapesta", "cortez", "puma", "reebok", "on cloud",
    "rick owens ramone", "rick owens geo", "maison mihara", "golden goose",
    "alexander mcqueen", "mcqueen leather", "off-white out of office",
    "airjordan", "air jordan", "kobe", "lebron", "uptempo", "vapormax",
  ]},
  { cat: "Shoes", kw: ["shoe", "loafer", "derby", "oxford", "mule", "espadrille", "heel", "pump", "stiletto", "ugg"] },
  { cat: "Coats & Puffers", kw: ["coat", "puffer", "down jacket", "parka", "quilted", "moncler", "north face down", "canada goose"] },
  { cat: "Jackets", kw: ["jacket", "bomber", "windbreaker", "varsity", "denim jacket", "leather jacket", "harrington", "blazer"] },
  { cat: "Vests", kw: ["vest", "gilet", "sleeveless jacket"] },
  { cat: "Shirts", kw: ["shirt", "button", "polo", "flannel"] },
  { cat: "Jerseys", kw: ["jersey", "football shirt", "soccer shirt", "basketball shirt"] },
  { cat: "Pants", kw: ["pants", "trousers", "cargo", "jogger", "sweatpants", "track pants", "wide-leg"] },
  { cat: "Shorts", kw: ["short", "swim trunk"] },
  { cat: "Tracksuits", kw: ["tracksuit", "track suit"] },
  { cat: "Home & Decor", kw: ["ornament", "figure", "figurine", "pillow", "blanket", "candle", "ashtray", "lego", "building block", "kaws", "bearbrick", "action figure", "rug", "carpet", "wet grass"] },
  { cat: "Electronics", kw: ["airpod", "headphone", "speaker", "earbud", "electronic", "gadget"] },
  { cat: "Perfumes", kw: ["perfume", "fragrance", "cologne", "scent"] },
  { cat: "Watches", kw: ["watch", "rolex", "datejust", "submariner", "daytona"] },
  { cat: "Necklaces", kw: ["necklace", "chain", "pendant", "choker"] },
  { cat: "Bracelets", kw: ["bracelet", "bangle", "cuff", "wristband"] },
  { cat: "Earrings", kw: ["earring", "stud", "hoop", "ear cuff"] },
  { cat: "Rings", kw: ["ring"] },
  { cat: "Bags", kw: ["bag", "backpack", "duffle", "tote", "crossbody", "shoulder", "satchel", "keepall", "messenger", "briefcase", "fanny pack", "waist bag", "clutch"] },
  { cat: "Wallets", kw: ["wallet", "card holder", "cardholder", "purse", "money clip"] },
  { cat: "Belts", kw: ["belt"] },
  { cat: "Hats & Caps", kw: ["hat", "cap", "beanie", "bucket hat", "balaclava", "headwear", "ski mask"] },
  { cat: "Scarves & Gloves", kw: ["scarf", "glove", "shawl"] },
  { cat: "Sunglasses", kw: ["sunglasses", "glasses", "eyewear", "goggles"] },
  { cat: "Phone Cases", kw: ["phone case", "iphone", "case"] },
  { cat: "Socks & Underwear", kw: ["sock", "underwear", "boxer", "brief", "undershirt"] },
  { cat: "Keychains & Accessories", kw: ["keychain", "key ring", "lighter", "pin", "badge", "lanyard", "sticker", "bandana", "mask", "tie"] },
];

// --- Category groupings ---
const FOOTWEAR_CATEGORIES = new Set([
  "Sneakers", "Shoes", "Boots", "Slides & Sandals",
]);

const CLOTHING_CATEGORIES = new Set([
  "T-Shirts", "Hoodies", "Crewnecks", "Sweaters", "Jackets", "Coats & Puffers",
  "Vests", "Shirts", "Jerseys", "Pants", "Jeans", "Shorts", "Tracksuits",
]);

// --- Variant analysis ---
const NUMERIC_SHOE_SIZES = new Set([
  "35", "35.5", "36", "36.5", "37", "37.5", "38", "38.5", "39", "39.5",
  "40", "40.5", "41", "41.5", "42", "42.5", "43", "43.5", "44", "44.5",
  "45", "45.5", "46", "46.5", "47",
]);

const LETTER_SIZES = new Set([
  "xs", "s", "m", "l", "xl", "xxl", "2xl", "3xl", "4xl", "5xl",
]);

const COLOR_NAMES = new Set([
  "black", "white", "red", "blue", "green", "yellow", "orange", "purple",
  "pink", "brown", "grey", "gray", "beige", "cream", "navy", "khaki",
  "olive", "maroon", "tan", "silver", "gold", "multi", "multicolor",
]);

function analyzeVariants(variants) {
  if (!variants || !Array.isArray(variants) || variants.length === 0) {
    return null; // no signal
  }

  let shoeCount = 0;
  let clothingCount = 0;
  let colorOnlyCount = 0;

  for (const v of variants) {
    const name = (v.name || v.label || v.size || v.title || "").toString().trim().toLowerCase();
    if (!name) continue;

    // Check if it's just a color
    if (COLOR_NAMES.has(name)) {
      colorOnlyCount++;
      continue;
    }

    // Check numeric shoe sizes
    if (NUMERIC_SHOE_SIZES.has(name)) {
      shoeCount++;
      continue;
    }

    // Sizes like "EU 42", "US 9", "UK 8" → footwear
    if (/^(eu|us|uk)\s*\d/i.test(name)) {
      shoeCount++;
      continue;
    }

    // Check letter sizes
    if (LETTER_SIZES.has(name)) {
      clothingCount++;
      continue;
    }
  }

  if (shoeCount > 0 && shoeCount >= clothingCount) return "footwear";
  if (clothingCount > 0 && clothingCount > shoeCount) return "clothing";
  return null; // no clear signal (colors only, or unknown variant names)
}

// --- Name-based categorization (from recategorize.js) ---
function categorizeByName(name) {
  const n = name.toLowerCase();

  for (const rule of rules) {
    for (const kw of rule.kw) {
      if (n.includes(kw)) {
        if (rule.cat === "Rings" && kw === "ring" && n.includes("earring")) continue;
        if (rule.cat === "Shirts" && kw === "shirt" && (n.includes("t-shirt") || n.includes("tshirt") || n.includes("tee"))) continue;
        if (rule.cat === "Shorts" && kw === "short" && n.includes("short sleeve")) continue;
        if (rule.cat === "Phone Cases" && kw === "case" && !n.includes("phone") && !n.includes("airpod")) continue;
        return rule.cat;
      }
    }
  }

  return null; // no keyword match
}

// --- Determine correct category for a miscategorized product ---
function determineCorrectCategory(product, variantSignal) {
  const n = product.name.toLowerCase();

  // First try name-based (most specific)
  const nameCat = categorizeByName(product.name);
  if (nameCat) return { category: nameCat, reason: `name keyword match` };

  // Fall back to variant signal
  if (variantSignal === "footwear") {
    return { category: "Sneakers", reason: "has shoe sizes (36-46) but no specific footwear keyword" };
  }
  if (variantSignal === "clothing") {
    // Try to guess from name fragments
    if (n.includes("hoodie")) return { category: "Hoodies", reason: "has clothing sizes + hoodie in name" };
    if (n.includes("jacket")) return { category: "Jackets", reason: "has clothing sizes + jacket in name" };
    if (n.includes("pant") || n.includes("trouser")) return { category: "Pants", reason: "has clothing sizes + pants in name" };
    return { category: "T-Shirts", reason: "has clothing sizes (S-XXL) but no specific keyword" };
  }

  return null;
}

// --- Main ---
async function main() {
  console.log("Fetching all products from Supabase...\n");

  // Fetch ALL products with pagination
  let allProducts = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, brand, category, variants")
      .range(from, from + PAGE - 1)
      .order("id");
    if (error) { console.error("Fetch error:", error.message); break; }
    if (!data || data.length === 0) break;
    allProducts = allProducts.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  console.log(`Fetched ${allProducts.length} products\n`);

  // Analyze each product
  const updates = [];
  const changeCounts = {};

  for (const p of allProducts) {
    const variantSignal = analyzeVariants(p.variants);
    const currentCat = p.category;
    const isCurrentFootwear = FOOTWEAR_CATEGORIES.has(currentCat);
    const isCurrentClothing = CLOTHING_CATEGORIES.has(currentCat);

    let mismatch = false;
    let reason = "";

    // Cross-reference: variant sizes contradict current category
    if (variantSignal === "footwear" && isCurrentClothing) {
      mismatch = true;
      reason = `has shoe sizes but categorized as ${currentCat}`;
    } else if (variantSignal === "clothing" && isCurrentFootwear) {
      mismatch = true;
      reason = `has clothing sizes (S-XXL) but categorized as ${currentCat}`;
    }

    // Also check: name keywords clearly say something different from current category
    if (!mismatch) {
      const nameCat = categorizeByName(p.name);
      if (nameCat && nameCat !== currentCat) {
        const nameIsFootwear = FOOTWEAR_CATEGORIES.has(nameCat);
        const nameIsClothing = CLOTHING_CATEGORIES.has(nameCat);

        // Only flag if it's a cross-type mismatch (footwear vs clothing)
        // or if variants also support the name-based category
        if ((nameIsFootwear && isCurrentClothing) || (nameIsClothing && isCurrentFootwear)) {
          mismatch = true;
          reason = `name suggests ${nameCat} but categorized as ${currentCat}`;
        } else if (variantSignal === "footwear" && nameIsFootwear && !isCurrentFootwear) {
          mismatch = true;
          reason = `name + variants both suggest footwear, currently ${currentCat}`;
        } else if (variantSignal === "clothing" && nameIsClothing && !isCurrentClothing) {
          mismatch = true;
          reason = `name + variants both suggest clothing, currently ${currentCat}`;
        }
      }
    }

    if (!mismatch) continue;

    // Determine the correct category
    const result = determineCorrectCategory(p, variantSignal);
    if (!result) continue;

    // Don't "fix" if it would result in the same category
    if (result.category === currentCat) continue;

    updates.push({
      id: p.id,
      name: p.name,
      oldCategory: currentCat,
      newCategory: result.category,
      reason: reason || result.reason,
    });

    changeCounts[result.category] = (changeCounts[result.category] || 0) + 1;

    console.log(`[${p.id}] ${p.name.slice(0, 60)}: ${currentCat} -> ${result.category} (reason: ${reason || result.reason})`);
  }

  if (updates.length === 0) {
    console.log("\nNo miscategorized products found.");
    return;
  }

  // Batch update 100 at a time
  console.log(`\nApplying ${updates.length} updates in batches of 100...`);
  let applied = 0;
  let errors = 0;

  for (let i = 0; i < updates.length; i += 100) {
    const batch = updates.slice(i, i + 100);
    for (const u of batch) {
      const { error } = await supabase
        .from("products")
        .update({ category: u.newCategory })
        .eq("id", u.id);
      if (error) {
        if (errors === 0) console.error(`  First error on id ${u.id}: ${error.message}`);
        errors++;
      } else {
        applied++;
      }
    }
    console.log(`  [${Math.min(i + 100, updates.length)}/${updates.length}] processed`);
  }

  // Summary
  console.log(`\nDone. ${updates.length} products recategorized (${applied} applied, ${errors} errors).`);
  const sorted = Object.entries(changeCounts).sort((a, b) => b[1] - a[1]);
  const summary = sorted.map(([cat, count]) => `${cat}: ${count}`).join(", ");
  console.log(summary);
}

main().catch(console.error);
