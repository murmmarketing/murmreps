import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/products — public product listing
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "24");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const tier = searchParams.get("tier") || "";
  const quality = searchParams.get("quality") || "";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") || "score";
  const order = searchParams.get("order") || "desc";

  let query = supabase.from("products").select("*", { count: "exact" })
    .not("image", "is", null)
    .neq("image", "");

  if (search) {
    query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
  }
  if (category) {
    query = query.eq("category", category);
  }
  if (tier) {
    query = query.eq("tier", tier);
  }
  if (quality) {
    query = query.eq("quality", quality);
  }
  if (minPrice) {
    query = query.gte("price_cny", parseFloat(minPrice));
  }
  if (maxPrice) {
    query = query.lte("price_cny", parseFloat(maxPrice));
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .order(sort, { ascending: order === "asc" })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    products: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
