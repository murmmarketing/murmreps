import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  if (pw !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;
  const supabase = getAdminClient();
  const { data } = await supabase.from("blog_posts").select("*").order("published_at", { ascending: false });
  return NextResponse.json({ posts: data || [] });
}

export async function POST(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const supabase = getAdminClient();

    if (body.action === "auto-generate") {
      // Auto-generate weekly drops post
      const { data: products } = await supabase
        .from("products")
        .select("id, name, brand, price_cny, image, category, views")
        .not("image", "is", null).neq("image", "")
        .order("views", { ascending: false })
        .limit(10);

      const items = products || [];
      const now = new Date();
      const dateRange = `${new Date(now.getTime() - 7 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      const slug = `top-finds-${now.toISOString().split("T")[0]}`;
      const title = `Top Finds This Week — ${dateRange}`;

      let content = `Here are this week's most viewed products on MurmReps. Every item has been handpicked and verified by the community.\n\n`;
      for (const p of items) {
        content += `## ${p.brand} ${p.name}\n\n`;
        content += `**Price:** ¥${p.price_cny || "Multi"} | **Category:** ${p.category} | **Views:** ${p.views}\n\n`;
        content += `[View on MurmReps →](https://murmreps.com/products/${p.id})\n\n---\n\n`;
      }
      content += `Browse all 15,000+ finds at [murmreps.com](https://murmreps.com).\n`;

      const { error } = await supabase.from("blog_posts").insert({
        slug, title, content,
        excerpt: `The ${items.length} most popular finds from this week, featuring ${items.slice(0, 3).map((p) => p.brand).join(", ")}, and more.`,
        thumbnail_url: items[0]?.image || null,
        category: "weekly-drops",
        is_published: false,
      });

      if (error) throw error;
      return NextResponse.json({ success: true, slug });
    }

    // Regular save/update
    const { id, ...postData } = body;
    if (!postData.slug || !postData.title) return NextResponse.json({ error: "Slug and title required" }, { status: 400 });

    if (id) {
      await supabase.from("blog_posts").update(postData).eq("id", id);
    } else {
      await supabase.from("blog_posts").insert(postData);
    }
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;
  const { id } = await req.json();
  const supabase = getAdminClient();
  await supabase.from("blog_posts").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
