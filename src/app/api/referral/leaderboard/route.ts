import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET() {
  // Get all referrers with their conversion counts
  const { data: referrers } = await supabase.from("referrers").select("nickname, ref_code");
  if (!referrers || referrers.length === 0) return NextResponse.json({ leaderboard: [] });

  const results = await Promise.all(
    referrers.map(async (r) => {
      const { count } = await supabase.from("referral_visits").select("*", { count: "exact", head: true }).eq("ref_code", r.ref_code).eq("converted", true);
      return { nickname: r.nickname, conversions: count || 0 };
    })
  );

  const sorted = results.filter((r) => r.conversions > 0).sort((a, b) => b.conversions - a.conversions).slice(0, 10);
  return NextResponse.json({ leaderboard: sorted });
}
