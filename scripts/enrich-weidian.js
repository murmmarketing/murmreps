#!/usr/bin/env node

/**
 * Enrich products with missing images from Weidian Thor API.
 * Fetches itemMainPic, title, and price for Weidian source links.
 *
 * Resumable — skips products that already have an image.
 * Rate limited — 1 request per second.
 *
 * Usage: node scripts/enrich-weidian.js [--limit N] [--dry-run]
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load env
fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8").split("\n").forEach((line) => {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) process.env[key.trim()] = vals.join("=").trim();
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PROGRESS_FILE = path.join(__dirname, "enrich-weidian-progress.json");
const LOG_FILE = path.join(__dirname, "enrich-weidian.log");

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + "\n");
}

function loadProgress() {
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
  } catch {
    return { processed: new Set(), enriched: 0, failed: 0, priceUpdated: 0, nameUpdated: 0 };
  }
}

function saveProgress(state) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
    ...state,
    processed: [...state.processed],
  }));
}

async function fetchWeidianInfo(itemId) {
  const url = `https://thor.weidian.com/detail/getItemSkuInfo/1.0?param=${encodeURIComponent(JSON.stringify({ itemId }))}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Referer": "https://weidian.com/",
      "Accept": "application/json",
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  if (data.status?.code !== 0 || !data.result) {
    throw new Error(data.status?.message || "No result");
  }

  return data.result;
}

function extractItemId(sourceLink) {
  // Handle both itemID= and itemId= (case insensitive)
  const match = sourceLink.match(/itemID=(\d+)/i);
  return match ? match[1] : null;
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.indexOf("--limit");
  const limit = limitArg !== -1 ? parseInt(args[limitArg + 1]) : Infinity;
  const dryRun = args.includes("--dry-run");

  log(`Starting Weidian enrichment${dryRun ? " (DRY RUN)" : ""}${limit < Infinity ? ` (limit: ${limit})` : ""}`);

  // Load progress for resumability
  const rawProgress = loadProgress();
  const state = {
    processed: new Set(rawProgress.processed || []),
    enriched: rawProgress.enriched || 0,
    failed: rawProgress.failed || 0,
    priceUpdated: rawProgress.priceUpdated || 0,
    nameUpdated: rawProgress.nameUpdated || 0,
  };

  // Fetch all products with Weidian links and no image
  log("Fetching products with missing images and Weidian source links...");
  let allProducts = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id,name,source_link,price_cny,image")
      .like("source_link", "%weidian.com%")
      .or("image.is.null,image.eq.")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allProducts.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  // Filter out already-processed products (for resumability)
  const toProcess = allProducts.filter((p) => !state.processed.has(p.id));
  const total = Math.min(toProcess.length, limit);

  log(`Found ${allProducts.length} products needing enrichment, ${toProcess.length} not yet processed, processing ${total}`);

  let batchUpdates = [];
  let count = 0;

  for (const product of toProcess) {
    if (count >= limit) break;

    const itemId = extractItemId(product.source_link);
    if (!itemId) {
      state.processed.add(product.id);
      state.failed++;
      count++;
      continue;
    }

    try {
      const info = await fetchWeidianInfo(itemId);
      const updates = {};

      // Get main image
      if (info.itemMainPic) {
        updates.image = info.itemMainPic;
      } else if (info.attrList?.[0]?.attrValues?.[0]?.img) {
        // Fallback to first SKU attribute image
        updates.image = info.attrList[0].attrValues[0].img;
      }

      // Update price if ours looks like a placeholder (exactly 199) or is null
      if ((product.price_cny === 199 || product.price_cny === null) && info.itemDiscountLowPrice) {
        const priceCny = Math.round(parseInt(info.itemDiscountLowPrice) / 100);
        if (priceCny > 0 && priceCny !== product.price_cny) {
          updates.price_cny = priceCny;
          state.priceUpdated++;
        }
      }

      // Update name if ours is generic
      if (info.itemTitle && (
        /^Product \d+$/i.test(product.name) ||
        product.name === "Unknown" ||
        product.name === "#REF!"
      )) {
        updates.name = info.itemTitle;
        state.nameUpdated++;
      }

      if (Object.keys(updates).length > 0 && !dryRun) {
        batchUpdates.push({ id: product.id, updates });

        // Flush batch every 50
        if (batchUpdates.length >= 50) {
          await flushBatch(batchUpdates);
          batchUpdates = [];
        }

        if (updates.image) state.enriched++;
      } else if (dryRun && updates.image) {
        state.enriched++;
        log(`  [DRY] Would update ${product.id}: image=${updates.image?.substring(0, 60)}...`);
      }

      state.processed.add(product.id);
    } catch (err) {
      state.processed.add(product.id);
      state.failed++;
      if (count < 10 || count % 100 === 0) {
        log(`  Error for ${product.id} (itemId=${itemId}): ${err.message}`);
      }
    }

    count++;
    if (count % 50 === 0) {
      log(`Progress: ${count}/${total} | Enriched: ${state.enriched} | Failed: ${state.failed}`);
      saveProgress(state);
    }

    // Rate limit: 1 request per second
    await sleep(1000);
  }

  // Flush remaining
  if (batchUpdates.length > 0 && !dryRun) {
    await flushBatch(batchUpdates);
  }

  saveProgress(state);

  // Final report
  log("\n═══ FINAL REPORT ═══");
  log(`Total processed: ${count}`);
  log(`Successfully enriched (got image): ${state.enriched}`);
  log(`Price updated: ${state.priceUpdated}`);
  log(`Name updated: ${state.nameUpdated}`);
  log(`Failed (API error or no data): ${state.failed}`);

  // Count remaining
  const { count: stillMissing } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .or("image.is.null,image.eq.");
  log(`Still missing images: ${stillMissing}`);
}

async function flushBatch(batch) {
  for (const { id, updates } of batch) {
    const { error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id);
    if (error) {
      log(`  DB error updating ${id}: ${error.message}`);
    }
  }
}

main().catch((err) => {
  log(`Fatal error: ${err.message}`);
  process.exit(1);
});
