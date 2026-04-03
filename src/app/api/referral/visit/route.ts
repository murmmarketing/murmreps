import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { ref_code } = await req.json();
    if (!ref_code || typeof ref_code !== "string" || ref_code.length > 10) {
      return NextResponse.json({ error: "Invalid ref_code" }, { status: 400 });
    }

    // Rate limit: max 1 visit per ref_code per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("referral_visits")
      .select("id")
      .eq("ref_code", ref_code)
      .gte("visited_at", oneHourAgo)
      .limit(1);

    // Simple throttle — if any visit for this code in the last hour, skip
    if (recent && recent.length > 0) {
      return NextResponse.json({ success: true }); // Silent success, don't reveal rate limit
    }

    await supabase.from("referral_visits").insert({ ref_code });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
