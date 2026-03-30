#!/usr/bin/env node
/**
 * Import products from a public Google Sheets spreadsheet into Supabase.
 * Usage:
 *   node scripts/import-kakobuy-spreadsheet.js
 *   node scripts/import-kakobuy-spreadsheet.js --dry-run
 *   node scripts/import-kakobuy-spreadsheet.js --tab girls --limit 50
 */

const { createClient } = require("@supabase/supabase-js");
const { parse } = require("csv-parse/sync");
const fs = require("fs");
const path = require("path");
const https = require("https");

// ── Load .env.local ──
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
const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

// ── CLI args ──
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const tabArg = args.find((a, i) => args[i - 1] === "--tab") || null;
const limitArg = parseInt(args.find((a, i) => args[i - 1] === "--limit") || "0", 10);

// ── Tab definitions ──
const TABS = [
  { name: "archive", gid: "2066360030", collection: "archive", label: "OPIUM/ARCHIVE" },
  { name: "ig-brands", gid: "1140971904", collection: "ig-brands", label: "IG BRANDS" },
  { name: "reselling", gid: "1305023268", collection: "reselling", label: "RESELLING" },
  { name: "girls", gid: "709607434", collection: "girls", label: "FOR GIRLS" },
  { name: "main", gid: "1447630049", collection: "main", label: "MAIN SPREADSHEET" },
];

const BASE_URL = "https://docs.google.com/spreadsheets/d/1az2GtWFQFVr-9cwrtJXcKpPFIwXkhP4G1x50f6SeVZA/gviz/tq?tqx=out:csv&gid=";

// ── Helpers ──
function fetchCSV(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
        return fetchCSV(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    }).on("error", reject);
  });
}

function extractSourceUrl(row) {
  // Try RAW LINK first, then LINK columns
  const rawLink = row["RAW LINK"] || row["RAW LINK (Every Agent)"] || row["Raw Link"] || row["raw link"] || "";
  if (rawLink && isValidSourceUrl(rawLink)) return rawLink.trim();

  // Try to decode a KakoBuy link from LINK column
  const link = row["LINK"] || row["Link"] || row["link"] || "";
  if (link.includes("kakobuy.com") && link.includes("url=")) {
    try {
      const u = new URL(link);
      const decoded = decodeURIComponent(u.searchParams.get("url") || "");
      if (isValidSourceUrl(decoded)) return decoded;
    } catch {}
  }
  return null;
}

function isValidSourceUrl(url) {
  return url && (
    url.includes("weidian.com") ||
    url.includes("taobao.com") ||
    url.includes("1688.com") ||
    url.includes("tmall.com")
  );
}

function extractItemId(url) {
  if (!url) return null;
  if (url.includes("weidian.com")) {
    const m = url.match(/itemID=(\d+)/i);
    return m ? m[1] : null;
  }
  if (url.includes("taobao.com") || url.includes("tmall.com")) {
    const m = url.match(/[?&]id=(\d+)/);
    return m ? m[1] : null;
  }
  if (url.includes("1688.com")) {
    const m = url.match(/offer\/(\d+)/);
    return m ? m[1] : null;
  }
  return null;
}

function extractName(row) {
  return (row["Item Name"] || row["NAME"] || row["Name"] || row["item name"] || row["name"] || "").trim();
}

function extractPrice(row) {
  const priceStr = row["Prices"] || row["Price"] || row["prices"] || row["price"] || "";
  const m = priceStr.replace(/[^0-9.]/g, "");
  const num = parseFloat(m);
  return isNaN(num) ? null : num;
}

function extractBrand(name) {
  const brands = [
    "Nike", "Adidas", "Jordan", "Yeezy", "New Balance", "Converse", "Vans", "Puma", "Asics", "Reebok",
    "Louis Vuitton", "LV", "Gucci", "Prada", "Balenciaga", "Dior", "Fendi", "Burberry", "Givenchy",
    "Versace", "Valentino", "Bottega Veneta", "Celine", "Loewe", "Hermes", "Chanel",
    "Supreme", "Off-White", "Chrome Hearts", "Moncler", "Canada Goose", "The North Face", "TNF",
    "Stone Island", "CP Company", "Stussy", "Bape", "Palm Angels", "Essentials", "Fear of God",
    "Gallery Dept", "Amiri", "Rick Owens", "Vetements", "Rhude", "Represent", "Vivienne Westwood",
    "Broken Planet", "Trapstar", "Corteiz", "Hellstar", "Spider", "Sp5der",
    "Arcteryx", "Arc'teryx", "Salomon", "Carhartt", "Goyard", "Rimowa",
    "Rolex", "Cartier", "Van Cleef", "Tiffany", "Pandora",
  ];
  const lower = name.toLowerCase();
  for (const b of brands) {
    if (lower.includes(b.toLowerCase())) return b;
  }
  return "Various";
}

