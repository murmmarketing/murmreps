import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

function checkAuth(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;

  try {
    const supabase = getAdminClient();
    const { data: campaigns } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50);

    return NextResponse.json({ campaigns: campaigns || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
