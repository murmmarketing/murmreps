const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8").split("\n").forEach((line) => {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) process.env[key.trim()] = vals.join("=").trim();
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function fetchTops() {
  let all = [], off = 0;
  while (true) {
    const { data } = await supabase.from("products").select("id,name,brand,category")
      .eq("category", "Tops").range(off, off + 999);
    if (!data || !data.length) break;
    all.push(...data);
    if (data.length < 1000) break;
    off += 1000;
  }
  return all;
}

async function batchUpdate(ids, updates, label) {
  if (!ids.length) return 0;
  let n = 0;
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const { error } = await supabase.from("products").update(updates).in("id", batch);
    if (error) console.error(`  ERR:`, error.message);
    else n += batch.length;
  }
  console.log(`  ${label}: ${n}`);
  return n;
}

const lo = (p) => (p.name || "").toLowerCase();
const has = (p, kw) => lo(p).includes(kw);

async function main() {
  const tops = await fetchTops();
  console.log(`Tops to fix: ${tops.length}\n`);
  let total = 0;
  const fixed = new Set();

  function classify(filterFn, category, label) {
    const ids = tops.filter(p => !fixed.has(p.id) && filterFn(p)).map(p => p.id);
    ids.forEach(id => fixed.add(id));
    return { ids, category, label };
  }

  const fixes = [];

  // ── SHOES ──
  // Known shoe model names, brand patterns
  fixes.push(classify(p => {
    const name = lo(p);
    const brand = (p.brand || "").toLowerCase();
    // Explicit shoe keywords
    if (has(p,"sneaker") || has(p,"shoe") || has(p,"boot") || has(p,"sandal") ||
        has(p,"slipper") || has(p,"loafer") || has(p,"trainer") || has(p,"slide") ||
        has(p,"heel") || has(p,"flat") || has(p,"mule") || has(p,"clog") ||
        has(p,"foam runner") || has(p,"foamposite")) return true;
    // Known shoe models
    if (/\b(dunk|jordan|air max|air force|tn|vomero|humara|p-6000|gt cut|kobe|lebron|gazelle|spezial|samba|campus|superstar|forum|ultra boost|futro|track|triple\s*s|3xl|x-pander|foam|bapesta|mac80|louboutin|golden goose|nocta hot step|b22|b23|b25|b27|b28|skate)\b/i.test(p.name)) return true;
    // Brand-only entries that are shoe brands in context
    if (/^(nike|adidas|jordan|dior|balenciaga|gucci|off.?white|alexander mcqueen|dolce|golden goose|prada)\s+(air|tn|sacai|acg|originals|x\s|track|triple|3xl|forum|campus|samba|gazelle|ultra|futro|court|p-6000)/i.test(p.name)) return true;
    // Specific product names
    if (/nocta hot step|nike tn|nike air\b|nike p-|nike x kobe|nike court|nike foamposite|nike acg air/i.test(p.name)) return true;
    if (/adidas (gazelle|spezial|samba|campus|superstar|forum|ultra|futro|originals)/i.test(p.name)) return true;
    if (/balenciaga (track|triple|3xl|x-pander|foam|defender)/i.test(p.name)) return true;
    if (/dior b\d{2}/i.test(p.name)) return true;
    if (/off.?white\b.*\b(be right back|ow)\b/i.test(p.name)) return true;
    if (/golden goose|dolce.*gabbana|louboutin low|alexander mcqueen|gucci mac/i.test(p.name)) return true;
    if (/nike nocta glide|christian louboutin|lv skate/i.test(p.name)) return true;
    return false;
  }, "Shoes", "Tops → Shoes"));

  // ── WATCHES ──
  fixes.push(classify(p => {
    return /rolex|cartier|patek philippe|audemars piguet|omega|longines|vacheron|iwc|franck muller|tissot|casio/i.test(p.name || p.brand);
  }, "Accessories", "Tops → Accessories (watches)"));

  // ── ELECTRONICS ──
  fixes.push(classify(p => {
    return /dyson|samsung|jbl|beats|earphone|earbuds|power adapter|pencil 2nd|battery pack|charging head|game.*machine|sm 7b|g\.h\.d|mar\.shall|bose/i.test(p.name);
  }, "Home & Decor", "Tops → Home & Decor (electronics)"));

  // ── PERFUMES ──
  fixes.push(classify(p => has(p, "perfume"), "Accessories", "Tops → Accessories (perfumes)"));

  // ── SETS (tracksuit sets, summer sets) ──
  fixes.push(classify(p => /\bset\b/i.test(p.name), "Outerwear", "Tops → Outerwear (sets)"));

  // ── HOME & DECOR ──
  fixes.push(classify(p => {
    return /carpet|rug|chair|sofa|cabinet|mug|bowl|tray|hamper|display|storage|fidget|banners|wine glass|chopstick|ornament|candle|door ?mat|crystal glass/i.test(p.name);
  }, "Home & Decor", "Tops → Home & Decor"));

  // ── BAGS ──
  fixes.push(classify(p => {
    return /\b(bag|backpack|tote|messenger|crossbody|keepall|duffle|briefcase|satchel)\b/i.test(p.name);
  }, "Bags", "Tops → Bags"));

  // ── WALLETS ──
  fixes.push(classify(p => {
    return /wallet|card\s*holder|card\s*case|cardholder/i.test(p.name);
  }, "Wallets", "Tops → Wallets"));

  // ── JEWELRY ──
  fixes.push(classify(p => {
    return /bracelet|necklace|earring|\bring\b|pendant|chain|choker/i.test(p.name) && !/keychain/i.test(p.name);
  }, "Jewelry", "Tops → Jewelry"));

  // ── ACCESSORIES (caps, belts, masks, glasses, ties, boxers, scarves) ──
  fixes.push(classify(p => {
    return /\b(cap|hat|beanie|belt|mask|glasses|sunglasses|tie|boxers|boxer|scarf|scarves|cigarette case|keychain|phone case|iphone|airpod)\b/i.test(p.name) ||
           /baseballkappe/i.test(p.name);
  }, "Accessories", "Tops → Accessories"));

  // ── BOTTOMS (denim, sweats, shorts) ──
  fixes.push(classify(p => {
    return /\b(denim|jeans|pants|shorts|sweats|sweatpant|trousers|jogger|cargo|bell-bottom|swimsuit)\b/i.test(p.name);
  }, "Bottoms", "Tops → Bottoms"));

  // ── OUTERWEAR (hoodies, jackets, leather) ──
  fixes.push(classify(p => {
    return /hoodie|hoode|jacket|coat|windbreaker|puffer|bomber|zip.?up|turtle\s*neck|racing suit|fur\b|lambskin|leather/i.test(p.name);
  }, "Outerwear", "Tops → Outerwear"));

  // ── SWEATERS ──
  fixes.push(classify(p => {
    return /sweater|cardigan|crewneck|knit|pullover/i.test(p.name);
  }, "Sweaters", "Tops → Sweaters"));

  // ── HOODIES ──
  fixes.push(classify(p => has(p, "hoodie") || has(p, "hoody"), "Hoodies", "Tops → Hoodies"));

  // ── SHIRTS (button-up, half-zip, polo, fitness top, crop top) ──
  fixes.push(classify(p => {
    return /button.?up|half.?zip|fitness top|crop|sportswear|lululemon/i.test(p.name);
  }, "Shirts", "Tops → Shirts"));

  // ── Remaining brand-only entries that are clearly shoes ──
  fixes.push(classify(p => {
    return /^(nike|bape|bapesta)\b/i.test(p.name) && !has(p, "set");
  }, "Shoes", "Tops → Shoes (brand-only Nike/Bape)"));

  // ── Remaining with "top" in name → T-Shirts ──
  fixes.push(classify(p => {
    return /\btop\b|apparel/i.test(p.name);
  }, "T-Shirts", "Tops → T-Shirts (generic tops)"));

  // ── Remaining Calvin Klein / underwear brands ──
  fixes.push(classify(p => {
    return /calvin klein|abercrombie|lululemon/i.test(p.name) || /calvin klein/i.test(p.brand);
  }, "Accessories", "Tops → Accessories (underwear brands)"));

  // Execute all fixes
  for (const { ids, category, label } of fixes) {
    total += await batchUpdate(ids, { category }, label);
  }

  // Check remaining
  const remaining = tops.filter(p => !fixed.has(p.id));
  console.log(`\nRemaining unfixed Tops: ${remaining.length}`);
  if (remaining.length > 0) {
    remaining.forEach(p => console.log(`  [${p.id}] ${p.brand} | ${(p.name||'').slice(0,60)}`));
  }

  // Final verification
  console.log("\n═══ FINAL DISTRIBUTION ═══\n");
  let all = [], off = 0;
  while (true) {
    const { data } = await supabase.from("products").select("category").range(off, off + 999);
    if (!data || !data.length) break;
    all.push(...data);
    if (data.length < 1000) break;
    off += 1000;
  }
  const cats = {};
  all.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
  Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`  ${cat.padEnd(20)} ${count}`);
  });

  console.log(`\n  TOTAL FIXED: ${total}`);
}

main().catch(console.error);
