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
const products = require("./batch11-reddit.json");

async function importBatch() {
  let imported = 0, skipped = 0, errors = 0;

  for (const p of products) {
    // Check for duplicate source_link
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("source_link", p.source_link)
      .limit(1);

    if (existing && existing.length > 0) {
      skipped++;
      continue;
    }

    const tier = p.price < 150 ? "budget" : p.price < 400 ? "value" : p.price < 800 ? "quality" : "premium";

    const { error } = await supabase.from("products").insert({
      name: p.name,
      brand: p.brand,
      category: p.category,
      price_cny: p.price,
      source_link: p.source_link,
      collection: "main",
      tier,
    });

    if (error) {
      console.error(`Error: ${p.name}`, error.message);
      errors++;
    } else {
      imported++;
    }
  }

  console.log(`Imported: ${imported}, Skipped (dupes): ${skipped}, Errors: ${errors}, Total: ${products.length}`);
}

importBatch();
