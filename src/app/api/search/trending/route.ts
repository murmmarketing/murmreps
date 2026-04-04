import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("search_queries")
      .select("query")
      .gte("searched_at", sevenDaysAgo);

    if (!data || data.length === 0) {
      // Fallback: hardcoded popular terms
      return NextResponse.json({ terms: ["Chrome Hearts", "Nike Dunk", "Balenciaga", "Stussy", "Jordan 4", "Supreme", "Louis Vuitton", "New Balance"] }, {
        headers: { "Cache-Control": "public, max-age=3600" },
      });
    }

    const counts: Record<string, number> = {};
    for (const row of data) {
      const t = row.query.toLowerCase().trim();
      counts[t] = (counts[t] || 0) + 1;
    }

    const terms = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([term]) => term.charAt(0).toUpperCase() + term.slice(1));

    return NextResponse.json({ terms }, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ terms: [] }, { status: 500 });
  }
}
