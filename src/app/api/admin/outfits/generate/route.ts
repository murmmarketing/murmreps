import { NextRequest, NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";
import sharp from "sharp";

function checkAuth(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const dimensionMap: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "9:16": { width: 768, height: 1344 },
  "4:5": { width: 896, height: 1120 },
};

interface ProductInput {
  id: number;
  name: string;
  brand: string;
  image: string;
}

async function fetchImage(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://murmreps.com/",
      },
    });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

async function createProductCollage(
  products: ProductInput[]
): Promise<Buffer | null> {
  const tileSize = 512;
  const imageBuffers: Buffer[] = [];

  for (const p of products) {
    const raw = await fetchImage(p.image);
    if (!raw) continue;
    try {
      const resized = await sharp(raw)
        .resize(tileSize, tileSize, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toBuffer();
      imageBuffers.push(resized);
    } catch {
      // Skip images sharp can't process
    }
  }

  if (imageBuffers.length === 0) return null;

  const cols = Math.min(imageBuffers.length, 2);
  const rows = Math.ceil(imageBuffers.length / cols);
  const width = cols * tileSize;
  const height = rows * tileSize;

  const composites = imageBuffers.map((buf, i) => ({
    input: buf,
    left: (i % cols) * tileSize,
    top: Math.floor(i / cols) * tileSize,
  }));

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();
}

export async function POST(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;

  try {
    const { prompt, ratio, products, strength } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { error: "FAL_KEY not configured" },
        { status: 500 }
      );
    }

    fal.config({ credentials: process.env.FAL_KEY });

    const { width, height } = dimensionMap[ratio] || dimensionMap["1:1"];
    const productList = (products as ProductInput[]) || [];

    // Try image-to-image with product collage if products have images
    if (productList.length > 0) {
      const collageBuffer = await createProductCollage(productList);

      if (collageBuffer) {
        try {
          // Upload collage to fal.ai storage
          const blob = new Blob([new Uint8Array(collageBuffer)], { type: "image/png" });
          const file = new File([blob], "collage.png", { type: "image/png" });
          const collageUrl = await fal.storage.upload(file);

          // Use flux dev img2img with the collage as reference
          const result = (await fal.subscribe(
            "fal-ai/flux/dev/image-to-image",
            {
              input: {
                prompt,
                image_url: collageUrl,
                strength: strength ?? 0.75,
                image_size: { width, height },
                num_inference_steps: 28,
                guidance_scale: 3.5,
                num_images: 1,
              },
            }
          )) as { images?: { url: string }[] };

          const imageUrl = result.images?.[0]?.url;
          if (imageUrl) {
            return NextResponse.json({
              imageUrl,
              collageUrl,
              mode: "img2img",
            });
          }
        } catch (e) {
          console.error("img2img failed, falling back to text-only:", e);
        }
      }
    }

    // Fallback: text-only generation with flux pro
    const result = (await fal.subscribe("fal-ai/flux-pro/v1.1", {
      input: {
        prompt,
        image_size: { width, height },
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        safety_tolerance: "5",
      },
    })) as { images?: { url: string }[] };

    const imageUrl = result.images?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl, mode: "text-only" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
