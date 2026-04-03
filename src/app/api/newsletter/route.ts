import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: Request) {
  try {
    const { email, source, ref_code } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const supabase = getSupabase();
    const resend = getResend();

    // Save to Supabase
    const { error: dbError } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        { email, subscribed_at: new Date().toISOString(), source: source || 'popup' },
        { onConflict: 'email' }
      );

    if (dbError) throw dbError;

    // Send welcome email
    await resend.emails.send({
      from: 'MurmReps <noreply@murmreps.com>',
      to: email,
      subject: '🔥 Welcome to MurmReps — Your top picks inside',
      html: getWelcomeEmailHTML(email),
    });

    // Mark referral conversion if ref_code exists
    if (ref_code) {
      try {
        const { data: visit } = await supabase
          .from('referral_visits')
          .select('id')
          .eq('ref_code', ref_code)
          .eq('converted', false)
          .order('visited_at', { ascending: false })
          .limit(1)
          .single();
        if (visit) {
          await supabase.from('referral_visits').update({ converted: true }).eq('id', visit.id);
        }
      } catch { /* referral tracking is best-effort */ }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

function getWelcomeEmailHTML(email: string): string {
  const unsubUrl = `https://murmreps.com/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family:Arial,Helvetica,sans-serif; -webkit-font-smoothing:antialiased;">
  <div style="max-width:600px; margin:0 auto;">

    <!-- Spacer -->
    <div style="height:24px;"></div>

    <!-- Logo -->
    <div style="text-align:center; padding:32px 24px 24px;">
      <span style="font-size:28px; font-weight:800; letter-spacing:-0.5px;">
        <span style="color:#f97316;">M</span><span style="color:#ffffff;">urm</span><span style="color:#f97316;">Reps</span>
      </span>
    </div>

    <!-- Hero -->
    <div style="text-align:center; padding:40px 32px; background:linear-gradient(180deg, #111 0%, #0a0a0a 100%); border-radius:16px; margin:0 16px 24px;">
      <p style="color:#f97316; font-size:13px; text-transform:uppercase; letter-spacing:2px; margin:0 0 12px; font-weight:600;">Welcome to the family</p>
      <h1 style="color:#fff; font-size:32px; font-weight:800; margin:0 0 16px; line-height:1.2; letter-spacing:-0.5px;">You're in. 🔥</h1>
      <p style="color:#a1a1aa; font-size:15px; line-height:1.6; margin:0; max-width:400px; display:inline-block;">
        15,000+ finds. 8 shopping agents. Every product handpicked. Welcome to the rep community's most trusted source.
      </p>
    </div>

    <!-- Divider -->
    <div style="height:1px; background:#1a1a1a; margin:0 32px;"></div>

    <!-- Top Picks Header -->
    <div style="padding:32px 24px 16px;">
      <p style="color:#f97316; font-size:12px; text-transform:uppercase; letter-spacing:2px; margin:0 0 4px; font-weight:600;">Handpicked for you</p>
      <h2 style="color:#fff; font-size:22px; font-weight:700; margin:0; letter-spacing:-0.3px;">This week's hottest drops</h2>
    </div>

    <!-- Product Cards — 2 column grid -->
    <div style="padding:0 16px 8px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td width="50%" style="padding:8px;">
            <a href="https://murmreps.com/products" style="text-decoration:none; display:block;">
              <div style="background:#111; border-radius:12px; overflow:hidden;">
                <div style="background:#1a1a1a; height:160px; text-align:center; padding:12px;">
                  <span style="color:#333; font-size:48px;">👟</span>
                </div>
                <div style="padding:14px;">
                  <p style="color:#fff; font-size:14px; font-weight:600; margin:0 0 3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Air Max 95</p>
                  <p style="color:#52525b; font-size:12px; margin:0 0 8px;">Nike · 799 views</p>
                  <p style="color:#f97316; font-size:16px; font-weight:700; margin:0;">€21.05</p>
                </div>
              </div>
            </a>
          </td>
          <td width="50%" style="padding:8px;">
            <a href="https://murmreps.com/products" style="text-decoration:none; display:block;">
              <div style="background:#111; border-radius:12px; overflow:hidden;">
                <div style="background:#1a1a1a; height:160px; text-align:center; padding:12px;">
                  <span style="color:#333; font-size:48px;">🧥</span>
                </div>
                <div style="padding:14px;">
                  <p style="color:#fff; font-size:14px; font-weight:600; margin:0 0 3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Track Jacket</p>
                  <p style="color:#52525b; font-size:12px; margin:0 0 8px;">Balenciaga · 784 views</p>
                  <p style="color:#f97316; font-size:16px; font-weight:700; margin:0;">€33.56</p>
                </div>
              </div>
            </a>
          </td>
        </tr>
        <tr>
          <td width="50%" style="padding:8px;">
            <a href="https://murmreps.com/products" style="text-decoration:none; display:block;">
              <div style="background:#111; border-radius:12px; overflow:hidden;">
                <div style="background:#1a1a1a; height:160px; text-align:center; padding:12px;">
                  <span style="color:#333; font-size:48px;">🧶</span>
                </div>
                <div style="padding:14px;">
                  <p style="color:#fff; font-size:14px; font-weight:600; margin:0 0 3px;">Knit Hoodie</p>
                  <p style="color:#52525b; font-size:12px; margin:0 0 8px;">Chrome Hearts · 689 views</p>
                  <p style="color:#f97316; font-size:16px; font-weight:700; margin:0;">€10.48</p>
                </div>
              </div>
            </a>
          </td>
          <td width="50%" style="padding:8px;">
            <a href="https://murmreps.com/products" style="text-decoration:none; display:block;">
              <div style="background:#111; border-radius:12px; overflow:hidden;">
                <div style="background:#1a1a1a; height:160px; text-align:center; padding:12px;">
                  <span style="color:#333; font-size:48px;">👜</span>
                </div>
                <div style="padding:14px;">
                  <p style="color:#fff; font-size:14px; font-weight:600; margin:0 0 3px;">LV Sweater</p>
                  <p style="color:#52525b; font-size:12px; margin:0 0 8px;">Louis Vuitton · 609 views</p>
                  <p style="color:#f97316; font-size:16px; font-weight:700; margin:0;">€27.18</p>
                </div>
              </div>
            </a>
          </td>
        </tr>
      </table>
    </div>

    <!-- CTA Button -->
    <div style="text-align:center; padding:8px 24px 32px;">
      <a href="https://murmreps.com/products" style="display:inline-block; background:#f97316; color:#fff; padding:14px 40px; border-radius:10px; text-decoration:none; font-weight:700; font-size:15px; letter-spacing:0.3px;">
        Browse all finds →
      </a>
    </div>

    <!-- Divider -->
    <div style="height:1px; background:#1a1a1a; margin:0 32px;"></div>

    <!-- How to Buy Header -->
    <div style="padding:32px 24px 16px;">
      <p style="color:#f97316; font-size:12px; text-transform:uppercase; letter-spacing:2px; margin:0 0 4px; font-weight:600;">Getting started</p>
      <h2 style="color:#fff; font-size:22px; font-weight:700; margin:0; letter-spacing:-0.3px;">Your first haul in 3 steps</h2>
    </div>

    <!-- Steps -->
    <div style="padding:0 24px 32px;">
      <div style="background:#111; border-radius:12px; padding:20px; margin-bottom:12px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="48" style="vertical-align:top;">
              <div style="background:#f97316; color:#fff; width:36px; height:36px; border-radius:10px; text-align:center; line-height:36px; font-weight:800; font-size:16px;">1</div>
            </td>
            <td style="vertical-align:top; padding-left:14px;">
              <p style="color:#fff; font-size:15px; font-weight:600; margin:0 0 4px;">Find something you love</p>
              <p style="color:#a1a1aa; font-size:13px; line-height:1.5; margin:0;">Browse 15,000+ products on MurmReps. Use filters to find your style.</p>
            </td>
          </tr>
        </table>
      </div>

      <div style="background:#111; border-radius:12px; padding:20px; margin-bottom:12px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="48" style="vertical-align:top;">
              <div style="background:#f97316; color:#fff; width:36px; height:36px; border-radius:10px; text-align:center; line-height:36px; font-weight:800; font-size:16px;">2</div>
            </td>
            <td style="vertical-align:top; padding-left:14px;">
              <p style="color:#fff; font-size:15px; font-weight:600; margin:0 0 4px;">Click "Buy with KakoBuy"</p>
              <p style="color:#a1a1aa; font-size:13px; line-height:1.5; margin:0;">Every product has a direct KakoBuy link. One click, you're on the checkout page. No copy-pasting links.</p>
            </td>
          </tr>
        </table>
      </div>

      <div style="background:#111; border-radius:12px; padding:20px; margin-bottom:16px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="48" style="vertical-align:top;">
              <div style="background:#f97316; color:#fff; width:36px; height:36px; border-radius:10px; text-align:center; line-height:36px; font-weight:800; font-size:16px;">3</div>
            </td>
            <td style="vertical-align:top; padding-left:14px;">
              <p style="color:#fff; font-size:15px; font-weight:600; margin:0 0 4px;">Get QC photos & ship</p>
              <p style="color:#a1a1aa; font-size:13px; line-height:1.5; margin:0;">KakoBuy sends you photos within 24h. Approve and ship to your door. Free returns if it's not right.</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- KakoBuy CTA -->
      <div style="background:linear-gradient(135deg, #f97316 0%, #c2410c 100%); border-radius:12px; padding:24px; text-align:center;">
        <p style="color:#fff; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin:0 0 8px; opacity:0.8; font-weight:600;">Recommended agent</p>
        <p style="color:#fff; font-size:22px; font-weight:800; margin:0 0 8px; letter-spacing:-0.3px;">KakoBuy</p>
        <p style="color:rgba(255,255,255,0.85); font-size:13px; margin:0 0 16px; line-height:1.5;">Fastest QC photos. Best customer service. Used by 80% of our community. Free returns.</p>
        <a href="https://ikako.vip/r/6gkjt" style="display:inline-block; background:#fff; color:#f97316; padding:12px 32px; border-radius:10px; text-decoration:none; font-weight:700; font-size:14px;">
          Sign up to KakoBuy →
        </a>
      </div>
    </div>

    <!-- Divider -->
    <div style="height:1px; background:#1a1a1a; margin:0 32px;"></div>

    <!-- Social -->
    <div style="text-align:center; padding:32px 24px;">
      <p style="color:#52525b; font-size:12px; text-transform:uppercase; letter-spacing:2px; margin:0 0 16px; font-weight:600;">Join the community</p>
      <table cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td style="padding:0 8px;">
            <a href="https://discord.gg/8r5EFMRg" style="display:inline-block; background:#111; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; font-size:13px; font-weight:500;">Discord</a>
          </td>
          <td style="padding:0 8px;">
            <a href="https://reddit.com/r/MurmReps" style="display:inline-block; background:#111; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; font-size:13px; font-weight:500;">Reddit</a>
          </td>
          <td style="padding:0 8px;">
            <a href="https://tiktok.com/@murmreps" style="display:inline-block; background:#111; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; font-size:13px; font-weight:500;">TikTok</a>
          </td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <div style="text-align:center; padding:24px 24px 40px;">
      <p style="color:#333; font-size:12px; margin:0 0 8px;">
        MurmReps · The rep community's most trusted source
      </p>
      <a href="${unsubUrl}" style="color:#444; font-size:11px; text-decoration:underline;">Unsubscribe</a>
    </div>

  </div>
</body>
</html>`;
}
