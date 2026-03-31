import { NextRequest, NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";

function checkAuth(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

interface ProductInput {
  id: number;
  name: string;
  brand: string;
  category: string;
}

const TOP_CATS = ["Shirts", "Tops", "Hoodies", "Sweaters", "Long Sleeves", "Jerseys", "Polos", "Tank Tops"];
const BOTTOM_CATS = ["Pants", "Shorts"];
const SHOE_CATS = ["Shoes", "Boots", "Slides & Sandals"];
const OUTERWEAR_CATS = ["Jackets"];
const ACC_CATS = [
  "Accessories", "Hats & Caps", "Belts", "Sunglasses", "Glasses",
  "Necklaces", "Bracelets", "Earrings", "Rings", "Watches",
  "Bags", "Wallets", "Scarves & Gloves", "Socks & Underwear", "Phone Cases",
  "Jewelry",
];

function getCategoryDesc(p: ProductInput): string {
  const n = p.name.toLowerCase();
  if (n.includes("hoodie") || n.includes("hoody")) return "hoodie";
  if (n.includes("sweater") || n.includes("knit") || n.includes("cardigan")) return "sweater";
  if (n.includes("crewneck") || n.includes("sweatshirt")) return "crewneck sweatshirt";
  if (n.includes("polo")) return "polo shirt";
  if (n.includes("jersey")) return "jersey";
  if (n.includes("jacket") || n.includes("bomber") || n.includes("windbreaker")) return "jacket";
  if (n.includes("blazer")) return "blazer";
  if (n.includes("coat") || n.includes("puffer") || n.includes("parka")) return "puffer jacket";
  if (n.includes("shorts")) return "shorts";
  if (n.includes("jeans") || n.includes("denim")) return "jeans";
  if (n.includes("cargo")) return "cargo pants";
  if (n.includes("pants") || n.includes("trousers") || n.includes("chino")) return "pants";
  if (n.includes("jogger") || n.includes("sweatpant")) return "sweatpants";
  if (n.includes("tracksuit")) return "tracksuit pants";
  if (n.includes("air force") || n.includes("dunk") || n.includes("jordan") || n.includes("sneaker")) return "sneakers";
  if (n.includes("boot") || n.includes("chelsea")) return "boots";
  if (n.includes("slide") || n.includes("sandal") || n.includes("slipper")) return "slides";
  if (n.includes("loafer")) return "loafers";
  if (n.includes("cap") || n.includes("hat")) return "cap";
  if (n.includes("beanie")) return "beanie";
  if (n.includes("belt")) return "belt";
  if (n.includes("watch")) return "wristwatch";
  if (n.includes("sunglass")) return "sunglasses";
  if (n.includes("necklace") || n.includes("chain") || n.includes("pendant")) return "chain necklace";
  if (n.includes("bracelet")) return "bracelet";
  if (n.includes("ring")) return "ring";
  if (n.includes("earring")) return "earrings";
  if (n.includes("bag") || n.includes("backpack") || n.includes("tote")) return "bag";
  if (n.includes("wallet") || n.includes("card holder")) return "wallet";
  if (n.includes("scarf")) return "scarf";
  if (n.includes("sock")) return "socks";
  if (n.includes("perfume") || n.includes("cologne") || n.includes("fragrance")) return "perfume bottle";
  if (n.includes("t-shirt") || n.includes("tshirt") || n.includes("tee")) return "t-shirt";
  if (n.includes("shirt")) return "shirt";
  return p.name;
}

function getColorFromName(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("black")) return "Black color.";
  if (n.includes("white")) return "White color.";
  if (n.includes("grey") || n.includes("gray")) return "Grey color.";
  if (n.includes("navy")) return "Navy blue color.";
  if (n.includes("red")) return "Red color.";
  if (n.includes("green") || n.includes("olive")) return "Green color.";
  if (n.includes("blue")) return "Blue color.";
  if (n.includes("beige") || n.includes("cream") || n.includes("tan") || n.includes("khaki")) return "Beige/cream color.";
  if (n.includes("pink")) return "Pink color.";
  if (n.includes("brown")) return "Brown color.";
  if (n.includes("purple")) return "Purple color.";
  if (n.includes("orange")) return "Orange color.";
  if (n.includes("yellow")) return "Yellow color.";
  return "";
}

function buildFlatLayPrompt(
  products: ProductInput[],
  settings: { surface: string; vibe: string }
): string {
  const top = products.find((p) => TOP_CATS.includes(p.category));
  const bottom = products.find((p) => BOTTOM_CATS.includes(p.category));
  const shoes = products.find((p) => SHOE_CATS.includes(p.category));
  const outerwear = products.find((p) => OUTERWEAR_CATS.includes(p.category));
  const accessories = products.filter((p) => ACC_CATS.includes(p.category));
  const usedIds = new Set([top, bottom, shoes, outerwear, ...accessories].filter(Boolean).map((p) => p!.id));
  const other = products.filter((p) => !usedIds.has(p.id));

  const surfaceMap: Record<string, string> = {
    "grey carpet": "light grey textured plush carpet",
    "beige carpet": "warm beige soft carpet",
    "cream carpet": "cream colored plush carpet",
    "dark grey carpet": "charcoal dark grey carpet",
    "white marble": "white marble surface with subtle grey veins",
    "light wood floor": "light natural oak hardwood floor",
    "dark wood floor": "dark walnut hardwood floor",
    "white bedsheet": "clean white cotton bedsheet with subtle wrinkles",
  };
  const surface = surfaceMap[settings.surface] || "light grey textured plush carpet";

  const vibeMap: Record<string, string> = {
    "streetwear": "casual streetwear, relaxed urban aesthetic",
    "old money quiet luxury": "old money quiet luxury, muted elegant tones, premium fabrics",
    "dark aesthetic": "dark monochrome aesthetic, all black and dark grey tones",
    "hypebeast": "hypebeast maximalist style, bold logos and statement pieces",
    "summer casual": "summer casual, light breathable fabrics, relaxed fit",
    "women's luxury": "feminine luxury, elegant designer pieces, soft tones",
    "minimalist": "minimalist clean aesthetic, neutral tones, simple lines",
  };
  const vibeDesc = vibeMap[settings.vibe] || "casual streetwear";

  let prompt = `Overhead top-down photograph of a ${vibeDesc} outfit neatly arranged on ${surface}. Shot with an iPhone in a bedroom, natural soft window lighting from the left side, gentle realistic shadows underneath each item. Warm slightly desaturated color tones. Ultra realistic photograph, high resolution detail.\n\n`;

  prompt += "Precise layout arrangement:\n";

  if (outerwear) {
    const desc = getCategoryDesc(outerwear);
    const brand = outerwear.brand !== "Various" ? outerwear.brand + " " : "";
    prompt += `- CENTER-LEFT: A ${brand}${desc} unfolded and laid flat, showing the front design. ${getColorFromName(outerwear.name)}\n`;
  }

  if (top) {
    const desc = getCategoryDesc(top);
    const brand = top.brand !== "Various" ? top.brand + " " : "";
    const pos = outerwear ? "CENTER, partially overlapping the jacket" : "CENTER";
    prompt += `- ${pos}: A ${brand}${desc} neatly folded showing the front logo/design clearly. ${getColorFromName(top.name)}\n`;
  }

  if (bottom) {
    const desc = getCategoryDesc(bottom);
    const brand = bottom.brand !== "Various" ? bottom.brand + " " : "";
    prompt += `- RIGHT SIDE: ${brand}${desc} folded lengthwise, placed parallel next to the top. ${getColorFromName(bottom.name)}\n`;
  }

  if (shoes) {
    const desc = getCategoryDesc(shoes);
    const brand = shoes.brand !== "Various" ? shoes.brand + " " : "";
    prompt += `- BOTTOM LEFT: A pair of ${brand}${desc}, placed at a slight 30-degree angle, one shoe slightly overlapping the other. ${getColorFromName(shoes.name)}\n`;
  }

  const accPositions = [
    "TOP RIGHT CORNER",
    "TOP CENTER-RIGHT, near the collar area of the top",
    "RIGHT SIDE, between the top and the bottom",
  ];
  accessories.slice(0, 3).forEach((acc, i) => {
    const desc = getCategoryDesc(acc);
    const brand = acc.brand !== "Various" ? acc.brand + " " : "";
    prompt += `- ${accPositions[i]}: ${brand}${desc}. ${getColorFromName(acc.name)}\n`;
  });

  other.forEach((item) => {
    const desc = getCategoryDesc(item);
    const brand = item.brand !== "Various" ? item.brand + " " : "";
    prompt += `- NEARBY: ${brand}${desc}. ${getColorFromName(item.name)}\n`;
  });

  prompt += `\nItems are evenly spaced with 2-3 inch gaps between each piece. Everything is perfectly flat, no wrinkles. No person, no mannequin, no hangers, no background clutter. Just the clothing items on the ${surface}. This is a REAL photograph taken with an iPhone, NOT a digital mockup, NOT a collage of product images, NOT a composite image. It looks exactly like a photo someone took of clothes they laid out on their bedroom floor before getting dressed.`;

  return prompt;
}

const dimensionMap: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "9:16": { width: 768, height: 1344 },
  "4:5": { width: 896, height: 1120 },
};

