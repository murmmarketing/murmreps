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

// ── BATCH 1 Taobao (49) ──
const BATCH1_TAOBAO = [
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

// ── BATCH 1 Weidian (72) ──
const BATCH1_WEIDIAN = [
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

// ── BATCH 2 Weidian (12) ──
const BATCH2_WEIDIAN = [
  "https://weidian.com/item.html?itemID=7706186958",
  "https://weidian.com/item.html?itemID=7703230565",
  "https://weidian.com/item.html?itemID=7706244156",
  "https://weidian.com/item.html?itemID=7699786851",
  "https://weidian.com/item.html?itemID=7699789471",
  "https://weidian.com/item.html?itemID=7699832877",
  "https://weidian.com/item.html?itemID=7699785475",
  "https://weidian.com/item.html?itemID=7699858453",
  "https://weidian.com/item.html?itemID=7702832606",
  "https://weidian.com/item.html?itemID=7699820971",
  "https://weidian.com/item.html?itemID=7707742238",
  "https://weidian.com/item.html?itemID=7637988659",
];

// ── BATCH 2 Taobao (27) ──
const BATCH2_TAOBAO = [
  "https://item.taobao.com/item.htm?id=999681405418",
  "https://item.taobao.com/item.htm?id=1027796229488",
  "https://item.taobao.com/item.htm?id=1017491952635",
  "https://item.taobao.com/item.htm?id=1015859366322",
  "https://item.taobao.com/item.htm?id=995539180130",
  "https://item.taobao.com/item.htm?id=982910837182",
  "https://item.taobao.com/item.htm?id=935491736893",
  "https://item.taobao.com/item.htm?id=774811167509",
  "https://item.taobao.com/item.htm?id=984909922022",
  "https://item.taobao.com/item.htm?id=954776229232",
  "https://item.taobao.com/item.htm?id=999622981485",
  "https://item.taobao.com/item.htm?id=1000342680634",
  "https://item.taobao.com/item.htm?id=937512516543",
  "https://item.taobao.com/item.htm?id=956164981061",
  "https://item.taobao.com/item.htm?id=999628361757",
  "https://item.taobao.com/item.htm?id=926664404732",
  "https://item.taobao.com/item.htm?id=1020115677223",
  "https://item.taobao.com/item.htm?id=926725646992",
  "https://item.taobao.com/item.htm?id=853082310039",
  "https://item.taobao.com/item.htm?id=990338653984",
  "https://item.taobao.com/item.htm?id=875817327936",
  "https://item.taobao.com/item.htm?id=1018954690969",
  "https://item.taobao.com/item.htm?id=1019513729426",
  "https://item.taobao.com/item.htm?id=1018854514005",
  "https://item.taobao.com/item.htm?id=978668539251",
  "https://item.taobao.com/item.htm?id=973054261026",
  "https://item.taobao.com/item.htm?id=931894801189",
  "https://item.taobao.com/item.htm?id=931284443860",
];

// ── Combine all links ──
const ALL_LINKS = [
  ...BATCH1_TAOBAO,
  ...BATCH1_WEIDIAN,
  ...BATCH2_WEIDIAN,
  ...BATCH2_TAOBAO,
];

// ── Extract item ID from a source link ──
function extractItemId(url) {
  if (!url) return null;
  const wdMatch = url.match(/itemI[Dd]=(\d+)/);
  if (wdMatch) return wdMatch[1];
  const tbMatch = url.match(/[?&]id=(\d+)/);
  if (tbMatch) return tbMatch[1];
  return null;
}

// ── Determine source type ──
function getSourceType(url) {
  if (url.includes("weidian.com")) return "Weidian";
  if (url.includes("taobao.com")) return "Taobao";
  return "Unknown";
}

// ── Main ──
async function main() {
  // Deduplicate by item ID
  const seen = new Set();
  const uniqueLinks = [];
  for (const link of ALL_LINKS) {
    const itemId = extractItemId(link);
    if (!itemId) continue;
    if (seen.has(itemId)) continue;
    seen.add(itemId);
    uniqueLinks.push(link);
  }

  console.log(`\nImport All Orders`);
  console.log(`==================`);
  console.log(`Raw links:    ${ALL_LINKS.length}`);
  console.log(`After dedup:  ${uniqueLinks.length}\n`);

  // Fetch ALL existing products from Supabase
  console.log("Fetching existing products from Supabase...");
  let allProducts = [];
  let from = 0;
  const PAGE_SIZE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id, source_link")
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

  // Build set of existing item IDs
  const existingIds = new Set();
  for (const p of allProducts) {
    const id = extractItemId(p.source_link);
    if (id) existingIds.add(id);
  }

  // Process each link
  let added = 0;
  let skipped = 0;
  const toInsert = [];

  for (let i = 0; i < uniqueLinks.length; i++) {
    const link = uniqueLinks[i];
    const itemId = extractItemId(link);
    const source = getSourceType(link);
    const counter = `[${i + 1}/${uniqueLinks.length}]`;

    if (existingIds.has(itemId)) {
      console.log(`${counter} Already exists: #${itemId}`);
      skipped++;
    } else {
      const name = `New Product (${source} #${itemId})`;
      toInsert.push({
        name,
        brand: "Various",
        category: "T-Shirts",
        tier: "mid",
        quality: null,
        price_cny: null,
        price_usd: null,
        price_eur: null,
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
      });
      console.log(`${counter} Added: ${name}`);
      added++;
    }
  }

  // Insert new products in batches
  let inserted = 0;
  let errors = 0;
  const BATCH_SIZE = 50;

  if (toInsert.length > 0) {
    console.log(`\nInserting ${toInsert.length} new products into Supabase...`);
    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const batch = toInsert.slice(i, i + BATCH_SIZE);
      const { data, error } = await supabase.from("products").insert(batch).select("id, name");
      if (error) {
        console.error(`  Batch error: ${error.message}`);
        errors += batch.length;
      } else {
        inserted += data.length;
        console.log(`  Inserted batch: ${data.length} products`);
      }
    }
  }

  console.log(`\n==================`);
  console.log(`Summary:`);
  console.log(`  Total unique links: ${uniqueLinks.length}`);
  console.log(`  Already existed:    ${skipped}`);
  console.log(`  Inserted:           ${inserted}`);
  console.log(`  Errors:             ${errors}`);
  console.log(`Done.\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
