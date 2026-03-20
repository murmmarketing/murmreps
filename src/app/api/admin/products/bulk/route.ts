import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

function checkAuth(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// POST /api/admin/products/bulk — bulk import products
export async function POST(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;

  try {
    const { products } = await req.json();

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Products array is required" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    let imported = 0;
    const errors: string[] = [];

    // Batch insert 100 at a time
    for (let i = 0; i < products.length; i += 100) {
      const batch = products.slice(i, i + 100).map(
        (p: Record<string, unknown>) => ({
          name: p.name || "Untitled",
          brand: p.brand || "Various",
          category: p.category || "Shoes",
          price_cny: p.price_cny || null,
          price_usd: p.price_usd || null,
          price_eur: p.price_eur || null,
          tier: p.tier || null,
          quality: p.quality || null,
          source_link: p.source_link || "",
          image: p.image || "",
          images: p.images || [],
          variants: p.variants || [],
          qc_photos: p.qc_photos || [],
          delivery_days: p.delivery_days || null,
          weight_g: p.weight_g || null,
          dimensions: p.dimensions || null,
          verified: p.verified || false,
          qc_rating: p.qc_rating || null,
        })
      );

      const { error } = await supabase.from("products").insert(batch);

      if (error) {
        errors.push(`Batch ${i}-${i + batch.length}: ${error.message}`);
      } else {
        imported += batch.length;
      }
    }

    return NextResponse.json({
      imported,
      total: products.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
