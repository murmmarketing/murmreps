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

// Category rules — checked in this order (most specific first)
const rules = [
  // JEANS before pants
  { cat: "Jeans", kw: ["jeans", "denim pants", "denim pant"] },
  // T-SHIRTS before shirts
  { cat: "T-Shirts", kw: ["tee", "t-shirt", "tshirt", "short sleeve"] },
  // HOODIES before general
  { cat: "Hoodies", kw: ["hoodie", "hooded", "zip-up", "zip up hoodie"] },
  // CREWNECKS
  { cat: "Crewnecks", kw: ["crewneck", "sweatshirt", "crew neck"] },
  // SWEATERS
  { cat: "Sweaters", kw: ["sweater", "knit", "cardigan", "pullover", "knitwear"] },
  // BOOTS before shoes
  { cat: "Boots", kw: ["boot", "martin", "chelsea", "combat", "desert boot", "texan"] },
  // SLIDES before shoes
  { cat: "Slides & Sandals", kw: ["slide", "sandal", "slipper", "crocs", "foam runner", "yeezy slide", "clog"] },
  // SNEAKERS before shoes
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
  // SHOES catch-all footwear
  { cat: "Shoes", kw: ["shoe", "loafer", "derby", "oxford", "mule", "espadrille", "heel", "pump", "stiletto", "ugg"] },
  // COATS before jackets
  { cat: "Coats & Puffers", kw: ["coat", "puffer", "down jacket", "parka", "quilted", "moncler", "north face down", "canada goose"] },
  // JACKETS
  { cat: "Jackets", kw: ["jacket", "bomber", "windbreaker", "varsity", "denim jacket", "leather jacket", "harrington", "blazer"] },
  // VESTS
  { cat: "Vests", kw: ["vest", "gilet", "sleeveless jacket"] },
  // SHIRTS (after t-shirts)
  { cat: "Shirts", kw: ["shirt", "button", "polo", "flannel"] },
  // JERSEYS
  { cat: "Jerseys", kw: ["jersey", "football shirt", "soccer shirt", "basketball shirt"] },
  // PANTS
  { cat: "Pants", kw: ["pants", "trousers", "cargo", "jogger", "sweatpants", "track pants", "wide-leg"] },
  // SHORTS
  { cat: "Shorts", kw: ["short", "swim trunk"] },
  // TRACKSUITS
  { cat: "Tracksuits", kw: ["tracksuit", "track suit"] },
  // HOME & DECOR (before keychains)
  { cat: "Home & Decor", kw: ["ornament", "figure", "figurine", "pillow", "blanket", "candle", "ashtray", "lego", "building block", "kaws", "bearbrick", "action figure", "rug", "carpet", "wet grass"] },
  // ELECTRONICS (before phone cases, airpod = electronics)
  { cat: "Electronics", kw: ["airpod", "headphone", "speaker", "earbud", "electronic", "gadget"] },
  // PERFUMES
  { cat: "Perfumes", kw: ["perfume", "fragrance", "cologne", "scent"] },
  // WATCHES (before other jewelry)
  { cat: "Watches", kw: ["watch", "rolex", "datejust", "submariner", "daytona"] },
  // NECKLACES
  { cat: "Necklaces", kw: ["necklace", "chain", "pendant", "choker"] },
  // BRACELETS
  { cat: "Bracelets", kw: ["bracelet", "bangle", "cuff", "wristband"] },
  // EARRINGS (before rings)
  { cat: "Earrings", kw: ["earring", "stud", "hoop", "ear cuff"] },
  // RINGS
  { cat: "Rings", kw: ["ring"] },
  // BAGS
  { cat: "Bags", kw: ["bag", "backpack", "duffle", "tote", "crossbody", "shoulder", "satchel", "keepall", "messenger", "briefcase", "fanny pack", "waist bag", "clutch"] },
  // WALLETS
  { cat: "Wallets", kw: ["wallet", "card holder", "cardholder", "purse", "money clip"] },
  // BELTS
  { cat: "Belts", kw: ["belt"] },
  // HATS & CAPS
  { cat: "Hats & Caps", kw: ["hat", "cap", "beanie", "bucket hat", "balaclava", "headwear", "ski mask"] },
  // SCARVES & GLOVES
  { cat: "Scarves & Gloves", kw: ["scarf", "glove", "shawl"] },
  // SUNGLASSES
  { cat: "Sunglasses", kw: ["sunglasses", "glasses", "eyewear", "goggles"] },
  // PHONE CASES
  { cat: "Phone Cases", kw: ["phone case", "iphone", "case"] },
  // SOCKS & UNDERWEAR
  { cat: "Socks & Underwear", kw: ["sock", "underwear", "boxer", "brief", "undershirt"] },
  // KEYCHAINS & ACCESSORIES (catch-all accessories)
  { cat: "Keychains & Accessories", kw: ["keychain", "key ring", "lighter", "pin", "badge", "lanyard", "sticker", "bandana", "mask", "tie"] },
];