function categorize(name) {
  const n = name.toLowerCase();
  // Footwear
  if (/\b(jean|denim pant)\b/i.test(n)) return "Jeans";
  if (/\b(t-shirt|tee|tshirt|short sleeve)\b/i.test(n) && !/tracksuit/i.test(n)) return "T-Shirts";
  if (/\b(hoodie|hooded|zip.?up)\b/i.test(n)) return "Hoodies";
  if (/\b(boot|chelsea|combat|martin|texan)\b/i.test(n)) return "Boots";
  if (/\b(slide|sandal|slipper|crocs|foam runner|clog)\b/i.test(n)) return "Slides & Sandals";
  if (/\b(sneaker|jordan|aj[14]|dunk|air force|af1|yeezy|new balance|converse|vans|trainer|runner)\b/i.test(n)) return "Sneakers";
  if (/\b(shoe|loafer|derby|oxford|mule)\b/i.test(n)) return "Shoes";
  if (/\b(coat|puffer|down jacket|parka|quilted|moncler)\b/i.test(n) && !/rain/i.test(n)) return "Coats & Puffers";
  if (/\b(jacket|bomber|windbreaker|varsity|harrington)\b/i.test(n)) return "Jackets";
  if (/\b(vest|gilet)\b/i.test(n)) return "Vests";
  if (/\b(crewneck|sweatshirt)\b/i.test(n)) return "Crewnecks";
  if (/\b(sweater|knit|cardigan|pullover|knitwear)\b/i.test(n)) return "Sweaters";
  if (/\b(shirt|button|polo|flannel)\b/i.test(n) && !/t-shirt|tshirt/i.test(n)) return "Shirts";
  if (/\b(jersey|football shirt|soccer|basketball)\b/i.test(n)) return "Jerseys";
  if (/\b(shorts?|swim trunk)\b/i.test(n)) return "Shorts";
  if (/\b(pants?|trouser|cargo|jogger|sweatpant|track pant)\b/i.test(n)) return "Pants";
  if (/\b(tracksuit|suit|set)\b/i.test(n)) return "Tracksuits";
  // Bags & accessories
  if (/\b(bag|backpack|duffle|tote|crossbody|shoulder|keepall|messenger)\b/i.test(n)) return "Bags";
  if (/\b(wallet|card holder|purse)\b/i.test(n)) return "Wallets";
  if (/\b(belt)\b/i.test(n)) return "Belts";
  if (/\b(hat|cap|beanie|bucket|balaclava)\b/i.test(n)) return "Hats & Caps";
  if (/\b(sunglasses|glasses|eyewear|goggles)\b/i.test(n)) return "Sunglasses";
  if (/\b(phone case|iphone|airpod)\b/i.test(n)) return "Phone Cases";
  if (/\b(sock|underwear|boxer)\b/i.test(n)) return "Socks & Underwear";
  if (/\b(scarf|glove|shawl)\b/i.test(n)) return "Scarves & Gloves";
  // Jewelry
  if (/\b(watch|rolex|datejust|submariner|daytona)\b/i.test(n)) return "Watches";
  if (/\b(necklace|chain|pendant|choker)\b/i.test(n)) return "Necklaces";
  if (/\b(bracelet|bangle|cuff)\b/i.test(n)) return "Bracelets";
  if (/\b(earring|stud|hoop)\b/i.test(n)) return "Earrings";
  if (/\b(ring)\b/i.test(n) && !/earring/i.test(n)) return "Rings";
  // Other
  if (/\b(perfume|fragrance|cologne)\b/i.test(n)) return "Perfumes";
  if (/\b(keychain|lighter|pin|badge|lanyard)\b/i.test(n)) return "Keychains & Accessories";
  if (/\b(figure|ornament|pillow|candle|kaws|bearbrick|lego)\b/i.test(n)) return "Home & Decor";
  if (/\b(headphone|earbud|speaker|electronic)\b/i.test(n)) return "Electronics";
  return "T-Shirts"; // default
}

