import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import sharp from "sharp";
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
  score: number | null;
  views: number;
}

const SLOT_CATS = {
  tops: ["Shirts", "Hoodies", "Sweaters", "Polos", "Long Sleeves", "Jerseys", "Tank Tops", "Tops"],
  bottoms: ["Pants", "Shorts"],
  shoes: ["Shoes", "Boots", "Slides & Sandals"],
  outerwear: ["Jackets"],
  accessories: ["Accessories", "Hats & Caps", "Belts", "Sunglasses", "Glasses", "Bags", "Wallets", "Scarves & Gloves", "Socks & Underwear", "Phone Cases"],
  jewelry: ["Necklaces", "Bracelets", "Earrings", "Rings", "Watches", "Jewelry"],
};

// Name-based safety filters to catch miscategorized products
const SLOT_BLOCKLIST: Record<string, string[]> = {
  tops: ["sneaker", "shoe", "boot", "slide", "sandal", "jordan 1", "jordan 4", "dunk", "air force", "air max", "yeezy", "loafer"],
  bottoms: ["sneaker", "shoe", "boot", "hoodie", "jacket", "bag", "necklace", "bracelet", "ring", "watch"],
  shoes: ["shirt", "tee", "short", "jeans", "pants", "hoodie", "jacket", "sweater", "bag", "cap", "hat", "belt", "sock", "wallet", "ring", "chain", "necklace", "bracelet", "glasses", "bootcut", "bootleg"],
  outerwear: ["sneaker", "shoe", "boot", "slide", "pants", "jeans", "short", "bag", "necklace"],
  accessories: ["sneaker", "shoe", "boot", "hoodie", "jacket", "sweater", "pants", "jeans"],
  jewelry: ["sneaker", "shoe", "boot", "hoodie", "jacket", "pants", "jeans", "short", "shirt"],
};

function filterSlot(products: Product[], slot: string): Product[] {
  const blocklist = SLOT_BLOCKLIST[slot];
  if (!blocklist) return products;
  return products.filter((p) => {
    const n = (p.name || "").toLowerCase();
    return !blocklist.some((kw) => n.includes(kw));
  });
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function fetchImageAsBase64(url: string): Promise<{ base64: string; mediaType: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://murmreps.com/",
      },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength > 2_000_000) return null;
    const resized = await sharp(buffer)
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toBuffer();
    return { base64: resized.toString("base64"), mediaType: "image/jpeg" };
  } catch {
    return null;
  }
}

function hasCategory(products: Product[], cats: string[]): boolean {
  return products.some((p) => cats.includes(p.category));
}

const MULTI_VARIANT_FILTERS = [
  "%(% styles)%", "%(% colors)%", "%(% colours)%",
  "%in 1%", "%pack of%", "%set of%", "%combo%", "%bundle%",
];

