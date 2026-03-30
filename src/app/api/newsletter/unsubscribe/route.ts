import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');

  if (email) {
    const supabase = getAdminClient();
    await supabase
      .from('newsletter_subscribers')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('email', email);
  }

  return NextResponse.redirect(new URL('/?unsubscribed=true', req.url));
}
