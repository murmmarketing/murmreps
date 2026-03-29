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

async function fetchAll() {
  let all = [], off = 0;
  while (true) {
    const { data } = await supabase.from("products").select("id,name,brand,category").range(off, off + 999);
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
    if (error) console.error(`  ERR (${label}):`, error.message);
    else n += batch.length;
  }
  if (n > 0) console.log(`  ${label}: ${n}`);
  return n;
}

const lo = (p) => (p.name || "").toLowerCase();
const br = (p) => (p.brand || "").toLowerCase();

async function main() {
  const all = await fetchAll();
  console.log(`Total products: ${all.length}\n`);
  let total = 0;
  const moved = new Set();

  function reclassify(source, filterFn, newCat, label) {
    const ids = source.filter(p => !moved.has(p.id) && filterFn(p)).map(p => p.id);
    ids.forEach(id => moved.add(id));
    return { ids, category: newCat, label };
  }

  const fixes = [];

  // ══════════════════════════════════════════
  // SPLIT ACCESSORIES → granular categories
  // ══════════════════════════════════════════
  const acc = all.filter(p => p.category === "Accessories");
  console.log(`═══ Splitting Accessories (${acc.length}) ═══`);

  // Watches
  fixes.push(reclassify(acc, p => {
    return /rolex|cartier|patek|audemars|omega|longines|vacheron|iwc|franck muller|tissot|casio|richard mille|hublot|breitling|\bwatch\b/i.test(lo(p) + ' ' + br(p));
  }, "Watches", "Accessories → Watches"));

  // Sunglasses
  fixes.push(reclassify(acc, p => {
    return /sunglass|sun\s*glass/i.test(lo(p));
  }, "Sunglasses", "Accessories → Sunglasses"));

  // Glasses / Eyewear (non-sun)
  fixes.push(reclassify(acc, p => {
    return /\bglasses\b|eyewear|optical/i.test(lo(p));
  }, "Glasses", "Accessories → Glasses"));

  // Hats & Caps
  fixes.push(reclassify(acc, p => {
    return /\bcap\b|baseball.*cap|baseballkappe|bucket\s*hat|\bhat\b|\bbeanie\b|fitted|snapback|balaclava|ski\s*mask/i.test(lo(p));
  }, "Hats & Caps", "Accessories → Hats & Caps"));

  // Belts
  fixes.push(reclassify(acc, p => {
    return /\bbelt\b|grtel/i.test(lo(p));
  }, "Belts", "Accessories → Belts"));

  // Scarves & Gloves
  fixes.push(reclassify(acc, p => {
    return /\bscarf\b|scarves|shawl|\bgloves?\b/i.test(lo(p));
  }, "Scarves & Gloves", "Accessories → Scarves & Gloves"));

  // Socks & Underwear
  fixes.push(reclassify(acc, p => {
    return /\bsocks?\b|\bboxer\b|\bunderwear\b|\bbriefs?\b|\bcalvin klein\b|abercrombie/i.test(lo(p) + ' ' + br(p));
  }, "Socks & Underwear", "Accessories → Socks & Underwear"));

  // Phone Cases
  fixes.push(reclassify(acc, p => {
    return /phone\s*case|iphone|airpod/i.test(lo(p));
  }, "Phone Cases", "Accessories → Phone Cases"));

  // Keychains
  fixes.push(reclassify(acc, p => {
    return /keychain|key\s*ring|key\s*holder|key\s*fob/i.test(lo(p));
  }, "Keychains", "Accessories → Keychains"));

  // Perfumes
  fixes.push(reclassify(acc, p => {
    return /perfume|cologne|fragrance|parfum/i.test(lo(p));
  }, "Perfumes", "Accessories → Perfumes"));

  // Ties
  fixes.push(reclassify(acc, p => {
    return /\btie\b|\bties\b|bow\s*tie|necktie/i.test(lo(p));
  }, "Ties", "Accessories → Ties"));

  // Masks (face masks, not ski masks - those are hats)
  fixes.push(reclassify(acc, p => {
    return /\bmask\b/i.test(lo(p));
  }, "Masks", "Accessories → Masks"));

  // Remaining Accessories stay as Accessories (catch-all for misc)

  // ══════════════════════════════════════════
  // SPLIT JEWELRY → granular categories
  // ══════════════════════════════════════════
  const jew = all.filter(p => p.category === "Jewelry");
  console.log(`═══ Splitting Jewelry (${jew.length}) ═══`);

  // Necklaces & Pendants
  fixes.push(reclassify(jew, p => {
    return /necklace|pendant|\bchain\b|choker/i.test(lo(p));
  }, "Necklaces", "Jewelry → Necklaces"));

  // Bracelets
  fixes.push(reclassify(jew, p => {
    return /bracelet/i.test(lo(p));
  }, "Bracelets", "Jewelry → Bracelets"));

  // Earrings
  fixes.push(reclassify(jew, p => {
    return /earring/i.test(lo(p));
  }, "Earrings", "Jewelry → Earrings"));

  // Rings
  fixes.push(reclassify(jew, p => {
    return /\bring\b|\brings\b/i.test(lo(p));
  }, "Rings", "Jewelry → Rings"));

  // Remaining Jewelry stays as Jewelry

  // ══════════════════════════════════════════
  // SPLIT SHOES → granular categories
  // ══════════════════════════════════════════
  const shoes = all.filter(p => p.category === "Shoes");
  console.log(`═══ Splitting Shoes (${shoes.length}) ═══`);

  // Boots
  fixes.push(reclassify(shoes, p => {
    return /\bboot\b|\bboots\b|tiempo|mercurial|predator|copa\b/i.test(lo(p));
  }, "Boots", "Shoes → Boots"));

  // Slides & Sandals & Slippers
  fixes.push(reclassify(shoes, p => {
    return /\bslide\b|\bslides\b|\bsandal|\bslipper|\bflip\s*flop|\bmule\b|\bclog\b|crocs/i.test(lo(p));
  }, "Slides & Sandals", "Shoes → Slides & Sandals"));

  // Sneakers (everything else is basically sneakers, but tag explicitly)
  fixes.push(reclassify(shoes, p => {
    return /sneaker|trainer|dunk|jordan|air\s*(max|force)|yeezy|foam\s*runner|samba|gazelle|spezial|campus|superstar|forum|ultra\s*boost|new\s*balance|nb\s*\d|bapesta|triple\s*s|3xl|track\b|speedcat|salomon/i.test(lo(p));
  }, "Sneakers", "Shoes → Sneakers"));

  // Remaining Shoes stay as Shoes (loafers, dress shoes, generic)

  // ══════════════════════════════════════════
  // SPLIT BOTTOMS → granular categories
  // ══════════════════════════════════════════
  const bot = all.filter(p => p.category === "Bottoms");
  console.log(`═══ Splitting Bottoms (${bot.length}) ═══`);

  // Jeans
  fixes.push(reclassify(bot, p => {
    return /\bjeans?\b|\bdenim\b/i.test(lo(p));
  }, "Jeans", "Bottoms → Jeans"));

  // Shorts
  fixes.push(reclassify(bot, p => {
    return /\bshorts?\b/i.test(lo(p));
  }, "Shorts", "Bottoms → Shorts"));

  // Sweatpants / Joggers
  fixes.push(reclassify(bot, p => {
    return /sweatpant|jogger/i.test(lo(p));
  }, "Sweatpants", "Bottoms → Sweatpants"));

  // Remaining Bottoms stay as Pants
  fixes.push(reclassify(bot, p => {
    return /pant|trouser|cargo|wide.?leg|裤/i.test(lo(p));
  }, "Pants", "Bottoms → Pants"));

  // ══════════════════════════════════════════
  // SPLIT OUTERWEAR → granular categories
  // ══════════════════════════════════════════
  const ow = all.filter(p => p.category === "Outerwear");
  console.log(`═══ Splitting Outerwear (${ow.length}) ═══`);

  // Tracksuits
  fixes.push(reclassify(ow, p => {
    return /tracksuit|track\s*suit|\bset\b|sweatsuit/i.test(lo(p));
  }, "Tracksuits", "Outerwear → Tracksuits"));

  // Jackets
  fixes.push(reclassify(ow, p => {
    return /\bjacket\b|bomber|windbreaker|varsity|flight\b|blouson/i.test(lo(p));
  }, "Jackets", "Outerwear → Jackets"));

  // Coats & Puffers
  fixes.push(reclassify(ow, p => {
    return /\bcoat\b|puffer|parka|down\s*jacket|fur\b|wool\b|trench/i.test(lo(p));
  }, "Coats & Puffers", "Outerwear → Coats & Puffers"));

  // Vests
  fixes.push(reclassify(ow, p => {
    return /\bvest\b|\bgilet\b/i.test(lo(p));
  }, "Vests", "Outerwear → Vests"));

  // Zip-ups / Hoodies that ended up in Outerwear → move to Hoodies
  fixes.push(reclassify(ow, p => {
    return /hoodie|hoody|hooded|zip\s*up|zip-up|full\s*zip/i.test(lo(p));
  }, "Hoodies", "Outerwear → Hoodies"));

  // Leather jackets (specific sub)
  fixes.push(reclassify(ow, p => {
    return /leather|lambskin|deer.?leather/i.test(lo(p));
  }, "Jackets", "Outerwear leather → Jackets"));

  // Remaining Outerwear stays as Outerwear

  // ══════════════════════════════════════════
  // SPLIT HOME & DECOR → granular categories
  // ══════════════════════════════════════════
  const home = all.filter(p => p.category === "Home & Decor");
  console.log(`═══ Splitting Home & Decor (${home.length}) ═══`);

  // Electronics
  fixes.push(reclassify(home, p => {
    return /dyson|samsung|jbl|beats|earphone|earbuds|speaker|boombox|headphone|charger|char\.ger|adapter|memory\s*card|bose|marshall|mar\.shall|sm\s*7b|ipod|i\s*pod|tour\s*pro/i.test(lo(p));
  }, "Electronics", "Home & Decor → Electronics"));

  // Watches that ended up in Home
  fixes.push(reclassify(home, p => {
    return /cartier.*watch|watch/i.test(lo(p));
  }, "Watches", "Home & Decor → Watches"));

  // Tracksuits that ended up in Home
  fixes.push(reclassify(home, p => {
    return /tracksuit|track\s*suit/i.test(lo(p));
  }, "Tracksuits", "Home & Decor → Tracksuits"));

  // Remaining Home & Decor stays

  // ══════════════════════════════════════════
  // SPLIT SWEATERS → add Crewnecks
  // ══════════════════════════════════════════
  const sw = all.filter(p => p.category === "Sweaters");
  console.log(`═══ Splitting Sweaters (${sw.length}) ═══`);

  fixes.push(reclassify(sw, p => {
    return /crewneck|crew\s*neck|crewnwck/i.test(lo(p));
  }, "Crewnecks", "Sweaters → Crewnecks"));

  // ══════════════════════════════════════════
  // T-SHIRTS: split out Jerseys, Tank Tops
  // ══════════════════════════════════════════
  const ts = all.filter(p => p.category === "T-Shirts");
  console.log(`═══ Splitting T-Shirts (${ts.length}) ═══`);

  // Jerseys
  fixes.push(reclassify(ts, p => {
    return /jersey|football.*team|soccer.*shirt|basketball.*shirt/i.test(lo(p));
  }, "Jerseys", "T-Shirts → Jerseys"));

  // Tank Tops
  fixes.push(reclassify(ts, p => {
    return /tank\s*top|sleeveless|vest.*top/i.test(lo(p));
  }, "Tank Tops", "T-Shirts → Tank Tops"));

  // Long Sleeves
  fixes.push(reclassify(ts, p => {
    return /long\s*sleeve|longsleeve/i.test(lo(p));
  }, "Long Sleeves", "T-Shirts → Long Sleeves"));

  // Polos (might be in Shirts too)
  fixes.push(reclassify(ts, p => {
    return /\bpolo\b/i.test(lo(p));
  }, "Polos", "T-Shirts → Polos"));

  // Also split Polos from Shirts
  const sh = all.filter(p => p.category === "Shirts");
  fixes.push(reclassify(sh, p => {
    return /\bpolo\b/i.test(lo(p));
  }, "Polos", "Shirts → Polos"));

  // ══════════════════════════════════════════
  // Execute all fixes
  // ══════════════════════════════════════════
  console.log("\n═══ Executing updates ═══\n");

  for (const { ids, category, label } of fixes) {
    total += await batchUpdate(ids, { category }, label);
  }

  // ══════════════════════════════════════════
  // Final verification
  // ══════════════════════════════════════════
  console.log("\n═══ FINAL DISTRIBUTION ═══\n");
  const final = await fetchAll();
  const cats = {};
  final.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
  Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`  ${cat.padEnd(22)} ${count}`);
  });
  console.log(`\n  CATEGORIES: ${Object.keys(cats).length}`);
  console.log(`  TOTAL MOVED: ${total}`);
  console.log(`  TOTAL PRODUCTS: ${final.length}`);
}

main().catch(console.error);
