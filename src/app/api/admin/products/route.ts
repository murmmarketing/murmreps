import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

function checkAuth(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// POST /api/admin/products — add a product
export async function POST(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("products")
      .insert(body)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH /api/admin/products — bulk update fields for multiple products
export async function PATCH(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;

  try {
    const { ids, updates } = await req.json();
    if (!Array.isArray(ids) || !ids.length || !updates) {
      return NextResponse.json({ error: "ids[] and updates{} required" }, { status: 400 });
    }
    const supabase = getAdminClient();
    const { error, count } = await supabase
      .from("products")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .in("id", ids);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ updated: count ?? ids.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE (bulk) /api/admin/products — delete multiple products by ids
// Uses query param ?ids=1,2,3
export async function DELETE(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;

  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || !ids.length) {
      return NextResponse.json({ error: "ids[] required" }, { status: 400 });
    }
    const supabase = getAdminClient();
    const { error } = await supabase.from("products").delete().in("id", ids);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ deleted: ids.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET /api/admin/products — list with admin filters (also used as public API)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const tier = searchParams.get("tier") || "";
  const collection = searchParams.get("collection") || "";
  const sort = searchParams.get("sort") || "id";
  const order = searchParams.get("order") || "asc";

  const supabase = getAdminClient();
  let query = supabase.from("products").select("*", { count: "exact" });

  if (search) {
    query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
  }
  if (category) {
    query = query.eq("category", category);
  }
  if (tier) {
    query = query.eq("tier", tier);
  }
  if (collection) {
    if (collection === "main") {
      query = query.in("collection", ["main", "both"]);
    } else if (collection === "girls") {
      query = query.in("collection", ["girls", "both"]);
    } else {
      query = query.eq("collection", collection);
    }
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .order(sort, { ascending: order === "asc" })
    .range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    products: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