// Fallback map from old broad categories
const fallbackMap = {
  "Shoes": "Shoes",
  "Streetwear": "T-Shirts",
  "Bags & Acc": "Keychains & Accessories",
  "Jewelry": "Necklaces",
};

function categorize(name, oldCategory) {
  const n = name.toLowerCase();

  // Special: "ring" should not match "earring" — earring rule comes first
  for (const rule of rules) {
    for (const kw of rule.kw) {
      if (n.includes(kw)) {
        // Special case: "ring" keyword — skip if "earring" already matched
        if (rule.cat === "Rings" && kw === "ring" && n.includes("earring")) continue;
        // Special case: "shirt" — skip if it's t-shirt/tshirt (already matched above)
        if (rule.cat === "Shirts" && kw === "shirt" && (n.includes("t-shirt") || n.includes("tshirt") || n.includes("tee"))) continue;
        // Special case: "short" — skip if it's "shorts" matched as "short sleeve"
        if (rule.cat === "Shorts" && kw === "short" && n.includes("short sleeve")) continue;
        // Special case: "case" alone is too broad — only match "phone case", "airpod case"
        if (rule.cat === "Phone Cases" && kw === "case" && !n.includes("phone") && !n.includes("airpod")) continue;
        return rule.cat;
      }
    }
  }

  return fallbackMap[oldCategory] || "Keychains & Accessories";
}

async function main() {
  // 1. Drop the category check constraint
  console.log("Dropping category CHECK constraint...");
  const { error: sqlErr } = await supabase.rpc("exec_sql", {
    sql: "ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;",
  });
  if (sqlErr) {
    // Try raw SQL via REST — if rpc doesn't exist, we'll do it manually
    console.log("RPC not available, attempting direct update (constraint may already be dropped)...");
  } else {
    console.log("Constraint dropped.");
  }

  // 2. Fetch all products
  let allProducts = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, brand, category")
      .range(from, from + PAGE - 1)
      .order("id");
    if (error) { console.error("Fetch error:", error.message); break; }
    if (!data || data.length === 0) break;
    allProducts = allProducts.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  console.log(`\nFetched ${allProducts.length} products\n`);

  // 3. Recategorize
  const updates = [];
  const counts = {};
  let changes = 0;

  for (const p of allProducts) {
    const newCat = categorize(p.name, p.category);
    counts[newCat] = (counts[newCat] || 0) + 1;

    if (newCat !== p.category) {
      updates.push({ id: p.id, category: newCat });
      if (changes < 50) {
        console.log(`[${p.id}] ${p.name.slice(0, 55)}: ${p.category} -> ${newCat}`);
      }
      changes++;
    }
  }
  if (changes > 50) console.log(`... and ${changes - 50} more changes`);

  // 4. Batch update
  console.log(`\nApplying ${updates.length} updates...`);
  let applied = 0;
  let errors = 0;
  for (let i = 0; i < updates.length; i += 100) {
    const batch = updates.slice(i, i + 100);
    for (const u of batch) {
      const { error } = await supabase
        .from("products")
        .update({ category: u.category })
        .eq("id", u.id);
      if (error) {
        if (errors === 0) console.error(`  First error on id ${u.id} (${u.category}): ${error.message}`);
        errors++;
      } else {
        applied++;
      }
    }
    console.log(`  [${Math.min(i + 100, updates.length)}/${updates.length}] processed`);
  }

  // 5. Summary
  console.log(`\nDone! ${changes} category changes, ${applied} applied, ${errors} errors`);
  console.log("\nCategory distribution:");
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sorted) {
    console.log(`  ${cat}: ${count}`);
  }
}

main().catch(console.error);
