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

async function extract() {
  let all = [];
  let offset = 0;
  while (true) {
    const { data } = await supabase.from("products").select("id, name").range(offset, offset + 999);
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 1000) break;
    offset += 1000;
  }

  console.log(`Scanning ${all.length} products for variant info...`);
  let updated = 0;

  for (const p of all) {
    const name = p.name || "";

    // Match: (12 colorways), (6 colors), (40+ styles), (3 variants), (10+ Colourways)
    const match = name.match(/\((\d+\+?)\s*(colorways?|colors?|colours?|colourways?|styles?|variants?|options?)\)/i);
    // Also match: (12+ Colourways) with special chars
    const match2 = !match ? name.match(/[（(](\d+\+?)\s*(colorways?|colors?|colours?|colourways?|styles?|variants?|options?)[)）]/i) : null;

    const m = match || match2;
    if (m) {
      const count = parseInt(m[1]);
      if (count > 1) {
        const cleanName = name.replace(m[0], "").replace(/\s+/g, " ").trim();

        await supabase
          .from("products")
          .update({ variant_count: count, name: cleanName })
          .eq("id", p.id);

        updated++;
        if (updated <= 30) console.log(`  "${name}" → "${cleanName}" (${count} variants)`);
      }
    }
  }

  if (updated > 30) console.log(`  ... and ${updated - 30} more`);
  console.log(`\nUpdated ${updated} products with variant counts`);
}

extract().catch(console.error);
