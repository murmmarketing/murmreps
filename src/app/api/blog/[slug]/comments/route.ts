import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: post } = await supabase.from("blog_posts").select("id").eq("slug", slug).single();
  if (!post) return NextResponse.json({ comments: [] });

  const { data } = await supabase
    .from("blog_comments")
    .select("id, nickname, comment, created_at")
    .eq("post_id", post.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ comments: data || [] });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const { nickname, comment } = await req.json();
    if (!comment || comment.length < 1 || comment.length > 1000) {
      return NextResponse.json({ error: "Comment required (max 1000 chars)" }, { status: 400 });
    }

    const { data: post } = await supabase.from("blog_posts").select("id").eq("slug", slug).single();
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const ipHash = crypto.createHash("sha256").update(ip + "murmreps-blog-salt").digest("hex");

    // Rate limit: 1 comment per post per IP per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("blog_comments")
      .select("id")
      .eq("post_id", post.id)
      .eq("ip_hash", ipHash)
      .gte("created_at", oneHourAgo)
      .limit(1);

    if (recent && recent.length > 0) {
      return NextResponse.json({ error: "You already commented recently. Try again later." }, { status: 429 });
    }

    await supabase.from("blog_comments").insert({
      post_id: post.id,
      nickname: (nickname || "Anonymous").slice(0, 30),
      comment: comment.slice(0, 1000),
      ip_hash: ipHash,
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
