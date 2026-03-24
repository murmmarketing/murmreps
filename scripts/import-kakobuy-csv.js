#!/usr/bin/env node
/**
 * Import products from local CSV files (exported from KakoBuy spreadsheet) into Supabase.
 * Usage:
 *   node scripts/import-kakobuy-csv.js --dry-run
 *   node scripts/import-kakobuy-csv.js --tab girls --limit 10
 *   node scripts/import-kakobuy-csv.js
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// ── Load .env.local ──
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

// ── CLI args ──
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const tabArg = args.find((_, i) => args[i - 1] === "--tab") || null;
const limitArg = parseInt(args.find((_, i) => args[i - 1] === "--limit") || "0", 10);

// ── Tab definitions ──
const TABS = [
  { name: "archive", file: "opium.csv", collection: "archive", label: "OPIUM/ARCHIVE" },
  { name: "ig-brands", file: "ig-brands.csv", collection: "ig-brands", label: "IG BRANDS" },
  { name: "reselling", file: "reselling.csv", collection: "reselling", label: "RESELLING" },
  { name: "girls", file: "girls.csv", collection: "girls", label: "FOR GIRLS" },
  { name: "main", file: "main.csv", collection: "main", label: "MAIN" },
];

// ── Simple CSV parser (handles quoted fields with commas) ──
function parseCSV(text) {
  const rows = [];
  let current = "";
  let inQuotes = false;
  const lines = text.split("\n");
  for (const line of lines) {
    if (inQuotes) {
      current += "\n" + line;
      if ((line.match(/"/g) || []).length % 2 === 1) {
        inQuotes = false;
        rows.push(parseLine(current));
        current = "";
      }
    } else {
      const quoteCount = (line.match(/"/g) || []).length;
      if (quoteCount % 2 === 1) {
        inQuotes = true;
        current = line;
      } else {
        rows.push(parseLine(line));
      }
    }
  }
  return rows;
}

function parseLine(line) {
  const fields = [];
  let field = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { field += '"'; i++; }
      else inQ = !inQ;
    } else if (c === "," && !inQ) {
      fields.push(field.trim());
      field = "";
    } else {
      field += c;
    }
  }
  fields.push(field.trim());
  return fields;
}

// ── URL helpers ──
function isValidSourceUrl(url) {
  return url && (url.includes("weidian.com") || url.includes("taobao.com") || url.includes("1688.com"));
}

function cleanSourceUrl(url) {
  if (!url) return null;
  let u = url.trim();
  // Strip spider_token, affcode
  u = u.replace(/&spider_token=[^&]*/gi, "");
  u = u.replace(/&affcode=[^&]*/gi, "");
  u = u.replace(/\s+/g, "");
  return u;
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

// ── Find column index by partial header match ──
function findCol(headers, ...keywords) {
  const lower = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9 ]/g, ""));
  for (const kw of keywords) {
    const idx = lower.findIndex((h) => h.includes(kw.toLowerCase()));
    if (idx >= 0) return idx;
  }
  return -1;
}

// ── Brand extraction ──
const BRANDS = [
  "Nike", "Adidas", "Jordan", "Yeezy", "New Balance", "Converse", "Vans", "Puma", "Asics", "Reebok",
  "Louis Vuitton", "LV", "Gucci", "Prada", "Balenciaga", "Dior", "Fendi", "Burberry", "Givenchy",
  "Versace", "Valentino", "Bottega Veneta", "Celine", "Loewe", "Hermes", "Chanel",
  "Supreme", "Off-White", "Chrome Hearts", "Moncler", "Canada Goose", "The North Face", "TNF",
  "Stone Island", "CP Company", "Stussy", "Bape", "Palm Angels", "Essentials", "Fear of God",
  "Gallery Dept", "Amiri", "Rick Owens", "Vetements", "Rhude", "Represent", "Vivienne Westwood",
  "Broken Planet", "Trapstar", "Corteiz", "Hellstar", "Spider", "Sp5der",
  "Arcteryx", "Arc'teryx", "Salomon", "Carhartt", "Goyard", "Rimowa", "Maison Margiela",
  "Rolex", "Cartier", "Van Cleef", "Tiffany", "Pandora",
];

function extractBrand(name) {
  const lower = name.toLowerCase();
  for (const b of BRANDS) {
    if (lower.includes(b.toLowerCase())) return b;
  }
  return "Various";
}

