const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load env from .env.local
const envPath = path.join(__dirname, "..", ".env.local");
fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) process.env[key.trim()] = vals.join("=").trim();
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE env vars in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// ── 121 source links from KakoBuy order history ──

const TAOBAO_LINKS = [
  "https://item.taobao.com/item.htm?id=1007060749240",
  "https://item.taobao.com/item.htm?id=1001403494745",
  "https://item.taobao.com/item.htm?id=1002941528642",
  "https://item.taobao.com/item.htm?id=987262613692",
  "https://item.taobao.com/item.htm?id=730759940894",
  "https://item.taobao.com/item.htm?id=899470912558",
  "https://item.taobao.com/item.htm?id=751550640142",
  "https://item.taobao.com/item.htm?id=769516124034",
  "https://item.taobao.com/item.htm?id=745249277869",
  "https://item.taobao.com/item.htm?id=1012975207504",
  "https://item.taobao.com/item.htm?id=728179824491",
  "https://item.taobao.com/item.htm?id=941105287419",
  "https://item.taobao.com/item.htm?id=842516501960",
  "https://item.taobao.com/item.htm?id=828089004543",
  "https://item.taobao.com/item.htm?id=961331042005",
  "https://item.taobao.com/item.htm?id=967697624906",
  "https://item.taobao.com/item.htm?id=984364211574",
  "https://item.taobao.com/item.htm?id=1011861700280",
  "https://item.taobao.com/item.htm?id=639122758792",
  "https://item.taobao.com/item.htm?id=884744856434",
  "https://item.taobao.com/item.htm?id=950854261728",
  "https://item.taobao.com/item.htm?id=929096534555",
  "https://item.taobao.com/item.htm?id=1001602825367",
  "https://item.taobao.com/item.htm?id=1011845575131",
  "https://item.taobao.com/item.htm?id=962961242067",
  "https://item.taobao.com/item.htm?id=938175487891",
  "https://item.taobao.com/item.htm?id=956148739772",
  "https://item.taobao.com/item.htm?id=821469662843",
  "https://item.taobao.com/item.htm?id=1012009865855",
  "https://item.taobao.com/item.htm?id=712966174840",
  "https://item.taobao.com/item.htm?id=947416154433",
  "https://item.taobao.com/item.htm?id=955482988016",
  "https://item.taobao.com/item.htm?id=946630383692",
  "https://item.taobao.com/item.htm?id=1001265318515",
  "https://item.taobao.com/item.htm?id=953666314966",
  "https://item.taobao.com/item.htm?id=981076996126",
  "https://item.taobao.com/item.htm?id=977995402805",
  "https://item.taobao.com/item.htm?id=952989021183",
  "https://item.taobao.com/item.htm?id=714321774898",
  "https://item.taobao.com/item.htm?id=946173615123",
  "https://item.taobao.com/item.htm?id=946261963332",
  "https://item.taobao.com/item.htm?id=669571541272",
  "https://item.taobao.com/item.htm?id=783418430641",
  "https://item.taobao.com/item.htm?id=1008344565315",
  "https://item.taobao.com/item.htm?id=791944991296",
  "https://item.taobao.com/item.htm?id=991808546170",
  "https://item.taobao.com/item.htm?id=899869422969",
  "https://item.taobao.com/item.htm?id=903069444736",
  "https://item.taobao.com/item.htm?id=921820770871",
];

