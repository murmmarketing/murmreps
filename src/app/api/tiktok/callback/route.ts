import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    const errorDesc = req.nextUrl.searchParams.get("error_description") || "Authorization denied";
    return NextResponse.redirect(
      new URL(`/admin/marketing?tiktok_error=${encodeURIComponent(errorDesc)}`, req.url)
    );
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY!;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "https://murmreps.com"}/api/tiktok/callback/`;

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      const errMsg = tokenData.error_description || tokenData.error || "Token exchange failed";
      return NextResponse.redirect(
        new URL(`/admin/marketing?tiktok_error=${encodeURIComponent(errMsg)}`, req.url)
      );
    }

    const {
      access_token,
      refresh_token,
      open_id,
      expires_in,
    } = tokenData;

    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    // Store tokens in Supabase
    const supabase = getAdminClient();

    // Upsert — only one TikTok connection at a time
    const { error: dbError } = await supabase
      .from("tiktok_connections")
      .upsert(
        {
          id: "default",
          access_token,
          refresh_token,
          open_id,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (dbError) {
      return NextResponse.redirect(
        new URL(`/admin/marketing?tiktok_error=${encodeURIComponent("Database error: " + dbError.message)}`, req.url)
      );
    }

    return NextResponse.redirect(new URL("/admin/marketing?tiktok_connected=true", req.url));
  } catch (err) {
    return NextResponse.redirect(
      new URL(`/admin/marketing?tiktok_error=${encodeURIComponent(String(err))}`, req.url)
    );
  }
}
