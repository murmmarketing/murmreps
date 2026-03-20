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

async function main() {
  let allProducts = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .range(from, from + PAGE - 1)
      .order("id");
    if (error) { console.error("Error:", error.message); break; }
    if (!data || data.length === 0) break;
    allProducts = allProducts.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  console.log(`Fetched ${allProducts.length} products from Supabase`);

  const outPath = path.join(__dirname, "..", "src", "data", "products.json");
  fs.writeFileSync(outPath, JSON.stringify(allProducts, null, 2));
  console.log(`Written to ${outPath}`);
}

main().catch(console.error);
