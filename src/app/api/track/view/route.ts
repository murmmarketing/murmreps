import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { productId, pagePath } = await req.json();

    await supabase.from("page_views").insert({
      product_id: productId ? Number(productId) : null,
      page_path: pagePath || null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