// ── Categorization ──
function categorize(name) {
  const n = name.toLowerCase();
  if (/\b(jean|denim pant)/i.test(n)) return "Jeans";
  if (/\b(t-shirt|tee\b|tshirt|short sleeve)/i.test(n) && !/tracksuit/i.test(n)) return "T-Shirts";
  if (/\b(hoodie|hoody|hooded|zip.?up)/i.test(n)) return "Hoodies";
  if (/\b(boot|chelsea|combat|texan)/i.test(n)) return "Boots";
  if (/\b(slide|sandal|slipper|crocs|foam runner|clog)/i.test(n)) return "Slides & Sandals";
  if (/\b(sneaker|jordan|aj[14]|dunk|air force|af1|yeezy|new balance|converse|vans|trainer|runner|air max)/i.test(n)) return "Sneakers";
  if (/\b(shoe|loafer|derby|oxford|mule)/i.test(n)) return "Shoes";
  if (/\b(coat|puffer|down jacket|parka|quilted)/i.test(n)) return "Coats & Puffers";
  if (/\b(jacket|bomber|windbreaker|varsity)/i.test(n)) return "Jackets";
  if (/\b(vest|gilet)/i.test(n)) return "Vests";
  if (/\b(crewneck|crew neck|sweatshirt)/i.test(n)) return "Crewnecks";
  if (/\b(sweater|knit|cardigan|pullover)/i.test(n)) return "Sweaters";
  if (/\b(shirt|button|polo|flannel)/i.test(n) && !/t-shirt|tshirt/i.test(n)) return "Shirts";
  if (/\b(jersey|football shirt|soccer|basketball)/i.test(n)) return "Jerseys";
  if (/\b(shorts?\b|swim trunk)/i.test(n)) return "Shorts";
  if (/\b(pants?|trouser|cargo|jogger|sweatpant)/i.test(n)) return "Pants";
  if (/\b(tracksuit|track suit)/i.test(n)) return "Tracksuits";
  if (/\b(bag|backpack|duffle|tote|crossbody|shoulder|purse|clutch|keepall)/i.test(n)) return "Bags";
  if (/\b(wallet|card holder)/i.test(n)) return "Wallets";
  if (/\b(belt)\b/i.test(n)) return "Belts";
  if (/\b(hat|cap|beanie|bucket|balaclava)/i.test(n)) return "Hats & Caps";
  if (/\b(sunglasses|glasses|eyewear)/i.test(n)) return "Sunglasses";
  if (/\b(phone case|iphone|airpod)/i.test(n)) return "Phone Cases";
  if (/\b(sock|underwear|boxer)/i.test(n)) return "Socks & Underwear";
  if (/\b(scarf|glove)/i.test(n)) return "Scarves & Gloves";
  if (/\b(watch|rolex|datejust)/i.test(n)) return "Watches";
  if (/\b(necklace|chain|pendant|choker)/i.test(n)) return "Necklaces";
  if (/\b(bracelet|bangle)/i.test(n)) return "Bracelets";
  if (/\b(earring|stud|hoop)/i.test(n)) return "Earrings";
  if (/\b(ring)\b/i.test(n) && !/earring/i.test(n)) return "Rings";
  if (/\b(perfume|cologne|fragrance)/i.test(n)) return "Perfumes";
  if (/\b(keychain|lighter|pin|badge)/i.test(n)) return "Keychains & Accessories";
  return "T-Shirts";
}

