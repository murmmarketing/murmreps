import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  const [visitRes, convertRes] = await Promise.all([
    supabase.from("referral_visits").select("*", { count: "exact", head: true }).eq("ref_code", code),
    supabase.from("referral_visits").select("*", { count: "exact", head: true }).eq("ref_code", code).eq("converted", true),
  ]);

  return NextResponse.json({ visits: visitRes.count || 0, conversions: convertRes.count || 0 });
}
