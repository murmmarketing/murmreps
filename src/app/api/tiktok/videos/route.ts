import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const adminPassword = req.headers.get("x-admin-password");
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getAdminClient();
    const { data: conn } = await supabase
      .from("tiktok_connections")
      .select("*")
      .eq("id", "default")
      .single();

    if (!conn) {
      return NextResponse.json({ connected: false });
    }

    // Check if token needs refresh
    const expiresAt = new Date(conn.expires_at).getTime();
    if (Date.now() > expiresAt - 5 * 60 * 1000 && conn.refresh_token) {
      const clientKey = process.env.TIKTOK_CLIENT_KEY!;
      const clientSecret = process.env.TIKTOK_CLIENT_SECRET!;

      const refreshRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: conn.refresh_token,
        }),
      });

      const refreshData = await refreshRes.json();
      if (refreshData.access_token) {
        conn.access_token = refreshData.access_token;
        await supabase
          .from("tiktok_connections")
          .update({
            access_token: refreshData.access_token,
            refresh_token: refreshData.refresh_token || conn.refresh_token,
            expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", "default");
      }
    }

    const fields = [
      "id",
      "title",
      "video_description",
      "duration",
      "cover_image_url",
      "share_url",
      "view_count",
      "like_count",
      "comment_count",
      "share_count",
      "create_time",
    ];

    const maxCount = req.nextUrl.searchParams.get("max") || "20";

    const res = await fetch("https://open.tiktokapis.com/v2/video/list/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${conn.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        max_count: parseInt(maxCount, 10),
        fields: fields,
      }),
    });

    const data = await res.json();

    if (data.error?.code) {
      return NextResponse.json({
        connected: true,
        error: data.error.message || "Failed to fetch videos",
      });
    }

    return NextResponse.json({
      connected: true,
      videos: data.data?.videos || [],
      has_more: data.data?.has_more || false,
      cursor: data.data?.cursor,
    });
  } catch (err) {
    return NextResponse.json({ connected: false, error: String(err) }, { status: 500 });
  }
}
