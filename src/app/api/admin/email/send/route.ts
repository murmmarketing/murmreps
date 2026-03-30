import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getAdminClient } from '@/lib/supabase';

function checkAuth(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;

  try {
    const { subject, html, audience, testEmail } = await req.json();

    if (!subject || !html) {
      return NextResponse.json({ error: 'Subject and HTML required' }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const supabase = getAdminClient();

    // Test mode: send to single address
    if (testEmail) {
      await resend.emails.send({
        from: 'MurmReps <noreply@murmreps.com>',
        to: testEmail,
        subject,
        html,
      });
      return NextResponse.json({ sent: 1, errors: 0, test: true });
    }

    // Fetch subscribers based on audience
    let query = supabase
      .from('newsletter_subscribers')
      .select('email')
      .is('unsubscribed_at', null);

    if (audience === 'this_week') {
      query = query.gte('subscribed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    } else if (audience === 'this_month') {
      query = query.gte('subscribed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    }

    const { data: subscribers } = await query;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: 'No subscribers found' }, { status: 400 });
    }

    // Send in batches of 50
    let sent = 0;
    let errors = 0;

    for (let i = 0; i < subscribers.length; i += 50) {
      const batch = subscribers.slice(i, i + 50);
      try {
        await resend.batch.send(
          batch.map((sub) => ({
            from: 'MurmReps <noreply@murmreps.com>',
            to: sub.email,
            subject,
            html: html.replace(/\{\{email\}\}/g, encodeURIComponent(sub.email)),
          }))
        );
        sent += batch.length;
      } catch {
        errors += batch.length;
      }
    }

    // Log campaign
    await supabase.from('email_campaigns').insert({
      subject,
      audience: audience || 'all',
      sent_count: sent,
      error_count: errors,
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({ sent, errors });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
