import { supabase } from "./supabase";

interface SmartFetchOptions {
  count: number;
  discoverySlots?: number;
  maxPerCategory?: number;
  collection?: string;
  exclude?: string[];
  seed?: number;
}

export async function smartFetch(options: SmartFetchOptions) {
  const {
    count = 8,
    discoverySlots = 2,
    maxPerCategory = 2,
    collection,
    exclude = [],
    seed,
  } = options;

  // Generate a time-based seed that rotates every 6 hours
  const timeSeed = seed || Math.floor(Date.now() / (6 * 60 * 60 * 1000));

  // Fetch more than we need so we can filter and diversify
  const fetchCount = Math.max(count * 10, 100);

  let query = supabase
    .from("products")
    .select("id, name, brand, category, price_cny, price_usd, price_eur, image, views, likes, score, variant_count, created_at")
    .not("image", "is", null)
    .neq("image", "")
    .order("score", { ascending: false })
    .limit(fetchCount);

  if (collection === "girls") {
    query = query.in("collection", ["girls", "both"]);
  } else if (collection === "main") {
    query = query.in("collection", ["main", "both"]);
  }

  const { data: products } = await query;
  if (!products || products.length === 0) return [];

  // Filter out excluded products
  const pool = products.filter(
    (p: { id: number }) => !exclude.includes(String(p.id))
  );

  // === WEIGHTED SHUFFLE ===
  function weightedShuffle<T extends { score?: number | null }>(
    items: T[],
    seedNum: number
  ) {
    let s = seedNum;
    function seededRandom() {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    }

    return items
      .map((item) => ({
        ...item,
        sortKey: Math.pow(seededRandom(), 1 / Math.max(item.score || 1, 1)),
      }))
      .sort((a, b) => b.sortKey - a.sortKey);
  }

  // Split pool into top tier (score > 50) and discovery tier (score 15-50)
  const topTier = pool.filter(
    (p: { score?: number | null }) => (p.score || 0) > 50
  );
  const discoveryTier = pool.filter(
    (p: { score?: number | null }) =>
      (p.score || 0) >= 15 && (p.score || 0) <= 50
  );

  const shuffledTop = weightedShuffle(topTier, timeSeed);
  const shuffledDiscovery = weightedShuffle(discoveryTier, timeSeed + 1);

  // === CATEGORY DIVERSITY ===
  function diversePick<T extends { category?: string | null }>(
    candidates: T[],
    pickCount: number,
    maxPerCat: number
  ) {
    const picked: T[] = [];
    const catCounts: Record<string, number> = {};

    for (const product of candidates) {
      if (picked.length >= pickCount) break;

      const cat = product.category || "unknown";
      const currentCount = catCounts[cat] || 0;

      if (currentCount < maxPerCat) {
        picked.push(product);
        catCounts[cat] = currentCount + 1;
      }
    }

    return picked;
  }

  // === BUILD FINAL SELECTION ===
  const mainSlots = count - discoverySlots;

  const mainPicks = diversePick(shuffledTop, mainSlots, maxPerCategory);

  const mainIds = new Set(mainPicks.map((p) => p.id));
  const discoveryFiltered = shuffledDiscovery.filter(
    (p: { id: number }) => !mainIds.has(p.id)
  );
  const discoveryPicks = diversePick(discoveryFiltered, discoverySlots, 1);

  // Combine and interleave: don't put all discovery at the end
  const result = [...mainPicks];
  const insertPositions = [2, 5, 7].slice(0, discoverySlots);
  for (let i = 0; i < discoveryPicks.length; i++) {
    const pos = insertPositions[i] || result.length;
    result.splice(Math.min(pos, result.length), 0, discoveryPicks[i]);
  }

  return result.slice(0, count);
}

// Convenience functions for common use cases
export async function fetchTrending(
  count = 8,
  collection?: string,
  exclude?: string[]
) {
  return smartFetch({
    count,
    discoverySlots: 2,
    maxPerCategory: 2,
    collection,
    exclude,
  });
}

export async function fetchForYou(
  count = 8,
  collection?: string,
  exclude?: string[]
) {
  const timeSeed = Math.floor(Date.now() / (6 * 60 * 60 * 1000));
  return smartFetch({
    count,
    discoverySlots: 3,
    maxPerCategory: 1,
    collection,
    exclude,
    seed: timeSeed + 9999,
  });
}

export async function fetchNewDrops(count = 8, collection?: string) {
  let query = supabase
    .from("products")
    .select(
      "id, name, brand, category, price_cny, price_usd, price_eur, image, views, likes, score, created_at"
    )
    .not("image", "is", null)
    .neq("image", "")
    .gte(
      "created_at",
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    )
    .order("created_at", { ascending: false })
    .limit(count);

  if (collection === "girls") {
    query = query.in("collection", ["girls", "both"]);
  } else if (collection === "main") {
    query = query.in("collection", ["main", "both"]);
  }

  const { data } = await query;
  return data || [];
}