function parsePrice(str) {
  if (!str) return null;
  const cleaned = str.replace(/[$€¥£,\s]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 ? null : num;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Process one CSV tab ──
function processTab(tab, existingIds) {
  const csvPath = path.join(__dirname, "csv", tab.file);
  if (!fs.existsSync(csvPath)) {
    console.log(`  File not found: ${csvPath}`);
    return { found: 0, products: [], skipped: 0 };
  }

  const text = fs.readFileSync(csvPath, "utf8");
  const rows = parseCSV(text);

  // Find the header row (the one that has "RAW LINK" or "NAME" or "Item Name")
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const joined = rows[i].join(",").toLowerCase();
    if (joined.includes("raw link") || (joined.includes("name") && (joined.includes("link") || joined.includes("price")))) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) {
    console.log(`  Could not find header row in ${tab.file}`);
    return { found: rows.length, products: [], skipped: 0 };
  }

  const headers = rows[headerIdx];
  const nameCol = findCol(headers, "item name", "name");
  const rawLinkCol = findCol(headers, "raw link");
  const priceCol = findCol(headers, "price");

  console.log(`  Header at row ${headerIdx}: nameCol=${nameCol}, rawLinkCol=${rawLinkCol}, priceCol=${priceCol}`);

  const products = [];
  let skipped = 0;
  let dataRows = 0;

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) continue;

    let rawLink = rawLinkCol >= 0 ? (row[rawLinkCol] || "") : "";
    // If no RAW LINK column or it's empty, try to decode from LINK (KakoBuy URL)
    if (!isValidSourceUrl(rawLink)) {
      const linkCol = findCol(headers, "link");
      const linkVal = linkCol >= 0 ? (row[linkCol] || "") : "";
      if (linkVal.includes("kakobuy.com") && linkVal.includes("url=")) {
        try {
          const u = new URL(linkVal);
          rawLink = decodeURIComponent(u.searchParams.get("url") || "");
        } catch {}
      }
    }
    if (!isValidSourceUrl(rawLink)) continue;
    if (rawLink.includes("#REF!")) continue;

    dataRows++;
    const sourceLink = cleanSourceUrl(rawLink);
    const itemId = extractItemId(sourceLink);
    if (!itemId) continue;

    if (existingIds.has(itemId)) {
      skipped++;
      continue;
    }

    const name = nameCol >= 0 ? (row[nameCol] || "").trim() : "";
    if (!name || name.length < 2 || name === "CellImage" || name.startsWith("#")) continue;

    const priceStr = priceCol >= 0 ? row[priceCol] : "";
    const priceUsd = parsePrice(priceStr);
    const priceCny = priceUsd ? Math.round(priceUsd / 0.14 * 100) / 100 : null;
    const priceEur = priceUsd ? Math.round(priceUsd * 0.93 * 100) / 100 : null;

    products.push({
      name: name.slice(0, 500),
      brand: extractBrand(name),
      category: categorize(name),
      price_cny: priceCny,
      price_usd: priceUsd,
      price_eur: priceEur,
      source_link: sourceLink,
      tier: "mid",
      quality: "good",
      verified: false,
      views: Math.floor(Math.random() * 80) + 10,
      likes: Math.floor(Math.random() * 15),
      dislikes: Math.floor(Math.random() * 3),
      // collection: tab.collection, // Add after running: ALTER TABLE products ADD COLUMN collection TEXT;
    });

    existingIds.add(itemId); // prevent cross-tab dupes

    if (limitArg && products.length >= limitArg) break;
  }

  return { found: dataRows, products, skipped };
}

// ── Main ──
async function main() {
  console.log(dryRun ? "=== DRY RUN ===" : "=== IMPORTING ===");

  // Add collection column
  if (!dryRun) {
    try {
      await supabase.rpc("exec_sql", { sql: "ALTER TABLE products ADD COLUMN IF NOT EXISTS collection TEXT;" });
    } catch {}
  }

  // Fetch existing for dedup
  console.log("Fetching existing products for deduplication...");
  const existingIds = new Set();
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.from("products").select("source_link").range(offset, offset + 999);
    if (error || !data || data.length === 0) break;
    for (const p of data) {
      const id = extractItemId(p.source_link);
      if (id) existingIds.add(id);
    }
    offset += data.length;
  }
  console.log(`Found ${existingIds.size} existing item IDs\n`);

  const tabs = tabArg ? TABS.filter((t) => t.name === tabArg) : TABS;
  const summary = [];
  let totalNew = 0;
  let totalSkipped = 0;

  for (const tab of tabs) {
    console.log(`--- ${tab.label} (${tab.file}) ---`);
    const { found, products, skipped } = processTab(tab, existingIds);
    totalSkipped += skipped;

    console.log(`  Found: ${found} rows, New: ${products.length}, Dupes: ${skipped}`);

    if (dryRun) {
      for (const p of products.slice(0, 5)) {
        console.log(`    [DRY] ${p.name.slice(0, 50)} — ${p.category} — ${p.brand} — $${p.price_usd || "?"}`);
      }
      if (products.length > 5) console.log(`    ... and ${products.length - 5} more`);
    } else {
      let inserted = 0;
      const batches = Math.ceil(products.length / 50);
      for (let i = 0; i < products.length; i += 50) {
        const batch = products.slice(i, i + 50);
        const { data, error } = await supabase.from("products").insert(batch).select("id");
        if (error) {
          console.error(`  Batch ${Math.floor(i / 50) + 1}/${batches} error: ${error.message}`);
        } else {
          inserted += (data?.length || 0);
          console.log(`  [batch ${Math.floor(i / 50) + 1}/${batches}] Inserted ${data?.length || 0} (${tab.label})`);
        }
        await sleep(300);
      }
      totalNew += inserted;
      console.log(`  Done: ${inserted} inserted\n`);
    }

    summary.push({ tab: tab.label, found, new: products.length, skipped });
  }

  console.log("\n=== SUMMARY ===");
  for (const s of summary) {
    console.log(`  ${s.tab}: ${s.found} rows, ${s.new} new, ${s.skipped} dupes`);
  }
  console.log(`\n  Total new: ${dryRun ? summary.reduce((a, s) => a + s.new, 0) : totalNew}`);
  console.log(`  Total skipped: ${totalSkipped}`);

  const logPath = path.join(__dirname, "kakobuy-import.log");
  fs.writeFileSync(logPath, JSON.stringify(summary, null, 2));
  console.log(`  Log: ${logPath}`);
}

main().catch(console.error);