const qualityMap: Record<string, { steps: number; guidance: number }> = {
  quick: { steps: 20, guidance: 5 },
  standard: { steps: 28, guidance: 7.5 },
  maximum: { steps: 40, guidance: 9 },
};

export async function POST(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;

  try {
    const { products, surface, vibe, ratio, quality } = await req.json();

    const productList = (products as ProductInput[]) || [];
    if (productList.length === 0) {
      return NextResponse.json({ error: "No products selected" }, { status: 400 });
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: "FAL_KEY not configured" }, { status: 500 });
    }

    fal.config({ credentials: process.env.FAL_KEY });

    const prompt = buildFlatLayPrompt(productList, {
      surface: surface || "grey carpet",
      vibe: vibe || "streetwear",
    });

    const { width, height } = dimensionMap[ratio] || dimensionMap["1:1"];
    const { steps, guidance } = qualityMap[quality] || qualityMap["standard"];

    // Try models in order: flux-pro, flux-dev, flux-schnell
    const models = [
      "fal-ai/flux-pro/v1.1",
      "fal-ai/flux/dev",
      "fal-ai/flux/schnell",
    ];

    for (const model of models) {
      try {
        const input: Record<string, unknown> = {
          prompt,
          image_size: { width, height },
          num_inference_steps: steps,
          num_images: 1,
        };

        // flux-pro supports guidance_scale and safety_tolerance
        if (model.includes("flux-pro")) {
          input.guidance_scale = guidance;
          input.safety_tolerance = "6";
        }
        // flux-dev supports guidance_scale
        if (model.includes("flux/dev")) {
          input.guidance_scale = guidance;
        }
        // flux-schnell only needs steps (max 4 for schnell)
        if (model.includes("schnell")) {
          input.num_inference_steps = 4;
        }

        const result = (await fal.subscribe(model, { input })) as {
          images?: { url: string }[];
        };

        const imageUrl = result.images?.[0]?.url;
        if (imageUrl) {
          return NextResponse.json({
            imageUrl,
            prompt,
            model,
            mode: "text-to-image",
          });
        }
      } catch (e) {
        console.error(`Model ${model} failed:`, e);
        continue;
      }
    }

    return NextResponse.json({ error: "All generation models failed" }, { status: 500 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
