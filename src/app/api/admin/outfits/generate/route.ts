import { NextRequest, NextResponse } from "next/server";

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
  image: string;
}

const TOP_CATS = ["Shirts", "Tops", "Hoodies", "Sweaters", "Long Sleeves", "Jerseys", "Polos", "Tank Tops"];
const BOTTOM_CATS = ["Pants", "Shorts"];
const SHOE_CATS = ["Shoes", "Boots", "Slides & Sandals"];
const OUTERWEAR_CATS = ["Jackets"];
const ACC_CATS = [
  "Accessories", "Hats & Caps", "Belts", "Sunglasses", "Glasses",
  "Necklaces", "Bracelets", "Earrings", "Rings", "Watches",
  "Bags", "Wallets", "Scarves & Gloves", "Socks & Underwear", "Phone Cases", "Jewelry",
];

function buildFlatLayPrompt(products: ProductInput[], settings: { surface: string; vibe: string }): string {
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

  let prompt = `Create a top-down overhead flat-lay photograph of these clothing items arranged neatly on ${surface}. Natural soft window lighting from the left side with gentle shadows. Warm slightly desaturated color tones like an iPhone photo taken in a bedroom. ${vibeDesc} outfit.\n\n`;

  prompt += "Arrange the items in this exact layout:\n";

  const mainPiece = outerwear || top;
  if (mainPiece) {
    const brand = mainPiece.brand !== "Various" ? mainPiece.brand + " " : "";
    prompt += `- The ${brand}${mainPiece.name} folded neatly in the CENTER, showing the front design and logo clearly\n`;
  }
  if (top && outerwear) {
    const brand = top.brand !== "Various" ? top.brand + " " : "";
    prompt += `- The ${brand}${top.name} partially visible under the jacket, showing collar/neckline\n`;
  }
  if (bottom) {
    const brand = bottom.brand !== "Various" ? bottom.brand + " " : "";
    prompt += `- The ${brand}${bottom.name} folded lengthwise to the RIGHT of the top piece\n`;
  }
  if (shoes) {
    const brand = shoes.brand !== "Various" ? shoes.brand + " " : "";
    prompt += `- The ${brand}${shoes.name} pair placed BOTTOM LEFT, angled at 30 degrees with one shoe slightly overlapping the other\n`;
  }

  const positions = ["TOP RIGHT corner", "near the TOP CENTER-RIGHT", "RIGHT SIDE between the top and pants"];
  accessories.slice(0, 3).forEach((acc, i) => {
    const brand = acc.brand !== "Various" ? acc.brand + " " : "";
    prompt += `- The ${brand}${acc.name} placed at the ${positions[i]}\n`;
  });

  other.forEach((item) => {
    const brand = item.brand !== "Various" ? item.brand + " " : "";
    prompt += `- The ${brand}${item.name} placed nearby\n`;
  });

  prompt += `\nAll items spaced evenly with small gaps between them. Everything perfectly flat, no wrinkles. This should look exactly like a real photo someone took of clothes they laid out on their floor — natural, casual, not a studio shot. The brand logos and text on the items must be clearly readable and accurate. No person, no mannequin, no hangers.`;

  return prompt;
}

const FAL_BASE = "https://queue.fal.run";

