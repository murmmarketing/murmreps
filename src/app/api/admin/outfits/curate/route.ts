import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAdminClient } from "@/lib/supabase";

function checkAuth(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

interface PresetConfig {
  name: string;
  vibe: string;
  description: string;
  brands?: string[];
  collection?: string;
}

interface Product {
  id: number;
  name: string;
  brand: string;
  price_cny: number;
  image: string;
  category: string;
  collection: string;
}

const SLOT_CATS = {
  tops: ["Shirts", "Hoodies", "Sweaters", "Polos", "Long Sleeves", "Jerseys", "Tank Tops", "Tops"],
  bottoms: ["Pants", "Shorts"],
  shoes: ["Shoes", "Boots", "Slides & Sandals"],
  outerwear: ["Jackets"],
  accessories: ["Accessories", "Hats & Caps", "Belts", "Sunglasses", "Glasses", "Bags", "Wallets", "Scarves & Gloves", "Socks & Underwear", "Phone Cases"],
  jewelry: ["Necklaces", "Bracelets", "Earrings", "Rings", "Watches", "Jewelry"],
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function fetchSlot(
  supabase: ReturnType<typeof getAdminClient>,
  categories: string[],
  limit: number,
  brands?: string[],
  collection?: string,
): Promise<Product[]> {
  // Fetch a larger pool sorted by score, then shuffle to get random variety
  let query = supabase
    .from("products")
    .select("id, name, brand, price_cny, image, category, collection")
    .in("category", categories)
    .not("image", "is", null)
    .neq("image", "")
    .neq("brand", "Various")
    .gt("views", 0);

  if (brands && brands.length > 0) {
    query = query.in("brand", brands);
  }
  if (collection) {
    query = query.in("collection", [collection, "both"]);
  }

  // Fetch 300 top-scored, then shuffle and take `limit`
  const { data } = await query.order("score", { ascending: false }).limit(300);
  return shuffle((data as Product[]) || []).slice(0, limit);
}

function hasCategory(products: Product[], cats: string[]): boolean {
  return products.some((p) => cats.includes(p.category));
}

export async function POST(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;

  try {
    const { preset } = (await req.json()) as { preset: PresetConfig };
    if (!preset || !preset.name) {
      return NextResponse.json({ error: "Preset required" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const brands = preset.brands && preset.brands.length > 0 ? preset.brands : undefined;
    const collection = preset.collection || undefined;

    // Fetch random candidates per slot in parallel
    const [tops, bottoms, shoes, outerwear, accessories, jewelry] = await Promise.all([
      fetchSlot(supabase, SLOT_CATS.tops, 15, brands, collection),
      fetchSlot(supabase, SLOT_CATS.bottoms, 15, brands, collection),
      fetchSlot(supabase, SLOT_CATS.shoes, 15, brands, collection),
      fetchSlot(supabase, SLOT_CATS.outerwear, 10, brands, collection),
      fetchSlot(supabase, SLOT_CATS.accessories, 15, brands, collection),
      fetchSlot(supabase, SLOT_CATS.jewelry, 10, brands, collection),
    ]);

    const allCandidates = [...tops, ...bottoms, ...shoes, ...outerwear, ...accessories, ...jewelry];

    if (allCandidates.length < 4) {
      return NextResponse.json({ error: "Not enough products found", products: [] }, { status: 400 });
    }

    // No API key → random selection with slot coverage
    if (!process.env.ANTHROPIC_API_KEY) {
      const picks: Product[] = [];
      if (tops.length) picks.push(tops[0]);
      if (bottoms.length) picks.push(bottoms[0]);
      if (shoes.length) picks.push(shoes[0]);
      const accOrJewelry = shuffle([...accessories, ...jewelry]);
      if (accOrJewelry.length) picks.push(accOrJewelry[0]);
      if (outerwear.length && picks.length < 6) picks.push(outerwear[0]);
      if (accOrJewelry.length > 1 && picks.length < 6) picks.push(accOrJewelry[1]);
      return NextResponse.json({ products: picks, mode: "random" });
    }

    // Build candidate list for Claude
    const productList = allCandidates
      .map((p) => `${p.id} | ${p.name} | ${p.brand} | ${p.category} | ¥${p.price_cny}`)
      .join("\n");

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const timestamp = Date.now();

    const systemPrompt = `You are a fashion stylist curating outfits for flat-lay photography on TikTok/Instagram.

REQUIRED items (every outfit MUST have ALL):
- 1 top (t-shirt, hoodie, sweater, crewneck, polo, or shirt)
- 1 bottom (pants, jeans, shorts, or sweatpants)
- 1 pair of shoes (sneakers, boots, or slides)
- 1 jewelry piece OR bag (necklace, chain, bracelet, ring, watch, bag, wallet)

OPTIONAL (pick 1-2):
- 1 outerwear (jacket, coat) — only if the top is thin
- 1 accessory (cap/hat, belt, sunglasses, socks)

Total: 4-6 items per outfit.

STYLING RULES:
- Color coordination is CRITICAL. Pick items that look good together. Monochrome or 2-3 color palettes work best.
- Brand tier matching — don't pair ¥50 budget items with ¥2000 luxury unless it's intentional high-low styling.
- Think about what would look good in a flat-lay photo on grey carpet.
- Avoid picking items that are too similar (e.g., don't pick 2 t-shirts or 2 pairs of shoes).
- Prefer items with recognizable brand logos (Supreme box logo, Nike swoosh, Chrome Hearts cross) — these photograph better for social media.
- Prefer statement pieces that catch the eye — bold graphics, iconic designs, recognizable silhouettes.
- Be creative and surprising — don't always pick the safest combo.
- VARIETY IS KEY: pick a different combination every time. Seed: ${timestamp}

Respond with ONLY a JSON array of product IDs, nothing else. Example: [123, 456, 789, 101, 202]`;

    const callClaude = async (extraNote?: string): Promise<number[]> => {
      const userContent = `${extraNote ? extraNote + "\n\n" : ""}Vibe: ${preset.vibe}
Style description: ${preset.description}

Available products (format: ID | Name | Brand | Category | Price):
${productList}`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
      });

      const text = response.content[0].type === "text" ? response.content[0].text.trim() : "";
      const match = text.match(/\[[\d,\s]+\]/);
      if (!match) return [];
      return JSON.parse(match[0]);
    };

    // First attempt
    let selectedIds = await callClaude();
    let selected = allCandidates.filter((p) => selectedIds.includes(p.id));

    // Validate: must have top, bottom, shoes, jewelry/bag
    const valid =
      hasCategory(selected, SLOT_CATS.tops) &&
      hasCategory(selected, SLOT_CATS.bottoms) &&
      hasCategory(selected, SLOT_CATS.shoes) &&
      hasCategory(selected, [...SLOT_CATS.jewelry, ...SLOT_CATS.accessories]);

    // Retry once if invalid
    if (!valid && selected.length > 0) {
      const missing: string[] = [];
      if (!hasCategory(selected, SLOT_CATS.tops)) missing.push("top (shirt/hoodie/tee)");
      if (!hasCategory(selected, SLOT_CATS.bottoms)) missing.push("bottom (pants/shorts)");
      if (!hasCategory(selected, SLOT_CATS.shoes)) missing.push("shoes");
      if (!hasCategory(selected, [...SLOT_CATS.jewelry, ...SLOT_CATS.accessories])) missing.push("jewelry or accessory");

      selectedIds = await callClaude(
        `Your previous selection was missing required categories: ${missing.join(", ")}. You MUST include one item from each required category.`
      );
      selected = allCandidates.filter((p) => selectedIds.includes(p.id));
    }

    // Final fallback: if still bad, manually fill missing slots
    if (selected.length < 3) {
      selected = [];
      if (tops.length) selected.push(tops[0]);
      if (bottoms.length) selected.push(bottoms[0]);
      if (shoes.length) selected.push(shoes[0]);
      const accPool = shuffle([...accessories, ...jewelry]);
      if (accPool.length) selected.push(accPool[0]);
      if (outerwear.length && selected.length < 6) selected.push(outerwear[0]);
      return NextResponse.json({ products: selected, mode: "fallback" });
    }

    return NextResponse.json({ products: selected, mode: "ai-curated" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Curation error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
