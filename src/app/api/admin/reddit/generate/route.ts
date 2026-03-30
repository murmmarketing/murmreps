import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

function checkAuth(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

interface Product {
  id: number;
  name: string;
  brand: string;
  price_cny: number;
  image: string;
  views: number;
  category: string;
}

const SHOE_CATS = ["Sneakers", "Shoes", "Boots", "Slides & Sandals"];
const TOP_CATS = ["T-Shirts", "Shirts", "Hoodies", "Sweaters", "Crewnecks", "Jerseys"];
const BOTTOM_CATS = ["Pants", "Jeans", "Shorts", "Tracksuits"];
const OUTER_CATS = ["Jackets", "Coats & Puffers", "Vests"];
const ACC_CATS = [
  "Belts", "Hats & Caps", "Scarves & Gloves", "Sunglasses", "Phone Cases",
  "Socks & Underwear", "Necklaces", "Bracelets", "Earrings", "Rings",
  "Watches", "Keychains & Accessories",
];
const BAG_CATS = ["Bags", "Wallets"];

function getCategoryGroup(cat: string): string {
  if (SHOE_CATS.includes(cat)) return "Shoes";
  if (TOP_CATS.includes(cat)) return "Tops";
  if (BOTTOM_CATS.includes(cat)) return "Bottoms";
  if (OUTER_CATS.includes(cat)) return "Outerwear";
  if (ACC_CATS.includes(cat)) return "Accessories";
  if (BAG_CATS.includes(cat)) return "Bags";
  return "Other";
}

function dedupeByBrand(products: Product[], maxPerBrand: number, limit: number): Product[] {
  const brandCount: Record<string, number> = {};
  const result: Product[] = [];
  // Shuffle first for variety on regenerate
  const shuffled = [...products].sort(() => Math.random() - 0.5);
  // But keep high-score ones more likely by partial sort
  shuffled.sort((a, b) => (b.views - a.views) * 0.5 + (Math.random() - 0.5) * 200);

  for (const p of shuffled) {
    if (result.length >= limit) break;
    const count = brandCount[p.brand] || 0;
    if (count >= maxPerBrand) continue;
    brandCount[p.brand] = count + 1;
    result.push(p);
  }
  return result;
}

function groupByCategory(products: Product[]): Record<string, Product[]> {
  const groups: Record<string, Product[]> = {};
  for (const p of products) {
    const group = getCategoryGroup(p.category);
    if (!groups[group]) groups[group] = [];
    groups[group].push(p);
  }
  return groups;
}

function formatGroupedList(products: Product[]): string {
  const groups = groupByCategory(products);
  const order = ["Shoes", "Tops", "Bottoms", "Outerwear", "Bags", "Accessories", "Other"];
  const lines: string[] = [];
  let i = 1;
  for (const group of order) {
    const items = groups[group];
    if (!items || items.length === 0) continue;
    lines.push(`\n**${group}**`);
    for (const p of items) {
      lines.push(
        `${i}. ${p.name} — ¥${p.price_cny} — [W2C](https://murmreps.com/products/${p.id})`
      );
      i++;
    }
  }
  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;

  try {
    const { template, brand } = await req.json();
    const supabase = getAdminClient();

    if (template === "weekly-finds") {
      const { data } = await supabase
        .from("products")
        .select("id, name, brand, price_cny, image, views, category")
        .not("image", "is", null)
        .neq("image", "")
        .neq("brand", "Various")
        .gt("views", 10)
        .order("score", { ascending: false })
        .limit(100);

      const picks = dedupeByBrand((data as Product[]) || [], 2, 25);
      const list = formatGroupedList(picks);

      return NextResponse.json({
        title: `[FIND] ${picks.length} Finds With W2C — Shoes, Hoodies, Accessories & More`,
        subreddit: "r/FashionReps",
        body: `Been sourcing heavy lately. Here are ${picks.length} of my best finds with working links:\n${list}\n\nAll of these are on [murmreps.com](https://murmreps.com) with links for all 8 agents if you want to compare prices.\n\nWho's GPing what? Let me know and I'll update with QC when it comes in.`,
      });
    }

    if (template === "intro") {
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      const productCount = count ? Math.floor(count / 1000) * 1000 : 19000;

      return NextResponse.json({
        title: `I built a site with ${productCount.toLocaleString()}+ finds — free tool for the community`,
        subreddit: "r/FashionReps, r/MurmReps",
        body: `Yo repfam,\n\nI got tired of scrolling through dead links and losing track of finds. So I built [MurmReps](https://murmreps.com) — a free site that organizes everything.\n\n**What it does:**\n- ${productCount.toLocaleString()}+ products from Weidian and Taobao, all categorized and searchable\n- Free link converter — paste any product link, get links for all 8 agents\n- View counts and likes so you can see what people are actually looking at\n- Separate [girls/women's section](https://murmreps.com/girls) with 2,500+ finds\n- New products added daily\n\n**Not a store** — I don't sell anything or ship products. Just a discovery tool.\n\nWould love feedback. What categories need more products? Drop requests below and I'll try to source them.\n\nSite: [murmreps.com](https://murmreps.com)`,
      });
    }

    if (template === "haul-guide") {
      return NextResponse.json({
        title: "[GUIDE] How to buy your first haul using MurmReps — step by step",
        subreddit: "r/MurmReps, r/FashionReps",
        body: `A lot of people have been asking how to go from browsing to buying, so here's the full process:\n\n**Step 1: Find what you want**\nGo to [murmreps.com](https://murmreps.com) and browse. Use search, filter by category, or check the Trending section. Women's finds are at [murmreps.com/girls](https://murmreps.com/girls).\n\n**Step 2: Pick your agent**\nOn any product page, you'll see buttons for 8 different agents. If you're new, start with **KakoBuy** — cleanest interface, best for beginners.\n\n**Step 3: Add to cart & pay**\nClick the KakoBuy button, select size/color, add to cart. The agent buys from the Chinese seller for you.\n\n**Step 4: QC photos**\nYour agent sends photos of the actual item. Check the quality. Bad? Return it for free.\n\n**Step 5: Ship**\nOnce everything's in your warehouse, select items and ship. Pick budget line (slow but cheap) or express (fast but pricier).\n\n**Pro tips:**\n- Use the [link converter](https://murmreps.com/converter) to compare agent prices\n- Start with 3-5 items for your first haul\n- Always check QC photos\n- Size up 1-2 from your normal size\n\nFull guide with more detail: [murmreps.com/guides/how-to-buy-reps-kakobuy](https://murmreps.com/guides/how-to-buy-reps-kakobuy)\n\nQuestions? Drop them below.`,
      });
    }

    if (template === "budget") {
      const { data } = await supabase
        .from("products")
        .select("id, name, brand, price_cny, image, views, category")
        .lt("price_cny", 100)
        .gt("price_cny", 0)
        .not("image", "is", null)
        .neq("image", "")
        .neq("brand", "Various")
        .order("score", { ascending: false })
        .limit(50);

      const picks = dedupeByBrand((data as Product[]) || [], 2, 15);
      const list = picks
        .map(
          (p, i) =>
            `${i + 1}. ${p.name} — ¥${p.price_cny} — [W2C](https://murmreps.com/products/${p.id})`
        )
        .join("\n");

      return NextResponse.json({
        title: `[FIND] ${picks.length} Budget Steals Under ¥100 (~$14) — all with W2C`,
        subreddit: "r/FashionReps",
        body: `Found some insane budget pieces. All under ¥100 with working links:\n\n${list}\n\nMost of these have 100+ views on [murmreps.com](https://murmreps.com) so they're community-tested.\n\nWhat's the best budget cop you've ever found? Drop it below 👇`,
      });
    }

    if (template === "girls") {
      const { data } = await supabase
        .from("products")
        .select("id, name, brand, price_cny, image, views, category")
        .in("collection", ["girls", "both"])
        .not("image", "is", null)
        .neq("image", "")
        .order("score", { ascending: false })
        .limit(60);

      const picks = dedupeByBrand((data as Product[]) || [], 2, 20);
      const list = formatGroupedList(picks);

      return NextResponse.json({
        title: `[FIND] ${picks.length} Women's Finds — Bags, Shoes, Jewelry (W2C for all)`,
        subreddit: "r/FashionReps, r/RepLadies",
        body: `Curated a list for the ladies. All from [murmreps.com/girls](https://murmreps.com/girls):\n${list}\n\nAll products have links for 8 agents. Site has 2,500+ women's finds if you want more.`,
      });
    }

    if (template === "brand-spotlight") {
      if (!brand) {
        return NextResponse.json({ error: "Select a brand" }, { status: 400 });
      }

      const { data } = await supabase
        .from("products")
        .select("id, name, brand, price_cny, image, views, category")
        .eq("brand", brand)
        .not("image", "is", null)
        .neq("image", "")
        .order("score", { ascending: false })
        .limit(10);

      const items = (data as Product[]) || [];
      const list = items
        .map(
          (p, i) =>
            `${i + 1}. ${p.name} — ¥${p.price_cny} — [W2C](https://murmreps.com/products/${p.id})`
        )
        .join("\n");

      return NextResponse.json({
        title: `[FIND] Best ${brand} Reps — ${items.length} finds with W2C`,
        subreddit: "r/FashionReps",
        body: `Here are the best ${brand} finds I've sourced:\n\n${list}\n\nAll on [murmreps.com](https://murmreps.com) with 8 agent options.`,
      });
    }

    if (template === "brands") {
      // Return top brands for the dropdown
      const { data } = await supabase
        .from("products")
        .select("brand")
        .not("image", "is", null)
        .neq("image", "")
        .neq("brand", "Various");

      const brandCounts: Record<string, number> = {};
      for (const row of (data || []) as { brand: string }[]) {
        brandCounts[row.brand] = (brandCounts[row.brand] || 0) + 1;
      }
      const topBrands = Object.entries(brandCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 40)
        .map(([name, count]) => ({ name, count }));

      return NextResponse.json({ brands: topBrands });
    }

    return NextResponse.json({ error: "Unknown template" }, { status: 400 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
