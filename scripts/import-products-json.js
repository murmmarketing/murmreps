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

// ── Tier logic ──
function getTier(price) {
  if (price < 200) return "budget";
  if (price <= 800) return "mid";
  return "premium";
}

// ── Build a DB row from a raw product ──
function buildRow(p) {
  return {
    name: p.name,
    brand: p.brand,
    category: p.category,
    price_cny: p.price,
    tier: getTier(p.price),
    quality: null,
    source_link: p.source_link,
    image: p.image_url || "",
    images: [],
    variants: [],
    qc_photos: [],
    verified: false,
    views: 0,
    likes: 0,
    dislikes: 0,
    collection: p.collection, // "girls" or "main" — use as-is
  };
}

// ── Main ──
async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("  MurmReps Products — Bulk Import from JSON");
  console.log("═══════════════════════════════════════════════\n");

  // Read JSON file (accept filename as CLI arg, default to products-import-data.json)
  const filename = process.argv[2] || "products-import-data.json";
  const jsonPath = path.join(__dirname, "..", filename);
  if (!fs.existsSync(jsonPath)) {
    console.error(`ERROR: ${filename} not found in project root`);
    process.exit(1);
  }

  const rawProducts = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const girlsInFile = rawProducts.filter((p) => p.collection === "girls").length;
  const mainInFile = rawProducts.filter((p) => p.collection === "main").length;

  console.log(`Loaded ${rawProducts.length} products from JSON`);
  console.log(`  girls: ${girlsInFile}  |  main: ${mainInFile}\n`);

  // Fetch ALL existing source_links to deduplicate
  console.log("Fetching existing products to check for duplicates...");
  let allExisting = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("source_link")
      .range(from, from + PAGE - 1);
    if (error) {
      console.error("Error fetching existing products:", error.message);
      process.exit(1);
    }
    allExisting = allExisting.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  const existingLinks = new Set(allExisting.map((p) => p.source_link));
  console.log(`Found ${existingLinks.size} existing products in DB\n`);

  // Filter out duplicates
  const newProducts = rawProducts.filter((p) => !existingLinks.has(p.source_link));
  const duplicateCount = rawProducts.length - newProducts.length;

  console.log(`Duplicates (skipped):   ${duplicateCount}`);
  console.log(`New products to insert: ${newProducts.length}\n`);

  if (newProducts.length === 0) {
    console.log("Nothing to insert — all products already exist.");
    await logTotals();
    return;
  }

  // Build rows
  const rows = newProducts.map(buildRow);

  // Insert in batches of 50
  const BATCH_SIZE = 50;
  let totalInserted = 0;
  let totalErrors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

    process.stdout.write(`Batch ${batchNum}/${totalBatches} (${batch.length} products)... `);

    const { data, error } = await supabase
      .from("products")
      .insert(batch)
      .select("id");

    if (error) {
      console.log(`ERROR: ${error.message}`);
      totalErrors += batch.length;
    } else {
      console.log(`OK — inserted ${data.length} rows`);
      totalInserted += data.length;
    }
  }

  // Summary
  console.log("\n═══════════════════════════════════════════════");
  console.log("  Import Summary");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Total in file:     ${rawProducts.length}`);
  console.log(`  Duplicates:        ${duplicateCount}`);
  console.log(`  Inserted:          ${totalInserted}`);
  console.log(`  Errors:            ${totalErrors}`);
  console.log("═══════════════════════════════════════════════\n");

  await logTotals();
}

async function logTotals() {
  // Total products
  const { count: total, error: e1 } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  // Girls collection
  const { count: girls, error: e2 } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("collection", "girls");

  // Main collection
  const { count: main, error: e3 } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("collection", "main");

  console.log("── Database Totals ──");
  if (!e1) console.log(`  All products:    ${total}`);
  if (!e2) console.log(`  Girls collection: ${girls}`);
  if (!e3) console.log(`  Main collection:  ${main}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