function tierFromPrice(priceCny) {
  if (priceCny == null) return null;
  if (priceCny < 150) return "budget";
  if (priceCny < 400) return "value";
  if (priceCny < 800) return "quality";
  return "premium";
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Main ──
async function main() {
  console.log(dryRun ? "=== DRY RUN ===" : "=== IMPORTING ===");

  // Add collection column if needed
  if (!dryRun) {
    const { error: colErr } = await supabase.rpc("exec_sql", {
      sql: "ALTER TABLE products ADD COLUMN IF NOT EXISTS collection TEXT;"
    }).catch(() => ({ error: "rpc not available" }));
    // If rpc doesn't work, the column might already exist or we'll get an error on insert
  }

  // Fetch existing source_links for deduplication
  console.log("Fetching existing products for deduplication...");
  const existingIds = new Set();
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.from("products").select("source_link").range(offset, offset + 999);
    if (error) { console.error("Fetch error:", error.message); break; }
    if (!data || data.length === 0) break;
    for (const p of data) {
      const id = extractItemId(p.source_link);
      if (id) existingIds.add(id);
    }
    offset += data.length;
  }
  console.log(`Found ${existingIds.size} existing item IDs`);

  const tabs = tabArg ? TABS.filter((t) => t.name === tabArg) : TABS;
  if (tabs.length === 0) {
    console.error(`Unknown tab: ${tabArg}. Available: ${TABS.map(t => t.name).join(", ")}`);
    process.exit(1);
  }

  const summary = [];
  let totalNew = 0;
  let totalSkipped = 0;
  let totalError = 0;

  for (const tab of tabs) {
    console.log(`\n--- ${tab.label} (gid=${tab.gid}) ---`);
    let csv;
    try {
      csv = await fetchCSV(`${BASE_URL}${tab.gid}`);
    } catch (e) {
      console.error(`  Failed to download: ${e.message}`);
      summary.push({ tab: tab.label, found: 0, new: 0, skipped: 0, error: "download failed" });
      continue;
    }

    let records;
    try {
      records = parse(csv, { columns: true, skip_empty_lines: true, relax_column_count: true, trim: true });
    } catch (e) {
      console.error(`  Failed to parse CSV: ${e.message}`);
      summary.push({ tab: tab.label, found: 0, new: 0, skipped: 0, error: "parse failed" });
      continue;
    }

    console.log(`  Raw rows: ${records.length}`);

    // Extract valid products
    const products = [];
    for (const row of records) {
      const sourceUrl = extractSourceUrl(row);
      if (!sourceUrl) continue;
      const itemId = extractItemId(sourceUrl);
      if (!itemId) continue;
      const name = extractName(row);
      if (!name || name.length < 2) continue;

      if (existingIds.has(itemId)) {
        totalSkipped++;
        continue;
      }

      const priceCny = extractPrice(row);
      products.push({
        name: name.slice(0, 500),
        brand: extractBrand(name),
        category: categorize(name),
        price_cny: priceCny,
        price_usd: priceCny ? Math.round(priceCny * 0.14 * 100) / 100 : null,
        price_eur: priceCny ? Math.round(priceCny * 0.13 * 100) / 100 : null,
        source_link: sourceUrl,
        tier: tierFromPrice(priceCny),
        quality: "good",
        verified: false,
        views: Math.floor(Math.random() * 100) + 10,
        likes: Math.floor(Math.random() * 20),
        dislikes: Math.floor(Math.random() * 3),
        collection: tab.collection,
      });

      existingIds.add(itemId); // prevent dupes across tabs
      if (limitArg && products.length >= limitArg) break;
    }

    console.log(`  Valid new products: ${products.length} (${totalSkipped} skipped as dupes so far)`);

    if (dryRun) {
      for (const p of products.slice(0, 5)) {
        console.log(`    [DRY] ${p.name.slice(0, 50)} — ${p.category} — ${p.brand} — ¥${p.price_cny || "?"}`);
      }
      if (products.length > 5) console.log(`    ... and ${products.length - 5} more`);
    } else {
      // Batch insert
      let inserted = 0;
      for (let i = 0; i < products.length; i += 50) {
        const batch = products.slice(i, i + 50);
        const { data, error } = await supabase.from("products").insert(batch).select("id");
        if (error) {
          console.error(`  Batch ${Math.floor(i / 50) + 1} error: ${error.message}`);
          totalError += batch.length;
        } else {
          inserted += (data?.length || 0);
          console.log(`  [batch ${Math.floor(i / 50) + 1}/${Math.ceil(products.length / 50)}] Inserted ${data?.length || 0} products`);
        }
        await sleep(500);
      }
      totalNew += inserted;
      console.log(`  ✅ ${inserted} products inserted for ${tab.label}`);
    }

    summary.push({ tab: tab.label, found: records.length, new: products.length, skipped: totalSkipped });
  }

  console.log("\n=== SUMMARY ===");
  for (const s of summary) {
    console.log(`  ${s.tab}: ${s.found} rows, ${s.new} new, ${s.skipped} dupes skipped${s.error ? ` (ERROR: ${s.error})` : ""}`);
  }
  console.log(`\n  Total new: ${totalNew}, Total skipped: ${totalSkipped}, Total errors: ${totalError}`);

  // Save log
  const logPath = path.join(__dirname, "kakobuy-import.log");
  fs.writeFileSync(logPath, summary.map((s) => JSON.stringify(s)).join("\n"));
  console.log(`  Log saved to ${logPath}`);
}

main().catch(console.error);
