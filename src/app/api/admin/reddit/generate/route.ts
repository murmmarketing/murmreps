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

const SHOE_CATS = ["Shoes", "Boots", "Slides & Sandals"];
const TOP_CATS = ["Shirts", "Polos", "Hoodies", "Sweaters", "Jerseys", "Long Sleeves", "Tank Tops", "Tops"];
const BOTTOM_CATS = ["Pants", "Shorts"];
const OUTER_CATS = ["Jackets"];
const ACC_CATS = [
  "Belts", "Hats & Caps", "Scarves & Gloves", "Sunglasses", "Glasses", "Phone Cases",
  "Socks & Underwear", "Necklaces", "Bracelets", "Earrings", "Rings",
  "Watches", "Keychains",
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

function eur(cny: number): string {
  return (cny / 7.5).toFixed(2);
}

function dedupeByBrand(products: Product[], maxPerBrand: number, limit: number): Product[] {
  const brandCount: Record<string, number> = {};
  const result: Product[] = [];
  const shuffled = [...products].sort(() => Math.random() - 0.5);
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

function formatGroupedReddit(products: Product[]): string {
  const groups: Record<string, Product[]> = {};
  for (const p of products) {
    const g = getCategoryGroup(p.category);
    if (!groups[g]) groups[g] = [];
    groups[g].push(p);
  }
  const order = ["Shoes", "Tops", "Bottoms", "Outerwear", "Bags", "Accessories", "Other"];
  const lines: string[] = [];
  let i = 1;
  for (const group of order) {
    const items = groups[group];
    if (!items?.length) continue;
    lines.push(`\n**${group}**`);
    for (const p of items) {
      lines.push(`${i}. ${p.name} — ¥${p.price_cny} — [W2C](https://murmreps.com/products/${p.id})`);
      i++;
    }
  }
  return lines.join("\n");
}

function formatGroupedDiscord(products: Product[]): string {
  const groups: Record<string, Product[]> = {};
  for (const p of products) {
    const g = getCategoryGroup(p.category);
    if (!groups[g]) groups[g] = [];
    groups[g].push(p);
  }
  const order = ["Shoes", "Tops", "Bottoms", "Outerwear", "Bags", "Accessories", "Other"];
  const lines: string[] = [];
  for (const group of order) {
    const items = groups[group];
    if (!items?.length) continue;
    lines.push(`\n**${group}**`);
    for (const p of items) {
      lines.push(`• [${p.name}](https://murmreps.com/products/${p.id}) — ¥${p.price_cny}`);
    }
  }
  return lines.join("\n");
}

// Helper queries
async function queryTop(supabase: ReturnType<typeof getAdminClient>, limit: number) {
  const { data } = await supabase
    .from("products")
    .select("id, name, brand, price_cny, image, views, category")
    .not("image", "is", null).neq("image", "").neq("brand", "Various").gt("views", 10)
    .order("score", { ascending: false }).limit(limit);
  return (data as Product[]) || [];
}

async function queryBudget(supabase: ReturnType<typeof getAdminClient>, maxPrice: number, limit: number) {
  const { data } = await supabase
    .from("products")
    .select("id, name, brand, price_cny, image, views, category")
    .lt("price_cny", maxPrice).gt("price_cny", 0)
    .not("image", "is", null).neq("image", "").neq("brand", "Various")
    .order("score", { ascending: false }).limit(limit);
  return (data as Product[]) || [];
}

async function queryGirls(supabase: ReturnType<typeof getAdminClient>, limit: number) {
  const { data } = await supabase
    .from("products")
    .select("id, name, brand, price_cny, image, views, category")
    .in("collection", ["girls", "both"])
    .not("image", "is", null).neq("image", "")
    .order("score", { ascending: false }).limit(limit);
  return (data as Product[]) || [];
}

async function queryNewest(supabase: ReturnType<typeof getAdminClient>, limit: number) {
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("products")
    .select("id, name, brand, price_cny, image, views, category")
    .not("image", "is", null).neq("image", "")
    .gte("created_at", twoDaysAgo)
    .order("created_at", { ascending: false }).limit(limit);
  return (data as Product[]) || [];
}

async function queryProductCount(supabase: ReturnType<typeof getAdminClient>): Promise<number> {
  const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
  return count ? Math.floor(count / 1000) * 1000 : 19000;
}

export async function POST(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;

  try {
    const { platform, template, brand } = await req.json();
    const supabase = getAdminClient();

    // ==================== BRANDS LOOKUP ====================
    if (template === "brands") {
      const { data } = await supabase
        .from("products").select("brand")
        .not("image", "is", null).neq("image", "").neq("brand", "Various");
      const counts: Record<string, number> = {};
      for (const r of (data || []) as { brand: string }[]) counts[r.brand] = (counts[r.brand] || 0) + 1;
      const topBrands = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 40)
        .map(([name, count]) => ({ name, count }));
      return NextResponse.json({ brands: topBrands });
    }

    // ==================== REDDIT ====================
    if (platform === "reddit") {
      if (template === "weekly-finds") {
        const picks = dedupeByBrand(await queryTop(supabase, 100), 2, 25);
        return NextResponse.json({
          platform: "reddit", title: `[FIND] ${picks.length} Finds With W2C — Shoes, Hoodies, Accessories & More`,
          subreddit: "r/FashionReps",
          body: `Been sourcing heavy lately. Here are ${picks.length} of my best finds with working links:\n${formatGroupedReddit(picks)}\n\nAll of these are on [murmreps.com](https://murmreps.com) with links for all 8 agents if you want to compare prices.\n\nWho's GPing what? Let me know and I'll update with QC when it comes in.`,
        });
      }
      if (template === "intro") {
        const pc = await queryProductCount(supabase);
        return NextResponse.json({
          platform: "reddit", title: `I built a site with ${pc.toLocaleString()}+ finds — free tool for the community`,
          subreddit: "r/FashionReps, r/MurmReps",
          body: `Yo repfam,\n\nI got tired of scrolling through dead links and losing track of finds. So I built [MurmReps](https://murmreps.com) — a free site that organizes everything.\n\n**What it does:**\n- ${pc.toLocaleString()}+ products from Weidian and Taobao, all categorized and searchable\n- Free link converter — paste any product link, get links for all 8 agents\n- View counts and likes so you can see what people are actually looking at\n- Separate [girls/women's section](https://murmreps.com/girls) with 2,500+ finds\n- New products added daily\n\n**Not a store** — I don't sell anything or ship products. Just a discovery tool.\n\nWould love feedback. What categories need more products? Drop requests below and I'll try to source them.\n\nSite: [murmreps.com](https://murmreps.com)`,
        });
      }
      if (template === "haul-guide") {
        return NextResponse.json({
          platform: "reddit", title: "[GUIDE] How to buy your first haul using MurmReps — step by step",
          subreddit: "r/MurmReps, r/FashionReps",
          body: `A lot of people have been asking how to go from browsing to buying, so here's the full process:\n\n**Step 1: Find what you want**\nGo to [murmreps.com](https://murmreps.com) and browse. Use search, filter by category, or check the Trending section. Women's finds are at [murmreps.com/girls](https://murmreps.com/girls).\n\n**Step 2: Pick your agent**\nOn any product page, you'll see buttons for 8 different agents. If you're new, start with **KakoBuy** — cleanest interface, best for beginners.\n\n**Step 3: Add to cart & pay**\nClick the KakoBuy button, select size/color, add to cart. The agent buys from the Chinese seller for you.\n\n**Step 4: QC photos**\nYour agent sends photos of the actual item. Check the quality. Bad? Return it for free.\n\n**Step 5: Ship**\nOnce everything's in your warehouse, select items and ship. Pick budget line (slow but cheap) or express (fast but pricier).\n\n**Pro tips:**\n- Use the [link converter](https://murmreps.com/converter) to compare agent prices\n- Start with 3-5 items for your first haul\n- Always check QC photos\n- Size up 1-2 from your normal size\n\nFull guide: [murmreps.com/guides/how-to-buy-reps-kakobuy](https://murmreps.com/guides/how-to-buy-reps-kakobuy)\n\nQuestions? Drop them below.`,
        });
      }
      if (template === "budget") {
        const picks = dedupeByBrand(await queryBudget(supabase, 100, 50), 2, 15);
        const list = picks.map((p, i) => `${i + 1}. ${p.name} — ¥${p.price_cny} — [W2C](https://murmreps.com/products/${p.id})`).join("\n");
        return NextResponse.json({
          platform: "reddit", title: `[FIND] ${picks.length} Budget Steals Under ¥100 (~$14) — all with W2C`,
          subreddit: "r/FashionReps",
          body: `Found some insane budget pieces. All under ¥100 with working links:\n\n${list}\n\nMost of these have 100+ views on [murmreps.com](https://murmreps.com) so they're community-tested.\n\nWhat's the best budget cop you've ever found? Drop it below 👇`,
        });
      }
      if (template === "girls") {
        const picks = dedupeByBrand(await queryGirls(supabase, 60), 2, 20);
        return NextResponse.json({
          platform: "reddit", title: `[FIND] ${picks.length} Women's Finds — Bags, Shoes, Jewelry (W2C for all)`,
          subreddit: "r/FashionReps, r/RepLadies",
          body: `Curated a list for the ladies. All from [murmreps.com/girls](https://murmreps.com/girls):\n${formatGroupedReddit(picks)}\n\nAll products have links for 8 agents. Site has 2,500+ women's finds if you want more.`,
        });
      }
      if (template === "brand-spotlight") {
        if (!brand) return NextResponse.json({ error: "Select a brand" }, { status: 400 });
        const { data } = await supabase
          .from("products").select("id, name, brand, price_cny, image, views, category")
          .eq("brand", brand).not("image", "is", null).neq("image", "")
          .order("score", { ascending: false }).limit(10);
        const items = (data as Product[]) || [];
        const list = items.map((p, i) => `${i + 1}. ${p.name} — ¥${p.price_cny} — [W2C](https://murmreps.com/products/${p.id})`).join("\n");
        return NextResponse.json({
          platform: "reddit", title: `[FIND] Best ${brand} Reps — ${items.length} finds with W2C`,
          subreddit: "r/FashionReps",
          body: `Here are the best ${brand} finds I've sourced:\n\n${list}\n\nAll on [murmreps.com](https://murmreps.com) with 8 agent options.`,
        });
      }
    }

    // ==================== TIKTOK ====================
    if (platform === "tiktok") {
      if (template === "product-showcase") {
        const items = dedupeByBrand(await queryTop(supabase, 20), 1, 1);
        const p = items[0];
        if (!p) return NextResponse.json({ error: "No products found" }, { status: 400 });
        const hashtags = `#reps #replica #fashionreps #${p.brand.toLowerCase().replace(/\s+/g, "")} #${getCategoryGroup(p.category).toLowerCase()} #haul #fashion #streetwear #murmreps #fyp #foryou #viral`;
        return NextResponse.json({
          platform: "tiktok",
          body: `This ${p.brand} ${getCategoryGroup(p.category).toLowerCase()} is ¥${p.price_cny} (~€${eur(p.price_cny)}) 😳🔥\n\nLink in bio to cop 🛒`,
          hashtags,
          videoIdea: `Film: Show the product photo from multiple angles. Use trending audio. Text overlay: "¥${p.price_cny}" with a shocked face emoji. End with MurmReps logo and "link in bio".`,
        });
      }
      if (template === "top-5") {
        const picks = dedupeByBrand(await queryTop(supabase, 40), 1, 5);
        const list = picks.map((p, i) => `${i + 1}. ${p.name} — ¥${p.price_cny}`).join("\n");
        return NextResponse.json({
          platform: "tiktok",
          body: `5 finds you NEED in your next haul 🔥👇\n\n${list}\n\nAll on murmreps.com 🛒 Link in bio!`,
          hashtags: "#reps #fashionreps #haul #finds #replica #streetwear #fashion #murmreps #fyp #viral",
          videoIdea: `Rapid cuts showing each product (1-2 sec each). Use trending transition sound. Text overlay with price on each. End: "All links on murmreps.com"`,
        });
      }
      if (template === "budget-challenge") {
        const picks = dedupeByBrand(await queryBudget(supabase, 150, 30), 1, 5);
        const total = picks.reduce((s, p) => s + p.price_cny, 0);
        const list = picks.map((p) => `${p.name} — ¥${p.price_cny}`).join("\n");
        return NextResponse.json({
          platform: "tiktok",
          body: `Full outfit for under ¥${total + 50} (~€${eur(total)}) 😤💰\n\n${list}\nTotal: ¥${total} (~€${eur(total)})\n\nLink in bio for all links 🔗`,
          hashtags: "#budgetreps #reps #fashionreps #budget #haul #streetwear #fashion #murmreps #fyp",
          videoIdea: `Show each item one by one with price overlay. Running total counter at bottom. Trending audio. End with total reveal.`,
        });
      }
      if (template === "girls") {
        const picks = dedupeByBrand(await queryGirls(supabase, 30), 1, 5);
        const list = picks.map((p, i) => `${i + 1}. ${p.name} — ¥${p.price_cny}`).join("\n");
        return NextResponse.json({
          platform: "tiktok",
          body: `Girls rep haul incoming 🎀✨\n\n${list}\n\n2,500+ women's finds on murmreps.com/girls 🛍️`,
          hashtags: "#reps #repladies #fashionreps #girlshaul #luxury #bags #jewelry #murmreps #fyp",
          videoIdea: `Show each product with smooth transitions. Pink/feminine aesthetic. Text overlay with brand + price. End: "murmreps.com/girls"`,
        });
      }
      if (template === "pov-hook") {
        return NextResponse.json({
          platform: "tiktok",
          body: `POV: you find a site with 19,000+ rep finds and links for 8 agents 😳\n\nmurmreps.com — link in bio 🔗`,
          hashtags: "#reps #fashionreps #pov #haul #replica #murmreps #fyp #viral #streetwear",
          videoIdea: `POV style: Screen recording scrolling through murmreps.com. Show the product grid, click a product, show the agent buttons. Trending audio. Fast cuts.`,
        });
      }
    }

    // ==================== INSTAGRAM ====================
    if (platform === "instagram") {
      const igHashtags = "\n.\n.\n.\n#reps #replica #fashionreps #haul #streetwear #fashion #weidian #taobao #murmreps #finds #sneakers #luxury #designer #streetstyle #ootd #fitcheck";
      const girlsHashtags = "\n.\n.\n.\n#reps #repladies #fashionreps #luxury #bags #jewelry #shoes #girlshaul #designer #chanel #dior #hermes #louisvuitton #murmreps";

      if (template === "carousel-weekly") {
        const picks = dedupeByBrand(await queryTop(supabase, 50), 1, 8);
        const slides = picks.map((p, i) => `Slide ${i + 1}: ${p.name} — ¥${p.price_cny}`).join("\n");
        return NextResponse.json({
          platform: "instagram",
          body: `Weekly drops just hit 🔥 Swipe to see our top picks this week →\n\n${slides}\n\nAll links on murmreps.com 🛒 (link in bio)\n\nWhich one are you copping? Comment below 👇${igHashtags}`,
          contentType: "Carousel post — 8 slides, one product per slide with price overlay",
        });
      }
      if (template === "carousel-girls") {
        const picks = dedupeByBrand(await queryGirls(supabase, 40), 1, 8);
        const slides = picks.map((p, i) => `Slide ${i + 1}: ${p.name} — ¥${p.price_cny}`).join("\n");
        return NextResponse.json({
          platform: "instagram",
          body: `For the girls 🎀✨ 2,500+ women's finds on murmreps.com/girls\n\nSwipe to see this week's favorites →\n\n${slides}\n\nWhich one is your must-have? 💕${girlsHashtags}`,
          contentType: "Carousel post — 8 slides, pink aesthetic, product images with prices",
        });
      }
      if (template === "single-product") {
        const picks = dedupeByBrand(await queryTop(supabase, 20), 1, 1);
        const p = picks[0];
        if (!p) return NextResponse.json({ error: "No products found" }, { status: 400 });
        return NextResponse.json({
          platform: "instagram",
          body: `${p.brand} ${p.name} 🔥\n¥${p.price_cny} (~€${eur(p.price_cny)})\n${p.views} people already checking this one out 👀\n\nCop through KakoBuy — link on murmreps.com (bio) 🛒\n\nWould you GL or RL? 🤔${igHashtags}`,
          contentType: "Single image post — product photo with price overlay",
        });
      }
      if (template === "reel-walkthrough") {
        return NextResponse.json({
          platform: "instagram",
          body: `POV: You discover the best rep finds site 😳🔥\n\n19,000+ products. 8 agents. Free link converter.\nmurmreps.com — link in bio 🛒\n\nSave this for your next haul 📌${igHashtags}`,
          contentType: "Reel — screen recording scrolling murmreps.com with trending audio",
        });
      }
      if (template === "story-poll") {
        const picks = dedupeByBrand(await queryTop(supabase, 20), 1, 2);
        const [a, b] = picks;
        if (!a || !b) return NextResponse.json({ error: "Not enough products" }, { status: 400 });
        return NextResponse.json({
          platform: "instagram",
          body: `Which one should I GP? 🤔\n\nOption A: ${a.name} — ¥${a.price_cny}\nOption B: ${b.name} — ¥${b.price_cny}\n\n[Add poll sticker with A / B]\n\nLink to both: murmreps.com`,
          contentType: "Story with poll sticker — show both product images side by side",
        });
      }
    }

    // ==================== DISCORD ====================
    if (platform === "discord") {
      if (template === "weekly-drops") {
        const picks = dedupeByBrand(await queryTop(supabase, 80), 2, 20);
        return NextResponse.json({
          platform: "discord",
          body: `🔥 **Weekly Finds Drop** 🔥\n\nHere are this week's top picks:\n${formatGroupedDiscord(picks)}\n\nBrowse all: <https://murmreps.com/products>\nNew to reps? Read our guide: <https://murmreps.com/guides/how-to-buy-reps-kakobuy>\n\nReact with 🔥 on the ones you're copping!`,
        });
      }
      if (template === "new-products") {
        const items = await queryNewest(supabase, 10);
        const list = items.map((p) => `• [${p.name}](https://murmreps.com/products/${p.id}) — ¥${p.price_cny} (${p.brand})`).join("\n");
        return NextResponse.json({
          platform: "discord",
          body: `📦 **New Products Just Added** 📦\n\n${items.length} new finds just dropped on the site:\n\n${list}\n\nCheck them all: <https://murmreps.com/products?sort=newest>`,
        });
      }
      if (template === "budget-alert") {
        const picks = dedupeByBrand(await queryBudget(supabase, 100, 30), 2, 10);
        const list = picks.map((p) => `• [${p.name}](https://murmreps.com/products/${p.id}) — **¥${p.price_cny}** (~€${eur(p.price_cny)})`).join("\n");
        return NextResponse.json({
          platform: "discord",
          body: `💰 **Budget Alert — Under ¥100** 💰\n\nInsane prices on these:\n\n${list}\n\nFull budget list: <https://murmreps.com/guides/budget-finds>`,
        });
      }
      if (template === "girls-drop") {
        const picks = dedupeByBrand(await queryGirls(supabase, 30), 2, 10);
        const list = picks.map((p) => `• [${p.name}](https://murmreps.com/products/${p.id}) — ¥${p.price_cny}`).join("\n");
        return NextResponse.json({
          platform: "discord",
          body: `🎀 **Girls Collection Update** 🎀\n\nNew women's finds just added:\n\n${list}\n\nBrowse all 2,500+ women's finds: <https://murmreps.com/girls>`,
        });
      }
      if (template === "welcome") {
        return NextResponse.json({
          platform: "discord",
          body: `👋 **Welcome to MurmReps!**\n\nWe're a community of rep enthusiasts with 19,000+ curated finds.\n\n**Quick links:**\n🛍️ Browse products: <https://murmreps.com/products>\n👜 Girls collection: <https://murmreps.com/girls>\n📖 How to buy guide: <https://murmreps.com/guides/how-to-buy-reps-kakobuy>\n🔗 Link converter: <https://murmreps.com/converter>\n📱 TikTok: @murmreps\n📸 Instagram: @murmreps\n\nNew drops posted daily. React with 🔥 on finds you like!`,
        });
      }
    }

    return NextResponse.json({ error: "Unknown platform/template" }, { status: 400 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
