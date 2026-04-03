import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

function genCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { nickname, email } = await req.json();
    if (!nickname || nickname.length < 2) return NextResponse.json({ error: "Nickname required (2+ chars)" }, { status: 400 });

    const ref_code = genCode();
    const { error } = await supabase.from("referrers").insert({ nickname: nickname.slice(0, 30), email: email || null, ref_code });
    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "Code collision, try again" }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ ref_code });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
