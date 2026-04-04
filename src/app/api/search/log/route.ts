import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { query, resultsCount } = await req.json();
    if (!query || typeof query !== "string" || query.length < 2 || query.length > 100) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }
    await supabase.from("search_queries").insert({ query: query.trim().toLowerCase(), results_count: resultsCount || 0 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
