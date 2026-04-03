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

async function dedup() {
  console.log("Fetching all products with images...");

  let allProducts = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, brand, category, price_cny, image, score, views")
      .not("image", "is", null)
      .neq("image", "")
      .range(offset, offset + 999);
    if (error) { console.error(error); break; }
    if (!data || data.length === 0) break;
    allProducts = allProducts.concat(data);
    if (data.length < 1000) break;
    offset += 1000;
  }

  console.log(`Total products with images: ${allProducts.length}`);

  // Group by normalized image URL
  const imageGroups = {};
  for (const p of allProducts) {
    let norm = (p.image || "").trim().toLowerCase();
    try {
      const url = new URL(norm.startsWith("//") ? "https:" + norm : norm);
      url.searchParams.delete("_");
      url.searchParams.delete("t");
      url.searchParams.delete("v");
      url.searchParams.delete("w");
      url.searchParams.delete("h");
      norm = url.origin + url.pathname;
    } catch {
      // use as-is
    }
    if (!imageGroups[norm]) imageGroups[norm] = [];
    imageGroups[norm].push(p);
  }

  const duplicateGroups = Object.entries(imageGroups).filter(([, prods]) => prods.length > 1);
  console.log(`\nDuplicate image groups: ${duplicateGroups.length}`);

  let totalDuplicates = 0;
  let totalToDelete = 0;
  const idsToDelete = [];
  let logCount = 0;

  for (const [, products] of duplicateGroups) {
    products.sort((a, b) => {
      const pa = parseFloat(a.price_cny) || 99999;
      const pb = parseFloat(b.price_cny) || 99999;
      if (pa !== pb) return pa - pb;
      const sa = (a.score || 0) + (a.views || 0);
      const sb = (b.score || 0) + (b.views || 0);
      return sb - sa;
    });

    const keep = products[0];
    const dupes = products.slice(1);

    totalDuplicates += products.length;
    totalToDelete += dupes.length;

    if (logCount < 50) {
      console.log(`\n--- Group (${products.length} items) ---`);
      console.log(`  KEEP: "${keep.name}" | ${keep.brand} | ¥${keep.price_cny} | views:${keep.views || 0} | id:${keep.id}`);
      for (const d of dupes) {
        console.log(`  DEL:  "${d.name}" | ${d.brand} | ¥${d.price_cny} | views:${d.views || 0} | id:${d.id}`);
      }
      logCount++;
    }

    for (const d of dupes) idsToDelete.push(d.id);
  }

  if (logCount < duplicateGroups.length) {
    console.log(`\n... and ${duplicateGroups.length - logCount} more groups`);
  }

  console.log("\n========== SUMMARY ==========");
  console.log(`Products scanned: ${allProducts.length}`);
  console.log(`Duplicate groups: ${duplicateGroups.length}`);
  console.log(`Products in dupe groups: ${totalDuplicates}`);
  console.log(`To DELETE: ${totalToDelete}`);
  console.log(`To KEEP (cheapest): ${duplicateGroups.length}`);
  console.log(`Unchanged: ${allProducts.length - totalDuplicates}`);

  // Delete in batches
  console.log(`\nDeleting ${idsToDelete.length} duplicates...`);
  let deleted = 0;
  for (let i = 0; i < idsToDelete.length; i += 100) {
    const batch = idsToDelete.slice(i, i + 100);
    const { error } = await supabase.from("products").delete().in("id", batch);
    if (error) console.error(`Batch error:`, error.message);
    else deleted += batch.length;
    if (deleted % 500 === 0 && deleted > 0) console.log(`  ...deleted ${deleted}/${idsToDelete.length}`);
  }

  const { count } = await supabase.from("products").select("id", { count: "exact", head: true });
  console.log(`\nDone! Deleted: ${deleted} | Products remaining: ${count}`);
}

dedup().catch(console.error);
