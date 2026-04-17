import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

function checkAdmin(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  return pw === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const wantEntries = searchParams.get("entries") === "true";

  if (id && wantEntries) {
    if (!checkAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const admin = getAdminClient();
    const { data: entries } = await admin
      .from("giveaway_entries")
      .select("*")
      .eq("giveaway_id", id)
      .order("created_at", { ascending: false });
    return NextResponse.json({ entries: entries || [] });
  }

  const { data: giveaways } = await supabase
    .from("giveaways")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json({ giveaways: giveaways || [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.action === "create" || body.action === "pick_winner") {
    if (!checkAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const admin = getAdminClient();

    if (body.action === "create") {
      const { data, error } = await admin.from("giveaways").insert({
        title: body.title,
        description: body.description,
        prize_description: body.prize_description,
        prize_image_url: body.prize_image_url,
        end_date: body.end_date,
        entry_requirements: body.entry_requirements || [],
        is_active: true,
      }).select().single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ giveaway: data });
    }

    if (body.action === "pick_winner") {
      const { data: entries } = await admin
        .from("giveaway_entries")
        .select("*")
        .eq("giveaway_id", body.giveaway_id);

      if (!entries || entries.length === 0) {
        return NextResponse.json({ error: "No entries" }, { status: 400 });
      }

      const winner = entries[Math.floor(Math.random() * entries.length)];
      const winnerName = winner.discord_username || winner.email;

      await admin
        .from("giveaways")
        .update({ winner_name: winnerName, is_active: false })
        .eq("id", body.giveaway_id);

      return NextResponse.json({ winner: winnerName });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
