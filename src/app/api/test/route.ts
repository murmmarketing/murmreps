import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error, count } = await supabase
      .from("products")
      .select("id, name, category", { count: "exact" })
      .limit(3);

    return NextResponse.json({
      success: !error,
      count,
      sample: data?.map((p) => ({ id: p.id, name: p.name, category: p.category })),
      error: error?.message || null,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "missing",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "missing",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
