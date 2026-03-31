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
  brands: string[];
  maxPrice?: number;
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

async function getCandidates(
  supabase: ReturnType<typeof getAdminClient>,
  preset: PresetConfig
): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("id, name, brand, price_cny, image, category, collection")
    .not("image", "is", null)
    .neq("image", "")
    .neq("brand", "Various");

  if (preset.collection) {
    query = query.in("collection", [preset.collection, "both"]);
  }
  if (preset.maxPrice) {
    query = query.lte("price_cny", preset.maxPrice);
  }
  if (preset.brands && preset.brands.length > 0) {
    query = query.in("brand", preset.brands);
  }

  const { data } = await query
    .order("score", { ascending: false })
    .limit(80);

  return (data as Product[]) || [];
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
    const candidates = await getCandidates(supabase, preset);

    if (candidates.length < 3) {
      return NextResponse.json(
        { error: "Not enough products matching this preset", products: [] },
        { status: 400 }
      );
    }

    // If no Anthropic key, fall back to score-based selection
    if (!process.env.ANTHROPIC_API_KEY) {
      const shuffled = [...candidates].sort(() => Math.random() - 0.5);
      const brandCount: Record<string, number> = {};
      const picks: Product[] = [];
      for (const p of shuffled) {
        if (picks.length >= 6) break;
        const bc = brandCount[p.brand] || 0;
        if (bc >= 2) continue;
        brandCount[p.brand] = bc + 1;
        picks.push(p);
      }
      return NextResponse.json({ products: picks, mode: "random" });
    }

    // Use Claude to curate the outfit
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const productList = candidates
      .map(
        (p) =>
          `${p.id} | ${p.name} | ${p.brand} | ${p.category} | ¥${p.price_cny}`
      )
      .join("\n");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `You are a modern fashion stylist. Pick exactly 5-6 items from this product list to create a cohesive ${preset.vibe} outfit.

Rules:
- Pick items that work together in color, style, and brand level
- Must include: 1 top/shirt, 1 bottom OR shoes, and at least 1 accessory
- Avoid clashing brands (don't mix Nike with Gucci)
- Think about color palette — items should complement each other
- Consider seasonality and the overall vibe: ${preset.description}

Available products (format: ID | Name | Brand | Category | Price):
${productList}

Respond ONLY with a JSON array of the selected product IDs, nothing else. Example: [123, 456, 789, 101, 202]`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";

    // Parse the ID array — handle potential markdown wrapping
    const jsonMatch = text.match(/\[[\d,\s]+\]/);
    if (!jsonMatch) {
      // Fallback to random if parsing fails
      const picks = candidates
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
      return NextResponse.json({ products: picks, mode: "fallback" });
    }

    const selectedIds: number[] = JSON.parse(jsonMatch[0]);
    const selected = candidates.filter((p) => selectedIds.includes(p.id));

    // If Claude picked fewer than 3, supplement with random candidates
    if (selected.length < 3) {
      const remaining = candidates
        .filter((p) => !selectedIds.includes(p.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 6 - selected.length);
      selected.push(...remaining);
    }

    return NextResponse.json({ products: selected, mode: "ai-curated" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Curation error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
