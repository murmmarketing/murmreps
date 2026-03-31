import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

function checkAuth(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;

  try {
    const { category, excludeIds } = await req.json();
    if (!category) {
      return NextResponse.json({ error: "Category required" }, { status: 400 });
    }

    const supabase = getAdminClient();

    const query = supabase
      .from("products")
      .select("id, name, brand, price_cny, image, category")
      .eq("category", category)
      .not("image", "is", null)
      .neq("image", "")
      .neq("brand", "Various")
      .gt("views", 0)
      .order("score", { ascending: false })
      .limit(60);

    if (excludeIds && excludeIds.length > 0) {
      // Supabase doesn't have a direct "not in" for arrays easily,
      // so we filter client-side
    }

    const { data } = await query;
    let products = (data || []) as { id: number; name: string; brand: string; price_cny: number; image: string; category: string }[];

    if (excludeIds && excludeIds.length > 0) {
      products = products.filter((p) => !excludeIds.includes(p.id));
    }

    // Shuffle and take 10
    for (let i = products.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [products[i], products[j]] = [products[j], products[i]];
    }

    return NextResponse.json({ products: products.slice(0, 10) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
