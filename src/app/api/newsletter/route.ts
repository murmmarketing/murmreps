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
    const { email, source } = await req.json();

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

function getWelcomeEmailHTML(email: string): string {
  const unsubscribeUrl = `https://murmreps.com/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family:Arial,sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:20px;">

    <!-- Header -->
    <div style="text-align:center; padding:30px 0; border-bottom:1px solid #222;">
      <h1 style="color:#f97316; font-size:28px; margin:0;">
        <span style="color:#f97316;">M</span><span style="color:#fff;">urmReps</span>
      </h1>
    </div>

    <!-- Welcome -->
    <div style="padding:30px 0; text-align:center;">
      <h2 style="color:#fff; font-size:24px; margin:0 0 10px;">Welcome to MurmReps 🔥</h2>
      <p style="color:#999; font-size:16px; line-height:1.6;">
        You're now part of 2,300+ repfam members who get the best finds first.
      </p>
    </div>

    <!-- Top Picks -->
    <div style="background:#111; border-radius:12px; padding:24px; margin-bottom:24px;">
      <h3 style="color:#f97316; font-size:18px; margin:0 0 16px;">🔥 This Week's Top Picks</h3>

      <div style="margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #222;">
        <p style="color:#fff; font-size:15px; margin:0 0 4px;">Nike Air Max 95 — €21.05</p>
        <p style="color:#999; font-size:13px; margin:0;">799 views · Community favorite</p>
      </div>

      <div style="margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #222;">
        <p style="color:#fff; font-size:15px; margin:0 0 4px;">Balenciaga Track Jacket — €33.56</p>
        <p style="color:#999; font-size:13px; margin:0;">784 views · Trending this week</p>
      </div>

      <div style="margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #222;">
        <p style="color:#fff; font-size:15px; margin:0 0 4px;">Chrome Hearts Knit Hoodie — €10.48</p>
        <p style="color:#999; font-size:13px; margin:0;">689 views · Budget steal</p>
      </div>

      <div style="margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #222;">
        <p style="color:#fff; font-size:15px; margin:0 0 4px;">Louis Vuitton Sweater — €27.18</p>
        <p style="color:#999; font-size:13px; margin:0;">609 views · Quality pick</p>
      </div>

      <div>
        <p style="color:#fff; font-size:15px; margin:0 0 4px;">New Balance 550 — €27.18</p>
        <p style="color:#999; font-size:13px; margin:0;">511 views · Clean everyday shoe</p>
      </div>

      <div style="text-align:center; margin-top:20px;">
        <a href="https://murmreps.com/products" style="display:inline-block; background:#f97316; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:bold; font-size:14px;">
          Browse all 19,000+ finds →
        </a>
      </div>
    </div>

    <!-- Agent Comparison Guide -->
    <div style="background:#111; border-radius:12px; padding:24px; margin-bottom:24px;">
      <h3 style="color:#f97316; font-size:18px; margin:0 0 16px;">📦 Agent Comparison Guide</h3>
      <p style="color:#999; font-size:14px; line-height:1.6; margin:0 0 16px;">
        Not sure which agent to use? Here's the quick breakdown:
      </p>

      <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <tr style="border-bottom:1px solid #222;">
          <td style="padding:8px 0; color:#fff; font-weight:bold;">Agent</td>
          <td style="padding:8px 0; color:#fff; font-weight:bold;">Best For</td>
          <td style="padding:8px 0; color:#fff; font-weight:bold;">Shipping</td>
        </tr>
        <tr style="border-bottom:1px solid #222;">
          <td style="padding:8px 0; color:#f97316;">KakoBuy</td>
          <td style="padding:8px 0; color:#999;">Beginners</td>
          <td style="padding:8px 0; color:#999;">Fast</td>
        </tr>
        <tr style="border-bottom:1px solid #222;">
          <td style="padding:8px 0; color:#f97316;">Superbuy</td>
          <td style="padding:8px 0; color:#999;">Experience</td>
          <td style="padding:8px 0; color:#999;">Good</td>
        </tr>
        <tr style="border-bottom:1px solid #222;">
          <td style="padding:8px 0; color:#f97316;">CnFans</td>
          <td style="padding:8px 0; color:#999;">Cheap shipping</td>
          <td style="padding:8px 0; color:#999;">Budget</td>
        </tr>
        <tr style="border-bottom:1px solid #222;">
          <td style="padding:8px 0; color:#f97316;">MuleBuy</td>
          <td style="padding:8px 0; color:#999;">Europe</td>
          <td style="padding:8px 0; color:#999;">EU routes</td>
        </tr>
        <tr style="border-bottom:1px solid #222;">
          <td style="padding:8px 0; color:#f97316;">ACBuy</td>
          <td style="padding:8px 0; color:#999;">Value</td>
          <td style="padding:8px 0; color:#999;">Mid</td>
        </tr>
        <tr style="border-bottom:1px solid #222;">
          <td style="padding:8px 0; color:#f97316;">LoveGoBuy</td>
          <td style="padding:8px 0; color:#999;">Selection</td>
          <td style="padding:8px 0; color:#999;">Good</td>
        </tr>
        <tr style="border-bottom:1px solid #222;">
          <td style="padding:8px 0; color:#f97316;">JoyaGoo</td>
          <td style="padding:8px 0; color:#999;">New users</td>
          <td style="padding:8px 0; color:#999;">Mid</td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:#f97316;">SugarGoo</td>
          <td style="padding:8px 0; color:#999;">Community</td>
          <td style="padding:8px 0; color:#999;">Good</td>
        </tr>
      </table>

      <p style="color:#999; font-size:13px; margin:16px 0 0;">
        💡 Pro tip: Use MurmReps' link converter to compare the same product across all 8 agents instantly.
      </p>
    </div>

    <!-- Quick Links -->
    <div style="text-align:center; padding:20px 0; border-top:1px solid #222;">
      <p style="color:#999; font-size:14px; margin:0 0 12px;">Quick links:</p>
      <a href="https://murmreps.com/products" style="color:#f97316; text-decoration:none; margin:0 10px; font-size:13px;">All Products</a>
      <a href="https://murmreps.com/girls" style="color:#f97316; text-decoration:none; margin:0 10px; font-size:13px;">For Her</a>
      <a href="https://murmreps.com/guide" style="color:#f97316; text-decoration:none; margin:0 10px; font-size:13px;">Beginner Guide</a>
      <a href="https://discord.gg/8r5EFMRg" style="color:#f97316; text-decoration:none; margin:0 10px; font-size:13px;">Discord</a>
    </div>

    <!-- Footer -->
    <div style="text-align:center; padding:20px 0;">
      <p style="color:#666; font-size:12px; margin:0;">
        MurmReps — The rep community's most trusted source.
      </p>
      <p style="color:#444; font-size:11px; margin:8px 0 0;">
        <a href="${unsubscribeUrl}" style="color:#444; text-decoration:underline;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
