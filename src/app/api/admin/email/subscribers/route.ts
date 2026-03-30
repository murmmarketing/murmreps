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
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .order('subscribed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    const { data: subscribers, count } = await query;

    // Stats queries
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [activeRes, weekRes, monthRes, unsubRes] = await Promise.all([
      supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .is('unsubscribed_at', null),
      supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .is('unsubscribed_at', null)
        .gte('subscribed_at', oneWeekAgo),
      supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .is('unsubscribed_at', null)
        .gte('subscribed_at', oneMonthAgo),
      supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .not('unsubscribed_at', 'is', null),
    ]);

    return NextResponse.json({
      subscribers: subscribers || [],
      total: count || 0,
      totalActive: activeRes.count || 0,
      thisWeek: weekRes.count || 0,
      thisMonth: monthRes.count || 0,
      unsubscribed: unsubRes.count || 0,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
