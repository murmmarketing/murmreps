import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

function checkAuth(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// PUT /api/admin/products/[id] — edit a product
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = checkAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("products")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", parseInt(params.id))
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] — delete a product
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = checkAuth(req);
  if (authError) return authError;

  try {
    const supabase = getAdminClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", parseInt(params.id));

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
