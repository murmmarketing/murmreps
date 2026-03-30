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

  try {
    const supabase = getAdminClient();

    const [totalRes, imagesRes, girlsRes, subsRes, campaignRes, recentSubsRes, recentProductsRes] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).not("image", "is", null).neq("image", ""),
      supabase.from("products").select("*", { count: "exact", head: true }).in("collection", ["girls", "both"]),
      supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).is("unsubscribed_at", null),
      supabase.from("email_campaigns").select("*", { count: "exact", head: true }),
      supabase.from("newsletter_subscribers").select("email, subscribed_at").is("unsubscribed_at", null).order("subscribed_at", { ascending: false }).limit(3),
      supabase.from("products").select("id, name, brand, created_at").order("created_at", { ascending: false }).limit(3),
    ]);

    return NextResponse.json({
      totalProducts: totalRes.count || 0,
      withImages: imagesRes.count || 0,
      girlsProducts: girlsRes.count || 0,
      subscribers: subsRes.count || 0,
      campaigns: campaignRes.count || 0,
      recentSubscribers: recentSubsRes.data || [],
      recentProducts: recentProductsRes.data || [],
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
