import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { agent, productId } = await req.json();
    if (!agent) return NextResponse.json({ ok: false }, { status: 400 });

    await supabase.from("agent_clicks").insert({
      agent,
      product_id: productId ? Number(productId) : null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
