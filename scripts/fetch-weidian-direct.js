#!/usr/bin/env node
/**
 * Fetch images and prices directly from Weidian's Thor API.
 * Only processes weidian.com products. 2-4s delay between requests.
 * Usage: node scripts/fetch-weidian-direct.js [--limit 500] [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
fs.readFileSync(envPath, 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) process.env[k.trim()] = v.join('=').trim();
});

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const args = process.argv.slice(2);
const LIMIT = parseInt(args.find((_, i, a) => a[i - 1] === '--limit') || '500');
const DRY_RUN = args.includes('--dry-run');
const PROGRESS_FILE = path.join(__dirname, 'weidian-progress.json');

// Load progress (set of already-processed IDs)
let processed = new Set();
try {
  const saved = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  processed = new Set(saved);
} catch {}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function randomDelay() {
  return 2000 + Math.random() * 2000; // 2-4 seconds
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        'Referer': 'https://weidian.com/',
        'Accept': 'application/json, text/plain, */*',
      },
      timeout: 10000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid JSON')); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// Weidian Thor API endpoints
async function fetchWeidianSku(itemId) {
  const url = `https://thor.weidian.com/detail/getItemSkuInfo/1.0?param=${encodeURIComponent(JSON.stringify({ itemId: String(itemId) }))}`;
  return fetchJSON(url);
}

function extractItemId(sourceLink) {
  const m = sourceLink.match(/itemID=(\d+)/i);
  return m ? m[1] : null;
}

// Category rules (same as recategorize)
const CATEGORY_RULES = [
  [/\b(jean|denim\s*pant)/i, 'Jeans'],
  [/\b(t-?shirt|tee\b|tshirt)/i, 'T-Shirts'],
  [/\b(hoodie|hoody|hooded|zip[\s-]*up)/i, 'Hoodies'],
  [/\b(boot|chelsea|combat|martin)/i, 'Boots'],
  [/\b(slide|sandal|slipper|crocs|clog|foam\s*runner)/i, 'Slides & Sandals'],
  [/\b(sneaker|jordan|aj[1-9]|dunk|air\s*force|af1|yeezy\s*[0-9]|new\s*balance|converse|vans\b|trainer|runner)/i, 'Sneakers'],
  [/\b(shoe|loafer|derby|oxford|espadrille)/i, 'Shoes'],
  [/\b(coat|puffer|down\s*jacket|parka|quilted)/i, 'Coats & Puffers'],
  [/\b(jacket|bomber|windbreaker|varsity)/i, 'Jackets'],
  [/\b(vest|gilet)/i, 'Vests'],
  [/\b(sweater|knit|cardigan|pullover)/i, 'Sweaters'],
  [/\b(crewneck|sweatshirt)/i, 'Crewnecks'],
  [/\b(shirt|button|polo|flannel)/i, 'Shirts'],
  [/\b(jersey)/i, 'Jerseys'],
  [/\b(tracksuit)/i, 'Tracksuits'],
  [/\b(pants|trouser|cargo|jogger|sweatpant)/i, 'Pants'],
  [/\b(shorts|swim\s*trunk)/i, 'Shorts'],
  [/\b(bag|backpack|duffle|tote|crossbody|shoulder|keepall|messenger)/i, 'Bags'],
  [/\b(wallet|card\s*holder|purse)/i, 'Wallets'],
  [/\b(belt)\b/i, 'Belts'],
  [/\b(hat|cap|beanie|bucket|balaclava)/i, 'Hats & Caps'],
  [/\b(sunglasses|glasses|eyewear)/i, 'Sunglasses'],
  [/\b(watch|rolex|datejust)/i, 'Watches'],
  [/\b(necklace|chain|pendant|choker)/i, 'Necklaces'],
  [/\b(bracelet|bangle|cuff)/i, 'Bracelets'],
  [/\b(earring|stud|hoop)/i, 'Earrings'],
  [/\b(ring)\b/i, 'Rings'],
  [/\b(perfume|fragrance|cologne)/i, 'Perfumes'],
  [/\b(phone\s*case|airpod)/i, 'Phone Cases'],
  [/\b(sock|underwear|boxer)/i, 'Socks & Underwear'],
  [/\b(scarf|glove)/i, 'Scarves & Gloves'],
];

function categorize(name) {
  for (const [regex, cat] of CATEGORY_RULES) {
    if (regex.test(name)) return cat;
  }
  return null; // keep existing
}

const BRANDS = ['Nike', 'Adidas', 'Jordan', 'Balenciaga', 'Gucci', 'Louis Vuitton', 'Prada', 'Chrome Hearts', 'Supreme', 'Stussy', 'Trapstar', 'Essentials', 'Off-White', 'Burberry', 'New Balance', 'Yeezy', 'Dior', 'Chanel', 'Moncler', 'Stone Island', 'Gallery Dept', 'Rhude', 'Amiri', "Arc'teryx", 'The North Face', 'Palm Angels', 'Rick Owens', 'Acne Studios', 'Broken Planet', 'Vivienne Westwood', 'Cartier', 'Hermes', 'Fendi', 'Celine', 'Bottega Veneta', 'Loewe', 'Maison Margiela', 'Versace', 'Valentino', 'Givenchy', 'Bape', 'Kenzo', 'Goyard', 'Salomon'];

