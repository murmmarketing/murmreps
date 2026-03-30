import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

function checkAuth(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;

  const q = req.nextUrl.searchParams.get("q") || "";
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const supabase = getAdminClient();
    const { data } = await supabase
      .from("products")
      .select("id, name, brand, price_cny, image, category")
      .not("image", "is", null)
      .neq("image", "")
      .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
      .order("score", { ascending: false })
      .limit(12);

    return NextResponse.json(data || []);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