const WEIDIAN_LINKS = [
  "https://weidian.com/item.html?itemID=7685445289",
  "https://weidian.com/item.html?itemID=7656194211",
  "https://weidian.com/item.html?itemID=7573597413",
  "https://weidian.com/item.html?itemID=7328134430",
  "https://weidian.com/item.html?itemID=7461024088",
  "https://weidian.com/item.html?itemID=7670779992",
  "https://weidian.com/item.html?itemID=7459699767",
  "https://weidian.com/item.html?itemID=7646139867",
  "https://weidian.com/item.html?itemID=7556339497",
  "https://weidian.com/item.html?itemID=7651716768",
  "https://weidian.com/item.html?itemID=7652291208",
  "https://weidian.com/item.html?itemID=7541511286",
  "https://weidian.com/item.html?itemID=7652325856",
  "https://weidian.com/item.html?itemID=7539673669",
  "https://weidian.com/item.html?itemID=7555857734",
  "https://weidian.com/item.html?itemID=7577520283",
  "https://weidian.com/item.html?itemID=7655301917",
  "https://weidian.com/item.html?itemID=7392800195",
  "https://weidian.com/item.html?itemID=7238645882",
  "https://weidian.com/item.html?itemID=7460498284",
  "https://weidian.com/item.html?itemID=7484897832",
  "https://weidian.com/item.html?itemID=7638960616",
  "https://weidian.com/item.html?itemID=7539609187",
  "https://weidian.com/item.html?itemID=7549235404",
  "https://weidian.com/item.html?itemID=7500137406",
  "https://weidian.com/item.html?itemID=7498298985",
  "https://weidian.com/item.html?itemID=7500145404",
  "https://weidian.com/item.html?itemID=7619378783",
  "https://weidian.com/item.html?itemID=7500135388",
  "https://weidian.com/item.html?itemID=7498243273",
  "https://weidian.com/item.html?itemID=7498308705",
  "https://weidian.com/item.html?itemID=7498318821",
  "https://weidian.com/item.html?itemID=7499260388",
  "https://weidian.com/item.html?itemID=7497354597",
  "https://weidian.com/item.html?itemID=7547098517",
  "https://weidian.com/item.html?itemID=7549315040",
  "https://weidian.com/item.html?itemID=7549289206",
  "https://weidian.com/item.html?itemID=7547377223",
  "https://weidian.com/item.html?itemID=7549257366",
  "https://weidian.com/item.html?itemID=7559211058",
  "https://weidian.com/item.html?itemID=7549235358",
  "https://weidian.com/item.html?itemID=7313870810",
  "https://weidian.com/item.html?itemID=7598936051",
  "https://weidian.com/item.html?itemID=7488796528",
  "https://weidian.com/item.html?itemID=7600143274",
  "https://weidian.com/item.html?itemID=7447773384",
  "https://weidian.com/item.html?itemID=7598625878",
  "https://weidian.com/item.html?itemID=7573722661",
  "https://weidian.com/item.html?itemID=7323275646",
  "https://weidian.com/item.html?itemID=7614069159",
  "https://weidian.com/item.html?itemID=7574868541",
  "https://weidian.com/item.html?itemID=7327942231",
  "https://weidian.com/item.html?itemID=7596524681",
  "https://weidian.com/item.html?itemID=7382451897",
  "https://weidian.com/item.html?itemID=7569340265",
  "https://weidian.com/item.html?itemID=7573933946",
  "https://weidian.com/item.html?itemID=7595654784",
  "https://weidian.com/item.html?itemID=7387303842",
  "https://weidian.com/item.html?itemID=7462412145",
  "https://weidian.com/item.html?itemID=7462416159",
  "https://weidian.com/item.html?itemID=7461366848",
  "https://weidian.com/item.html?itemID=7463109294",
  "https://weidian.com/item.html?itemID=7461924099",
  "https://weidian.com/item.html?itemID=7461916115",
  "https://weidian.com/item.html?itemID=7459680451",
  "https://weidian.com/item.html?itemID=7600212080",
  "https://weidian.com/item.html?itemID=7448636739",
  "https://weidian.com/item.html?itemID=7571541252",
  "https://weidian.com/item.html?itemID=7565037431",
  "https://weidian.com/item.html?itemID=7565025595",
  "https://weidian.com/item.html?itemID=7567830978",
  "https://weidian.com/item.html?itemID=7565030925",
];

const ALL_LINKS = [...TAOBAO_LINKS, ...WEIDIAN_LINKS];

