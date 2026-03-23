require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------- helpers ----------

const PREMIUM_BRANDS = [
  'Nike', 'Adidas', 'Jordan', 'Yeezy', 'Louis Vuitton', 'Gucci', 'Moncler',
  'Supreme', 'Chrome Hearts', 'Balenciaga', 'Off-White', 'Dior', 'Prada',
  'New Balance', 'Bape', 'Stussy', 'Travis Scott', 'Burberry', 'Versace',
  'Fendi', 'Hermes', 'Chanel', 'Cartier', 'Vivienne Westwood'
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedRandom(items) {
  // items: [[value, weight], ...]
  const total = items.reduce((s, i) => s + i[1], 0);
  let r = Math.random() * total;
  for (const [value, weight] of items) {
    r -= weight;
    if (r <= 0) return value;
  }
  return items[items.length - 1][0];
}

function randomTimestamp(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  // Weight toward 10am-11pm
  const hour = Math.random() < 0.8
    ? Math.floor(Math.random() * 13) + 10  // 10-22
    : Math.floor(Math.random() * 24);       // 0-23
  date.setHours(hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
  return date.toISOString();
}

function isPremium(brand) {
  if (!brand) return false;
  return PREMIUM_BRANDS.some(p => brand.toLowerCase().includes(p.toLowerCase()));
}

function isMidTier(brand) {
  if (!brand || brand.toLowerCase() === 'various' || brand.trim() === '') return false;
  return !isPremium(brand);
}

// ---------- Part 1: Seed product view counts ----------

async function fetchAllProducts() {
  const products = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('id, brand')
      .range(from, from + pageSize - 1);
    if (error) { console.error('Fetch error:', error.message); break; }
    if (!data || data.length === 0) break;
    products.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return products;
}

async function seedViews(products) {
  const updates = products.map(p => {
    let views;
    if (isPremium(p.brand)) {
      views = rand(150, 800);
    } else if (isMidTier(p.brand)) {
      views = rand(50, 300);
    } else {
      views = rand(20, 150);
    }
    return { id: p.id, views };
  });

  // Batch update 100 at a time
  for (let i = 0; i < updates.length; i += 100) {
    const batch = updates.slice(i, i + 100);
    await Promise.all(
      batch.map(u =>
        supabase.from('products').update({ views: u.views }).eq('id', u.id)
      )
    );
  }
  console.log(`Updated views for ${products.length} products`);
}

// ---------- Part 2: Seed analytics events ----------

const PAGE_WEIGHTS = [
  ['/products', 40],
  ['/', 25],
  ['/converter', 10],
  ['/guide', 8],
  ['/agents', 7],
  ['/qc', 5],
  ['/news', 5],
];

const AGENT_WEIGHTS = [
  ['KakoBuy', 40],
  ['Superbuy', 15],
  ['CnFans', 12],
  ['MuleBuy', 8],
  ['ACBuy', 8],
  ['LoveGoBuy', 7],
  ['JoyaGoo', 5],
  ['SugarGoo', 5],
];

const SEARCH_WEIGHTS = [
  ['nike', 15],
  ['yeezy', 10],
  ['jordan', 10],
  ['louis vuitton', 8],
  ['chrome hearts', 7],
  ['moncler', 6],
  ['balenciaga', 6],
  ['hoodie', 8],
  ['sneakers', 7],
  ['bag', 5],
  ['dunk', 5],
  ['supreme', 4],
  ['ring', 3],
  ['watch', 3],
  ['jacket', 3],
];

const PLATFORM_WEIGHTS = [
  ['weidian', 50],
  ['taobao', 35],
  ['1688', 15],
];

function buildWeightedProductPicker(products) {
  // Build weighted list: premium products appear 3x, mid-tier 2x, unbranded 1x
  const weighted = [];
  for (const p of products) {
    const w = isPremium(p.brand) ? 3 : isMidTier(p.brand) ? 2 : 1;
    weighted.push([p.id, w]);
  }
  const totalWeight = weighted.reduce((s, i) => s + i[1], 0);
  return function pickProduct() {
    let r = Math.random() * totalWeight;
    for (const [id, w] of weighted) {
      r -= w;
      if (r <= 0) return id;
    }
    return weighted[weighted.length - 1][0];
  };
}

async function seedAnalytics(products) {
  const pickProduct = buildWeightedProductPicker(products);
  const events = [];
  const counts = {
    page_view: 0,
    product_view: 0,
    agent_click: 0,
    search: 0,
    converter_use: 0,
    wishlist_add: 0,
  };

  for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
    // Determine page_view count based on recency
    let pvMin, pvMax;
    if (daysAgo < 7)       { pvMin = 150; pvMax = 300; }
    else if (daysAgo < 14) { pvMin = 100; pvMax = 200; }
    else if (daysAgo < 21) { pvMin = 50;  pvMax = 100; }
    else                   { pvMin = 20;  pvMax = 50;  }

    const pvCount = rand(pvMin, pvMax);

    // page_view events
    for (let j = 0; j < pvCount; j++) {
      const ts = randomTimestamp(daysAgo);
      events.push({
        event_type: 'page_view',
        metadata: { page: weightedRandom(PAGE_WEIGHTS) },
        created_at: ts,
      });
      counts.page_view++;

      // 60% also get a product_view
      if (Math.random() < 0.6) {
        const pid = pickProduct();
        events.push({
          event_type: 'product_view',
          product_id: pid,
          created_at: ts,
        });
        counts.product_view++;

        // 8% of product_views get an agent_click
        if (Math.random() < 0.08) {
          events.push({
            event_type: 'agent_click',
            product_id: pid,
            agent_name: weightedRandom(AGENT_WEIGHTS),
            created_at: ts,
          });
          counts.agent_click++;
        }
      }
    }

    // search events: 15-30 per day
    const searchCount = rand(15, 30);
    for (let j = 0; j < searchCount; j++) {
      events.push({
        event_type: 'search',
        metadata: { query: weightedRandom(SEARCH_WEIGHTS) },
        created_at: randomTimestamp(daysAgo),
      });
      counts.search++;
    }

    // converter_use events: 10-20 per day
    const convCount = rand(10, 20);
    for (let j = 0; j < convCount; j++) {
      events.push({
        event_type: 'converter_use',
        metadata: { source: weightedRandom(PLATFORM_WEIGHTS) },
        created_at: randomTimestamp(daysAgo),
      });
      counts.converter_use++;
    }

    // wishlist_add events: 5-15 per day
    const wishCount = rand(5, 15);
    for (let j = 0; j < wishCount; j++) {
      events.push({
        event_type: 'wishlist_add',
        product_id: pickProduct(),
        created_at: randomTimestamp(daysAgo),
      });
      counts.wishlist_add++;
    }
  }

  // Batch insert 500 at a time
  console.log(`Inserting ${events.length} analytics events...`);
  for (let i = 0; i < events.length; i += 500) {
    const batch = events.slice(i, i + 500);
    const { error } = await supabase.from('analytics').insert(batch);
    if (error) console.error('Batch error:', error.message);
  }

  console.log(
    `Seeded ${counts.page_view} page_views, ${counts.product_view} product_views, ` +
    `${counts.agent_click} agent_clicks, ${counts.search} searches, ` +
    `${counts.converter_use} converter_uses, ${counts.wishlist_add} wishlist_adds`
  );
}

// ---------- main ----------

async function main() {
  console.log('Fetching products...');
  const products = await fetchAllProducts();
  console.log(`Fetched ${products.length} products`);

  console.log('Seeding views...');
  await seedViews(products);

  console.log('Seeding analytics events...');
  await seedAnalytics(products);

  console.log('Done!');
}

main().catch(console.error);