async function falRequest(endpoint: string, body: Record<string, unknown>): Promise<Response> {
  return fetch(`${FAL_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${process.env.FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function pollForResult(
  endpoint: string,
  requestId: string
): Promise<{ url: string } | null> {
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const statusRes = await fetch(`${FAL_BASE}/${endpoint}/requests/${requestId}/status`, {
      headers: { Authorization: `Key ${process.env.FAL_KEY}` },
    });
    const status = await statusRes.json();

    if (status.status === "COMPLETED") {
      const resultRes = await fetch(`${FAL_BASE}/${endpoint}/requests/${requestId}`, {
        headers: { Authorization: `Key ${process.env.FAL_KEY}` },
      });
      const result = await resultRes.json();
      const url = result.images?.[0]?.url;
      if (url) return { url };
      return null;
    }

    if (status.status === "FAILED") return null;
  }
  return null; // Timeout
}

async function tryGenerate(
  endpoint: string,
  body: Record<string, unknown>
): Promise<{ url: string; model: string } | null> {
  try {
    const res = await falRequest(endpoint, body);
    if (!res.ok) {
      console.error(`${endpoint} failed:`, await res.text());
      return null;
    }
    const result = await res.json();

    // Direct result
    if (result.images?.[0]?.url) {
      return { url: result.images[0].url, model: endpoint };
    }

    // Queued — poll
    if (result.request_id) {
      const polled = await pollForResult(endpoint, result.request_id);
      if (polled) return { ...polled, model: endpoint };
    }

    return null;
  } catch (e) {
    console.error(`${endpoint} error:`, e);
    return null;
  }
}

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

    const prompt = buildFlatLayPrompt(productList, {
      surface: surface || "grey carpet",
      vibe: vibe || "streetwear",
    });

    const aspectMap: Record<string, string> = {
      "1:1": "1:1",
      "9:16": "9:16",
      "4:5": "4:5",
    };
    const aspectRatio = aspectMap[ratio] || "1:1";

    const resolutionMap: Record<string, string> = {
      quick: "1K",
      standard: "2K",
      maximum: "2K",
    };
    const resolution = resolutionMap[quality] || "1K";

    // Collect valid product image URLs
    const imageUrls = productList
      .map((p) => p.image)
      .filter((url) => url && url.startsWith("http"))
      .slice(0, 14);

    const hasImages = imageUrls.length > 0;

    // Model chain: try edit endpoints (with images), then text-only fallbacks
    const baseBody = {
      prompt,
      num_images: 1,
      aspect_ratio: aspectRatio,
      output_format: "png",
      safety_tolerance: "6",
    };

    let result: { url: string; model: string } | null = null;

    if (hasImages) {
      // Try Nano Banana Pro edit (image-guided)
      result = await tryGenerate("fal-ai/nano-banana-pro/edit", {
        ...baseBody,
        image_urls: imageUrls,
        resolution,
      });

      // Fallback: Nano Banana 2 edit
      if (!result) {
        result = await tryGenerate("fal-ai/nano-banana-2/edit", {
          ...baseBody,
          image_urls: imageUrls,
          resolution: "1K",
        });
      }
    }

    // Text-only fallbacks
    if (!result) {
      result = await tryGenerate("fal-ai/nano-banana-pro", {
        ...baseBody,
        resolution,
      });
    }

    if (!result) {
      result = await tryGenerate("fal-ai/nano-banana-2", {
        ...baseBody,
        resolution: "1K",
      });
    }

    // Last resort: Flux Schnell via fal SDK
    if (!result) {
      try {
        const fal = await import("@fal-ai/serverless-client");
        fal.config({ credentials: process.env.FAL_KEY! });
        const fluxResult = (await fal.subscribe("fal-ai/flux/schnell", {
          input: {
            prompt,
            image_size: ratio === "9:16" ? { width: 768, height: 1344 }
              : ratio === "4:5" ? { width: 896, height: 1120 }
              : { width: 1024, height: 1024 },
            num_images: 1,
            num_inference_steps: 4,
          },
        })) as { images?: { url: string }[] };

        const url = fluxResult.images?.[0]?.url;
        if (url) result = { url, model: "fal-ai/flux/schnell" };
      } catch (e) {
        console.error("Flux schnell fallback failed:", e);
      }
    }

    if (!result) {
      return NextResponse.json({ error: "All generation models failed" }, { status: 500 });
    }

    return NextResponse.json({
      imageUrl: result.url,
      prompt,
      model: result.model,
      mode: hasImages && result.model.includes("edit") ? "image-guided" : "text-only",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