// ── Extract item ID from a source link ──

function extractItemId(url) {
  if (!url) return null;
  // Weidian: itemID= or itemId= param
  const wdMatch = url.match(/itemI[Dd]=(\d+)/);
  if (wdMatch) return wdMatch[1];
  // Taobao: id= param
  const tbMatch = url.match(/[?&]id=(\d+)/);
  if (tbMatch) return tbMatch[1];
  return null;
}

// ── Determine source type ──

function getSourceType(url) {
  if (url.includes("weidian.com")) return "weidian";
  if (url.includes("taobao.com")) return "taobao";
  return "unknown";
}

// ── Category rules (from recategorize.js) ──

const categoryRules = [
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

function categorize(name) {
  const lower = (name || "").toLowerCase();
  for (const rule of categoryRules) {
    for (const kw of rule.kw) {
      if (lower.includes(kw)) return rule.cat;
    }
  }
  return "T-Shirts"; // default
}

function determineTier(priceCny) {
  if (priceCny == null) return "mid";
  if (priceCny < 50) return "budget";
  if (priceCny < 150) return "mid";
  return "premium";
}

// ── Main ──

async function main() {
  console.log(`\nImport Orders Script`);
  console.log(`====================`);
  console.log(`Total source links: ${ALL_LINKS.length} (${TAOBAO_LINKS.length} Taobao + ${WEIDIAN_LINKS.length} Weidian)\n`);

  // Fetch all existing products from Supabase
  console.log("Fetching existing products from Supabase...");
  let allProducts = [];
  let from = 0;
  const PAGE_SIZE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id, source_link, name")
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      console.error("Error fetching products:", error.message);
      process.exit(1);
    }
    allProducts = allProducts.concat(data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  console.log(`Found ${allProducts.length} existing products in Supabase.\n`);

  // Build a set of existing item IDs for fast lookup
  const existingIds = new Set();
  for (const p of allProducts) {
    const id = extractItemId(p.source_link);
    if (id) existingIds.add(id);
  }

  // Determine which links are new
  const newLinks = [];
  const existingLinks = [];
  for (const link of ALL_LINKS) {
    const itemId = extractItemId(link);
    if (!itemId) {
      console.warn(`  Could not extract ID from: ${link}`);
      continue;
    }
    if (existingIds.has(itemId)) {
      existingLinks.push(link);
    } else {
      newLinks.push(link);
    }
  }

  console.log(`Already in database: ${existingLinks.length}`);
  console.log(`New to import:       ${newLinks.length}\n`);

  if (newLinks.length === 0) {
    console.log("Nothing to import. All links already exist in the database.");
    return;
  }

  // Build insert rows for new links
  const rows = newLinks.map((link) => {
    const itemId = extractItemId(link);
    const source = getSourceType(link);
    const label = source === "weidian" ? `Weidian #${itemId}` : `Taobao #${itemId}`;
    const name = `New Product (${label})`;
    return {
      name,
      brand: "Various",
      category: categorize(name),
      price_cny: null,
      price_usd: null,
      price_eur: null,
      tier: "mid",
      quality: null,
      source_link: link,
      image: "",
      images: [],
      variants: [],
      qc_photos: [],
      delivery_days: null,
      weight_g: null,
      dimensions: null,
      verified: false,
      qc_rating: null,
    };
  });

  // Insert in batches
  const BATCH_SIZE = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.from("products").insert(batch).select("id, name");

    if (error) {
      console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} error: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += data.length;
      for (const row of data) {
        console.log(`  Inserted [${row.id}] ${row.name}`);
      }
    }
  }

  console.log(`\n====================`);
  console.log(`Summary:`);
  console.log(`  Total links:     ${ALL_LINKS.length}`);
  console.log(`  Already existed: ${existingLinks.length}`);
  console.log(`  Inserted:        ${inserted}`);
  console.log(`  Errors:          ${errors}`);
  console.log(`Done.\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