function extractBrand(name) {
  const lower = name.toLowerCase();
  for (const b of BRANDS) {
    if (lower.includes(b.toLowerCase())) return b;
  }
  return null;
}

async function main() {
  // Fetch weidian products missing images
  console.log('Fetching weidian products needing enrichment...');
  let products = [];
  let offset = 0;
  while (products.length < LIMIT) {
    const { data, error } = await sb
      .from('products')
      .select('id,name,source_link,image,price_cny,brand,category')
      .like('source_link', '%weidian.com%')
      .or('image.is.null,image.eq.')
      .order('id', { ascending: true })
      .range(offset, offset + 999);
    if (error || !data || data.length === 0) break;
    // Filter out already processed
    const fresh = data.filter(p => !processed.has(p.id));
    products.push(...fresh);
    offset += data.length;
    if (data.length < 1000) break;
  }
  products = products.slice(0, LIMIT);

  console.log(`Found ${products.length} weidian products to enrich (limit: ${LIMIT})`);
  if (DRY_RUN) { console.log('Dry run — exiting.'); return; }

  let enriched = 0, failed = 0, rateLimited = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const itemId = extractItemId(p.source_link);
    if (!itemId) {
      console.log(`[${i + 1}/${products.length}] SKIP id:${p.id} — no itemID in URL`);
      processed.add(p.id);
      failed++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${products.length}] id:${p.id} item:${itemId}... `);

    try {
      // Fetch SKU info — contains title, main image, price, and variant images
      const skuData = await fetchWeidianSku(itemId);

      if (skuData?.status?.code !== 0) {
        console.log('API error');
        processed.add(p.id);
        failed++;
        await sleep(randomDelay());
        continue;
      }

      const update = {};
      const result = skuData.result || {};

      // Extract variant images
      const variantImages = [];
      const variants = [];
      if (result.attrList) {
        for (const attr of result.attrList) {
          if (attr.attrValues) {
            for (const val of attr.attrValues) {
              if (val.img) {
                variantImages.push(val.img);
                variants.push({ name: val.attrValue, image: val.img });
              }
            }
          }
        }
      }

      // Main image from itemMainPic
      if (result.itemMainPic) {
        update.image = result.itemMainPic;
        const allImgs = [result.itemMainPic, ...variantImages.filter(u => u !== result.itemMainPic)];
        if (allImgs.length > 1) update.images = allImgs.slice(0, 15);
      } else if (variantImages.length > 0) {
        update.image = variantImages[0];
        if (variantImages.length > 1) update.images = variantImages.slice(0, 15);
      }

      // Price from itemDiscountLowPrice (in cents)
      if (!p.price_cny) {
        const priceRaw = result.itemDiscountLowPrice || result.itemOriginalLowPrice;
        if (priceRaw) {
          const price = Math.round(parseInt(priceRaw) / 100);
          if (price > 0 && price < 50000) {
            update.price_cny = price;
            update.price_usd = Math.round(price * 0.14 * 100) / 100;
            update.price_eur = Math.round(price * 0.13 * 100) / 100;
          }
        }
      }

      // Title from itemTitle
      if (result.itemTitle && (p.name.match(/^(Product |T-Shirts #|Sneakers #|Bags #|Hoodies #|Boots #|Shoes #|Jackets #|Pants #|Jeans #|Shorts #|Necklaces #|Bracelets #|Rings #|Earrings #|Watches #|Wallets #|Belts #|Hats #|Sunglasses #|Perfumes #|Coats #|Sweaters #|Crewnecks #|Shirts #|Jerseys #|Tracksuits #|Vests #|Slides #|Home #|Keychains #|Phone Cases #|Socks #|Scarves #)/))) {
        update.name = result.itemTitle.slice(0, 200);
        const brand = extractBrand(result.itemTitle);
        if (brand && (!p.brand || p.brand === 'Various')) update.brand = brand;
        const cat = categorize(result.itemTitle);
        if (cat) update.category = cat;
      }

      // Variants
      if (variants.length > 0) update.variants = variants;

      if (Object.keys(update).length > 0) {
        await sb.from('products').update(update).eq('id', p.id);
        const parts = [];
        if (update.image) parts.push('img');
        if (update.price_cny) parts.push(`¥${update.price_cny}`);
        if (update.name) parts.push(update.name.slice(0, 40));
        if (update.variants) parts.push(`${update.variants.length}var`);
        console.log(`OK — ${parts.join(', ')}`);
        enriched++;
      } else {
        console.log('no useful data');
        failed++;
      }

      processed.add(p.id);

    } catch (err) {
      if (err.message?.includes('429') || err.message?.includes('rate')) {
        console.log('RATE LIMITED — pausing 60s');
        rateLimited++;
        await sleep(60000);
        i--; // retry this product
        continue;
      }
      console.log(`ERROR: ${err.message?.slice(0, 50)}`);
      processed.add(p.id);
      failed++;
    }

    // Save progress every 25 items
    if ((i + 1) % 25 === 0) {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify([...processed]));
      console.log(`--- Checkpoint: ${enriched} enriched, ${failed} failed, ${rateLimited} rate limits ---`);
    }

    await sleep(randomDelay());
  }

  // Final save
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify([...processed]));
  console.log(`\nDone! ${enriched} enriched, ${failed} failed, ${rateLimited} rate limits out of ${products.length}`);
}

main().catch(console.error);
