import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

async function refreshTokenIfNeeded(supabase: ReturnType<typeof getAdminClient>) {
  const { data: conn } = await supabase
    .from("tiktok_connections")
    .select("*")
    .eq("id", "default")
    .single();

  if (!conn) return null;

  // Check if token is expired (with 5 min buffer)
  const expiresAt = new Date(conn.expires_at).getTime();
  const now = Date.now();

  if (now > expiresAt - 5 * 60 * 1000 && conn.refresh_token) {
    const clientKey = process.env.TIKTOK_CLIENT_KEY!;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET!;

    const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: conn.refresh_token,
      }),
    });

    const data = await res.json();
    if (data.access_token) {
      const newExpiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
      await supabase
        .from("tiktok_connections")
        .update({
          access_token: data.access_token,
          refresh_token: data.refresh_token || conn.refresh_token,
          expires_at: newExpiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "default");

      return { ...conn, access_token: data.access_token };
    }
  }

  return conn;
}

export async function GET(req: NextRequest) {
  const adminPassword = req.headers.get("x-admin-password");
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getAdminClient();
    const conn = await refreshTokenIfNeeded(supabase);

    if (!conn) {
      return NextResponse.json({ connected: false });
    }

    const fields = [
      "open_id",
      "union_id",
      "avatar_url",
      "display_name",
      "bio_description",
      "profile_deep_link",
      "is_verified",
      "follower_count",
      "following_count",
      "likes_count",
      "video_count",
    ];

    const res = await fetch(
      `https://open.tiktokapis.com/v2/user/info/?fields=${fields.join(",")}`,
      {
        headers: {
          Authorization: `Bearer ${conn.access_token}`,
        },
      }
    );

    const data = await res.json();

    if (data.error?.code) {
      return NextResponse.json({
        connected: true,
        error: data.error.message || "Failed to fetch profile",
      });
    }

    return NextResponse.json({
      connected: true,
      profile: data.data?.user,
    });
  } catch (err) {
    return NextResponse.json({ connected: false, error: String(err) }, { status: 500 });
  }
}
