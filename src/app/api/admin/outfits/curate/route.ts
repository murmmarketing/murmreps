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
  sampleSize: number,
  brands?: string[],
  collection?: string,
): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("id, name, brand, price_cny, image, category, collection")
    .in("category", categories)
    .not("image", "is", null)
    .neq("image", "")
    .neq("brand", "Various")
    .gt("views", 0)
    .not("name", "ilike", "%(% styles)%")
    .not("name", "ilike", "%(% colors)%")
    .not("name", "ilike", "%(% colours)%")
    .not("name", "ilike", "%in 1%")
    .not("name", "ilike", "%pack of%")
    .not("name", "ilike", "%set of%")
    .not("name", "ilike", "%combo%")
    .not("name", "ilike", "%bundle%");

  if (brands && brands.length > 0) {
    query = query.in("brand", brands);
  }
  if (collection) {
    query = query.in("collection", [collection, "both"]);
  }

  // Fetch top 30 by score, then randomly sample
  const { data } = await query.order("score", { ascending: false }).limit(30);
  return shuffle((data as Product[]) || []).slice(0, sampleSize);
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

    // Fetch random candidates per slot in parallel (smaller counts for image API)
    const [tops, bottoms, shoes, outerwear, accessories, jewelry] = await Promise.all([
      fetchSlot(supabase, SLOT_CATS.tops, 7, brands, collection),
      fetchSlot(supabase, SLOT_CATS.bottoms, 7, brands, collection),
      fetchSlot(supabase, SLOT_CATS.shoes, 7, brands, collection),
      fetchSlot(supabase, SLOT_CATS.outerwear, 5, brands, collection),
      fetchSlot(supabase, SLOT_CATS.accessories, 7, brands, collection),
      fetchSlot(supabase, SLOT_CATS.jewelry, 5, brands, collection),
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
      return NextResponse.json({ products: picks, mode: "random", notes: "" });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const timestamp = Date.now();

    const systemPrompt = `You are an expert fashion stylist curating outfits for flat-lay photography on TikTok and Instagram. You can SEE the actual product photos — use them to make smart visual decisions.

REQUIRED ITEMS (every outfit MUST include ALL of these):
- 1 top (t-shirt, hoodie, sweater, crewneck, polo, shirt)
- 1 bottom (pants, jeans, shorts, sweatpants)
- 1 pair of shoes (sneakers, boots, slides)
- 1 jewelry piece OR bag (necklace, chain, bracelet, ring, watch, bag)

OPTIONAL (pick 1-2 if they complement the outfit):
- 1 outerwear piece (jacket, coat) — only if the top is a thin t-shirt or polo
- 1 extra accessory (cap, belt, sunglasses, socks)

Total: 4-6 items.

VISUAL STYLING RULES (you can see the product photos — use your eyes):

COLOR PALETTE: Pick items that share a cohesive 2-3 color palette. Best combos:
- All black / monochrome
- Black + white + one accent color
- Earth tones (beige, brown, cream, olive)
- Navy + white + grey
- All white / cream (summer clean)
Avoid random rainbow combinations.

BRAND LOGO VISIBILITY: Prefer items where the brand logo or graphic is clearly visible and recognizable in the photo. Big Supreme box logos, Nike swooshes, Chrome Hearts crosses, Stussy text — these photograph well and get engagement.

PHOTO QUALITY: Only pick items where the product photo is:
- Clean and clear (not blurry or dark)
- Shows the item properly (front view, not wrapped in packaging)
- Has a relatively clean background
SKIP items with messy photos, multiple unrelated items in frame, heavy watermarks, or items still in plastic bags.

BRAND COHESION: Match brand tiers:
- Streetwear: Nike + Stussy + Supreme + Jordan + New Balance
- Luxury street: Chrome Hearts + Balenciaga + Amiri + Off-White
- Old money: Ralph Lauren + Burberry + Acne Studios + Loro Piana
- Archive: Rick Owens + Raf Simons + Undercover + Maison Margiela
Don't randomly mix tiers unless doing intentional high-low (1 luxury piece + budget basics).

SILHOUETTE BALANCE:
- Oversized top → slim/straight bottom
- Fitted top → wider/relaxed bottom
- Bold graphic top → plain bottom
- Plain top → statement shoes or accessories

SEASONAL SENSE:
- Don't pair a heavy puffer jacket with shorts
- Hoodies go with pants/jeans, not usually with dress shoes
- Slides/sandals go with shorts or relaxed fits

MULTI-VARIANT LISTINGS: If you see a product photo showing MULTIPLE items in one image (e.g., 8 t-shirts spread out, a collection of colors, a pile of items), do NOT pick that product. Only pick products where the photo shows ONE specific item clearly. Single items photograph better for flat-lays.

FLAT-LAY THINKING: Imagine these items laid out on grey carpet for a photo. Which combination would look the most visually appealing and get the most engagement on TikTok?

First, respond with ONLY a JSON array of product IDs. Example: [123, 456, 789, 101, 202]
Then on a new line write "NOTES:" followed by a 1-2 sentence explanation of the color palette and styling logic.

Seed: ${timestamp}`;

    type ContentBlock = Anthropic.ImageBlockParam | Anthropic.TextBlockParam;

    const buildContent = (extraNote?: string): ContentBlock[] => {
      const content: ContentBlock[] = [];

      if (extraNote) {
        content.push({ type: "text", text: extraNote });
      }

      content.push({
        type: "text",
        text: `Vibe: ${preset.vibe}\nStyle: ${preset.description}\n\nHere are the candidate products with their photos. Pick the best outfit:`,
      });

      // Add each candidate as image + text
      for (const p of allCandidates) {
        if (p.image && p.image.startsWith("http")) {
          content.push({
            type: "image",
            source: { type: "url", url: p.image },
          });
          content.push({
            type: "text",
            text: `ID: ${p.id} | ${p.brand} — ${p.name} | ${p.category} | ¥${p.price_cny}`,
          });
        }
      }

      return content;
    };

    const callClaude = async (extraNote?: string): Promise<{ ids: number[]; notes: string }> => {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        system: systemPrompt,
        messages: [{ role: "user", content: buildContent(extraNote) }],
      });

      const text = response.content[0].type === "text" ? response.content[0].text.trim() : "";

      // Parse IDs
      const idMatch = text.match(/\[[\d,\s]+\]/);
      const ids: number[] = idMatch ? JSON.parse(idMatch[0]) : [];

      // Parse notes
      const notesMatch = text.match(/NOTES:\s*([\s\S]+)/);
      const notes = notesMatch ? notesMatch[1].trim() : "";

      return { ids, notes };
    };

    // First attempt
    let result = await callClaude();
    let selected = allCandidates.filter((p) => result.ids.includes(p.id));
    let notes = result.notes;

    // Validate: must have top, bottom, shoes, jewelry/accessory
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

      result = await callClaude(
        `Your previous selection was missing required categories: ${missing.join(", ")}. You MUST include one item from each required category.`
      );
      selected = allCandidates.filter((p) => result.ids.includes(p.id));
      notes = result.notes;
    }

    // Final fallback
    if (selected.length < 3) {
      selected = [];
      if (tops.length) selected.push(tops[0]);
      if (bottoms.length) selected.push(bottoms[0]);
      if (shoes.length) selected.push(shoes[0]);
      const accPool = shuffle([...accessories, ...jewelry]);
      if (accPool.length) selected.push(accPool[0]);
      if (outerwear.length && selected.length < 6) selected.push(outerwear[0]);
      return NextResponse.json({ products: selected, mode: "fallback", notes: "" });
    }

    return NextResponse.json({ products: selected, mode: "ai-curated", notes });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Curation error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
