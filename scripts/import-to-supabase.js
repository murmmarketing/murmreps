const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load env from .env.local
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
envContent.split("\n").forEach((line) => {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) {
    process.env[key.trim()] = vals.join("=").trim();
  }
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

async function main() {
  const productsPath = path.join(__dirname, "..", "src", "data", "products.json");
  const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));

  console.log(`Importing ${products.length} products to Supabase...`);

  const BATCH_SIZE = 100;
  let imported = 0;
  let errors = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE).map((p) => ({
      name: p.name || "Untitled",
      brand: p.brand || "Various",
      category: p.category || "Shoes",
      price_cny: p.price_cny || null,
      price_usd: p.price_usd || null,
      price_eur: p.price_eur || null,
      tier: p.tier || null,
      quality: p.quality || null,
      source_link: p.source_link || "",
      image: p.image || "",
      images: p.images || [],
      variants: p.variants || [],
      qc_photos: p.qc_photos || [],
      delivery_days: p.delivery_days || null,
      weight_g: p.weight_g || null,
      dimensions: p.dimensions || null,
      verified: p.verified || false,
      qc_rating: p.qc_rating || null,
    }));

    const { error } = await supabase.from("products").insert(batch);

    if (error) {
      console.error(`[${i + batch.length}/${products.length}] ERROR: ${error.message}`);
      errors += batch.length;
    } else {
      imported += batch.length;
      console.log(`[${imported}/${products.length}] imported...`);
    }
  }

  console.log(`\nDone! ${imported} imported, ${errors} errors.`);
}

main().catch(console.error);
