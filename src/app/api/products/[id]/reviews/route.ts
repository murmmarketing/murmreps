import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip + "murmreps-salt").digest("hex");
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const limit = 10;
  const offset = (page - 1) * limit;

  const { data, count } = await supabase
    .from("product_reviews")
    .select("*", { count: "exact" })
    .eq("product_id", parseInt(id))
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return NextResponse.json({ reviews: data || [], total: count || 0 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = parseInt(id);

  try {
    const { rating, comment, nickname } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }
    if (comment && comment.length > 500) {
      return NextResponse.json({ error: "Comment max 500 chars" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";
    const ipHash = hashIp(ip);

    // Rate limit: 1 review per product per IP
    const { data: existing } = await supabase
      .from("product_reviews")
      .select("id")
      .eq("product_id", productId)
      .eq("ip_hash", ipHash)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "You already reviewed this product" }, { status: 429 });
    }

    // Insert review
    const { error: insertError } = await supabase.from("product_reviews").insert({
      product_id: productId,
      rating,
      comment: comment || null,
      nickname: (nickname || "Anonymous").slice(0, 30),
      ip_hash: ipHash,
    });

    if (insertError) throw insertError;

    // Recalculate avg_rating and review_count
    const { data: stats } = await supabase
      .from("product_reviews")
      .select("rating")
      .eq("product_id", productId);

    if (stats && stats.length > 0) {
      const avg = stats.reduce((s, r) => s + r.rating, 0) / stats.length;
      await supabase.from("products").update({
        avg_rating: parseFloat(avg.toFixed(1)),
        review_count: stats.length,
      }).eq("id", productId);
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