export async function POST(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;

  try {
    const { preset, excludeIds } = (await req.json()) as {
      preset: PresetConfig;
      excludeIds?: number[];
    };
    if (!preset || !preset.name) {
      return NextResponse.json({ error: "Preset required" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const brands = preset.brands?.length ? preset.brands : undefined;
    const collection = preset.collection || undefined;
    const recentExcludes = excludeIds || [];

    // ============================================================
    // STAGE 1: Fetch ALL qualifying products (text only)
    // ============================================================
    let baseQuery = supabase
      .from("products")
      .select("id, name, brand, price_cny, image, category, collection, score, views")
      .not("image", "is", null)
      .neq("image", "")
      .neq("brand", "Various");

    for (const pattern of MULTI_VARIANT_FILTERS) {
      baseQuery = baseQuery.not("name", "ilike", pattern);
    }

    if (brands) baseQuery = baseQuery.in("brand", brands);
    if (collection) baseQuery = baseQuery.in("collection", [collection, "both"]);

    // Paginate to get all
    let allProducts: Product[] = [];
    let offset = 0;
    while (true) {
      const { data } = await baseQuery
        .order("score", { ascending: false })
        .range(offset, offset + 999);
      if (!data || data.length === 0) break;
      allProducts = allProducts.concat(data as Product[]);
      if (data.length < 1000) break;
      offset += 1000;
    }

    // Filter out recently used products
    if (recentExcludes.length > 0) {
      allProducts = allProducts.filter((p) => !recentExcludes.includes(p.id));
    }

    const totalScanned = allProducts.length;

    if (totalScanned < 10) {
      return NextResponse.json({ error: `Only ${totalScanned} products found`, products: [] }, { status: 400 });
    }

    // No API key → random slot-based selection
    if (!process.env.ANTHROPIC_API_KEY) {
      const picks: Product[] = [];
      const safeSlot = (cats: string[], slot: string) => shuffle(filterSlot(allProducts.filter((p) => cats.includes(p.category)), slot));
      const t = safeSlot(SLOT_CATS.tops, "tops"); if (t.length) picks.push(t[0]);
      const b = safeSlot(SLOT_CATS.bottoms, "bottoms"); if (b.length) picks.push(b[0]);
      const s = safeSlot(SLOT_CATS.shoes, "shoes"); if (s.length) picks.push(s[0]);
      const aj = shuffle(filterSlot(allProducts.filter((p) => [...SLOT_CATS.accessories, ...SLOT_CATS.jewelry].includes(p.category)), "accessories"));
      if (aj.length) picks.push(aj[0]);
      const o = safeSlot(SLOT_CATS.outerwear, "outerwear"); if (o.length && picks.length < 6) picks.push(o[0]);
      if (aj.length > 1 && picks.length < 6) picks.push(aj[1]);
      return NextResponse.json({ products: picks, mode: "random", notes: "", totalScanned, shortlisted: 0 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const timestamp = Date.now();

    // ============================================================
    // STAGE 1b: Shuffle ALL products, then send to Haiku
    // ============================================================
    const shuffledAll = shuffle(allProducts);

    const productLines = shuffledAll
      .map((p) => `${p.id}|${p.brand}|${p.name}|${p.category}|¥${p.price_cny}|s:${p.score || 0}|v:${p.views}`)
      .join("\n");

    const stage1System = `You are a fashion buyer scanning a product catalog of ${totalScanned} items. Shortlist exactly 50 products for outfit curation.

VIBE: ${preset.vibe}
STYLE: ${preset.description}
${brands ? `PREFERRED BRANDS: ${brands.join(", ")}` : ""}
${recentExcludes.length > 0 ? `DO NOT select any of these recently used product IDs: ${recentExcludes.join(", ")}` : ""}

CRITICAL: Every time you run, you MUST pick completely different products. Never default to "safe" or "obvious" picks. Surprise me. Pick items I wouldn't expect. Prioritize variety and discovery over popularity.

DO NOT pick:
- Multi-item listings (photos showing multiple items in one image)
- Products with vague names like "Product 12345" or just a number
- Items with 0 views unless they have interesting names/brands

Select exactly 50 product IDs that:
1. Have recognizable, desirable brands
2. Span ALL outfit categories: tops, bottoms, shoes, jewelry/bags, accessories, outerwear
3. Cover a mix of price points within the vibe
4. Would look good together in multiple outfit combinations

Pick approximately:
- 12 tops (mix of tees, hoodies, sweaters, polos)
- 8 bottoms (mix of pants, jeans, shorts)
- 8 shoes (sneakers, boots, slides)
- 5 outerwear (jackets, coats)
- 10 accessories + jewelry + bags
- 7 wildcards (anything interesting)

Respond with ONLY a JSON array of 50 product IDs. Nothing else. Seed: ${timestamp}`;

    const stage1Response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system: stage1System,
      messages: [{ role: "user", content: productLines }],
    });

    const stage1Text = stage1Response.content[0].type === "text" ? stage1Response.content[0].text.trim() : "";
    const stage1Match = stage1Text.match(/\[[\d,\s]+\]/);

    let shortlistedIds: number[] = [];
    if (stage1Match) {
      shortlistedIds = JSON.parse(stage1Match[0]);
    }

    let shortlisted: Product[];
    if (shortlistedIds.length >= 20) {
      shortlisted = allProducts.filter((p) => shortlistedIds.includes(p.id));
    } else {
      shortlisted = shuffle(allProducts).slice(0, 50);
    }

    // Filter out recent excludes from shortlist too
    if (recentExcludes.length > 0) {
      shortlisted = shortlisted.filter((p) => !recentExcludes.includes(p.id));
    }

    // Shuffle shortlisted for Stage 2 variety
    shortlisted = shuffle(shortlisted);
    const shortlistedCount = shortlisted.length;

    // ============================================================
    // STAGE 2: Vision-based final selection with images (Sonnet)
    // ============================================================
    const imageResults = await Promise.allSettled(
      shortlisted.map((p) =>
        p.image && p.image.startsWith("http")
          ? fetchImageAsBase64(p.image)
          : Promise.resolve(null)
      )
    );

    type ContentBlock = Anthropic.ImageBlockParam | Anthropic.TextBlockParam;

    const buildContent = (extraNote?: string): ContentBlock[] => {
      const content: ContentBlock[] = [];
      if (extraNote) content.push({ type: "text", text: extraNote });
      content.push({
        type: "text",
        text: `Vibe: ${preset.vibe}\nStyle: ${preset.description}\n\nThese ${shortlistedCount} products were shortlisted from ${totalScanned} candidates. Pick the best outfit:`,
      });

      for (let i = 0; i < shortlisted.length; i++) {
        const p = shortlisted[i];
        const ir = imageResults[i];
        const imgResult = ir.status === "fulfilled" ? ir.value : null;
        if (imgResult) {
          content.push({
            type: "image",
            source: {
              type: "base64",
              media_type: imgResult.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: imgResult.base64,
            },
          });
        }
        content.push({
          type: "text",
          text: `ID: ${p.id} | ${p.brand} — ${p.name} | ${p.category} | ¥${p.price_cny}${!imgResult ? " [NO IMAGE]" : ""}`,
        });
      }
      return content;
    };

    const stage2System = `You are an expert fashion stylist curating outfits for flat-lay photography on TikTok and Instagram. You can SEE the actual product photos.

REQUIRED ITEMS (every outfit MUST include ALL):
- 1 top (t-shirt, hoodie, sweater, crewneck, polo, shirt)
- 1 bottom (pants, jeans, shorts, sweatpants)
- 1 pair of shoes (sneakers, boots, slides)
- 1 jewelry piece OR bag (necklace, chain, bracelet, ring, watch, bag)

OPTIONAL (pick 1-2 if they complement the outfit):
- 1 outerwear piece (jacket, coat) — only if the top is thin
- 1 extra accessory (cap, belt, sunglasses, socks)

Total: 4-6 items.

VARIETY IS CRITICAL. Pick unexpected, interesting combinations. Do NOT default to generic Nike + Supreme + basic sneakers. Dig into the candidates and find unique pieces — archive brands, interesting colorways, statement accessories.

PHOTO QUALITY CHECK — you can see the images. REJECT any product where:
- The photo shows MULTIPLE items (like several bags in one photo) — pick single-item photos only
- A person is wearing/holding the item — we need flat product photos
- The photo is blurry, dark, or has heavy watermarks
- The item is still in packaging/plastic

COLOR PALETTE: Pick items sharing a cohesive 2-3 color palette. Monochrome, earth tones, or black + accent work best.

BRAND COHESION: Match brand tiers. Don't randomly mix streetwear with haute couture.

SILHOUETTE BALANCE: Oversized top → slim bottom. Bold graphic → plain bottom.

SEASONAL SENSE: Don't pair puffers with shorts, or slides with formal pants.

First, respond with ONLY a JSON array of product IDs. Example: [123, 456, 789, 101, 202]
Then on a new line write "NOTES:" followed by a 1-2 sentence explanation of the color palette and styling logic.

Seed: ${timestamp}`;

    const callClaude = async (extraNote?: string): Promise<{ ids: number[]; notes: string }> => {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        system: stage2System,
        messages: [{ role: "user", content: buildContent(extraNote) }],
      });
      const text = response.content[0].type === "text" ? response.content[0].text.trim() : "";
      const idMatch = text.match(/\[[\d,\s]+\]/);
      const ids: number[] = idMatch ? JSON.parse(idMatch[0]) : [];
      const notesMatch = text.match(/NOTES:\s*([\s\S]+)/);
      const notes = notesMatch ? notesMatch[1].trim() : "";
      return { ids, notes };
    };

    let result = await callClaude();
    let selected = shortlisted.filter((p) => result.ids.includes(p.id));
    let notes = result.notes;

    // Validate
    const valid =
      hasCategory(selected, SLOT_CATS.tops) &&
      hasCategory(selected, SLOT_CATS.bottoms) &&
      hasCategory(selected, SLOT_CATS.shoes) &&
      hasCategory(selected, [...SLOT_CATS.jewelry, ...SLOT_CATS.accessories]);

    if (!valid && selected.length > 0) {
      const missing: string[] = [];
      if (!hasCategory(selected, SLOT_CATS.tops)) missing.push("top");
      if (!hasCategory(selected, SLOT_CATS.bottoms)) missing.push("bottom");
      if (!hasCategory(selected, SLOT_CATS.shoes)) missing.push("shoes");
      if (!hasCategory(selected, [...SLOT_CATS.jewelry, ...SLOT_CATS.accessories])) missing.push("jewelry/accessory");

      result = await callClaude(`Missing: ${missing.join(", ")}. You MUST include one from each required category.`);
      selected = shortlisted.filter((p) => result.ids.includes(p.id));
      notes = result.notes;
    }

    // Final fallback
    if (selected.length < 3) {
      selected = [];
      const safeSlot = (cats: string[], slot: string) => shuffle(filterSlot(shortlisted.filter((p) => cats.includes(p.category)), slot));
      const t = safeSlot(SLOT_CATS.tops, "tops"); if (t.length) selected.push(t[0]);
      const b = safeSlot(SLOT_CATS.bottoms, "bottoms"); if (b.length) selected.push(b[0]);
      const s = safeSlot(SLOT_CATS.shoes, "shoes"); if (s.length) selected.push(s[0]);
      const aj = shuffle(filterSlot(shortlisted.filter((p) => [...SLOT_CATS.accessories, ...SLOT_CATS.jewelry].includes(p.category)), "accessories"));
      if (aj.length) selected.push(aj[0]);
      return NextResponse.json({ products: selected, mode: "fallback", notes: "", totalScanned, shortlisted: shortlistedCount });
    }

    return NextResponse.json({
      products: selected,
      mode: "ai-curated",
      notes,
      totalScanned,
      shortlisted: shortlistedCount,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Curation error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
