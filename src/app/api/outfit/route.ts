import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const COLS = "id, name, brand, category, price_cny, price_usd, price_eur, image, score, collection";

const STYLE_BRANDS: Record<string, string[]> = {
  streetwear: ["Stussy", "Nike", "Supreme", "Carhartt", "Corteiz", "BAPE", "Fear of God", "Essentials", "Jordan", "Gallery Dept"],
  dark: ["Rick Owens", "Balenciaga", "Chrome Hearts", "Raf Simons", "Undercover", "Maison Margiela"],
  oldmoney: ["Ralph Lauren", "Burberry", "Acne Studios", "Hermes", "New Balance", "Moncler", "Loewe"],
  hypebeast: ["Supreme", "Off-White", "BAPE", "Chrome Hearts", "Jordan", "Nike", "Balenciaga", "Dior"],
  summer: ["Nike", "Stussy", "Essentials", "Fear of God", "Adidas", "New Balance", "Jordan", "Ralph Lauren"],
  girls: ["Chanel", "Dior", "Vivienne Westwood", "Miu Miu", "Prada", "Louis Vuitton", "Hermes", "Balenciaga"],
};

const SLOTS: Record<string, { name: string; categories: string[] }[]> = {
  default: [
    { name: "top", categories: ["Hoodies", "Jackets", "Sweaters", "Shirts"] },
    { name: "bottom", categories: ["Pants", "Shorts"] },
    { name: "shoes", categories: ["Shoes", "Boots"] },
    { name: "headwear", categories: ["Hats & Caps"] },
    { name: "jewelry", categories: ["Necklaces", "Bracelets", "Rings", "Watches"] },
    { name: "bag", categories: ["Bags"] },
  ],
  summer: [
    { name: "top", categories: ["Shirts", "Polos", "Tank Tops", "Tops"] },
    { name: "bottom", categories: ["Shorts"] },
    { name: "shoes", categories: ["Slides & Sandals", "Shoes"] },
    { name: "headwear", categories: ["Hats & Caps", "Sunglasses"] },
    { name: "jewelry", categories: ["Necklaces", "Bracelets", "Watches"] },
    { name: "bag", categories: ["Bags"] },
  ],
  girls: [
    { name: "top", categories: ["Shirts", "Tops", "Sweaters", "Jackets"] },
    { name: "bottom", categories: ["Pants", "Shorts"] },
    { name: "shoes", categories: ["Shoes", "Boots", "Slides & Sandals"] },
    { name: "headwear", categories: ["Hats & Caps", "Sunglasses"] },
    { name: "jewelry", categories: ["Necklaces", "Earrings", "Bracelets", "Rings"] },
    { name: "bag", categories: ["Bags", "Wallets"] },
  ],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const style = searchParams.get("style") || "streetwear";
  const brand = searchParams.get("brand") || "";
  const reshuffle = searchParams.get("slot") || ""; // single slot to reshuffle

  const slots = SLOTS[style] || SLOTS.default;
  const brands = STYLE_BRANDS[style] || [];
  const isFullBrand = style === "fullbrand" && brand;

  // If reshuffling a single slot, only fetch that one
  const slotsToFetch = reshuffle ? slots.filter((s) => s.name === reshuffle) : slots;

  const results: Record<string, unknown> = {};

  await Promise.all(
    slotsToFetch.map(async (slot) => {
      let query = supabase
        .from("products")
        .select(COLS)
        .in("category", slot.categories)
        .not("image", "is", null)
        .neq("image", "")
        .gt("score", 25);

      if (isFullBrand) {
        query = query.ilike("brand", `%${brand}%`);
      } else if (brands.length > 0) {
        query = query.in("brand", brands);
      }

      if (style === "girls") {
        query = query.in("collection", ["girls", "both"]);
      }

      // Fetch a pool, then pick random
      query = query.order("score", { ascending: false }).limit(40);

      const { data } = await query;
      if (data && data.length > 0) {
        // Pick a random one from the pool
        const pick = data[Math.floor(Math.random() * data.length)];
        results[slot.name] = { ...pick, slot: slot.name };
      }
    })
  );

  return NextResponse.json({ style, items: results });
}
