import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { reviewId } = await req.json();
    if (!reviewId) return NextResponse.json({ error: "reviewId required" }, { status: 400 });

    const { data: review } = await supabase
      .from("product_reviews")
      .select("helpful_count")
      .eq("id", reviewId)
      .single();

    if (review) {
      await supabase
        .from("product_reviews")
        .update({ helpful_count: (review.helpful_count || 0) + 1 })
        .eq("id", reviewId);
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
