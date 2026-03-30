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
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: products } = await supabase
      .from('products')
      .select('id, name, brand, price_eur, image, views, category')
      .not('image', 'is', null)
      .neq('image', '')
      .gte('created_at', oneWeekAgo)
      .order('score', { ascending: false })
      .limit(6);

    const items = products || [];
    const html = buildWeeklyDropsHTML(items);
    return NextResponse.json({ html, productCount: items.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

interface ProductRow {
  id: number;
  name: string;
  brand: string;
  price_eur: number | null;
  image: string;
  views: number;
  category: string;
}

function buildProductGrid(products: ProductRow[]): string {
  const rows: string[] = [];
  for (let i = 0; i < products.length; i += 2) {
    const left = products[i];
    const right = products[i + 1];
    rows.push(`
        <tr>
          <td width="50%" style="padding:8px;">
            <a href="https://murmreps.com/products/${left.id}" style="text-decoration:none; display:block;">
              <div style="background:#111; border-radius:12px; overflow:hidden;">
                <img src="${left.image}" alt="${left.name}" style="width:100%; height:180px; object-fit:cover; display:block;" />
                <div style="padding:14px;">
                  <p style="color:#fff; font-size:14px; font-weight:600; margin:0 0 3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${left.name}</p>
                  <p style="color:#52525b; font-size:12px; margin:0 0 8px;">${left.brand} · ${left.views.toLocaleString()} views</p>
                  <p style="color:#f97316; font-size:16px; font-weight:700; margin:0;">${left.price_eur ? '€' + left.price_eur.toFixed(2) : 'Price TBD'}</p>
                </div>
              </div>
            </a>
          </td>
          ${right ? `
          <td width="50%" style="padding:8px;">
            <a href="https://murmreps.com/products/${right.id}" style="text-decoration:none; display:block;">
              <div style="background:#111; border-radius:12px; overflow:hidden;">
                <img src="${right.image}" alt="${right.name}" style="width:100%; height:180px; object-fit:cover; display:block;" />
                <div style="padding:14px;">
                  <p style="color:#fff; font-size:14px; font-weight:600; margin:0 0 3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${right.name}</p>
                  <p style="color:#52525b; font-size:12px; margin:0 0 8px;">${right.brand} · ${right.views.toLocaleString()} views</p>
                  <p style="color:#f97316; font-size:16px; font-weight:700; margin:0;">${right.price_eur ? '€' + right.price_eur.toFixed(2) : 'Price TBD'}</p>
                </div>
              </div>
            </a>
          </td>` : '<td width="50%" style="padding:8px;"></td>'}
        </tr>`);
  }
  return rows.join('');
}

function buildWeeklyDropsHTML(products: ProductRow[]): string {
  const productGrid = products.length > 0
    ? `<table cellpadding="0" cellspacing="0" border="0" width="100%">${buildProductGrid(products)}</table>`
    : '<p style="color:#52525b; font-size:14px; text-align:center; padding:24px 0;">No new products this week — check back soon!</p>';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family:Arial,Helvetica,sans-serif; -webkit-font-smoothing:antialiased;">
  <div style="max-width:600px; margin:0 auto;">

    <div style="height:24px;"></div>

    <!-- Logo -->
    <div style="text-align:center; padding:32px 24px 24px;">
      <span style="font-size:28px; font-weight:800; letter-spacing:-0.5px;">
        <span style="color:#f97316;">M</span><span style="color:#ffffff;">urm</span><span style="color:#f97316;">Reps</span>
      </span>
    </div>

    <!-- Hero -->
    <div style="text-align:center; padding:40px 32px; background:linear-gradient(180deg, #111 0%, #0a0a0a 100%); border-radius:16px; margin:0 16px 24px;">
      <p style="color:#f97316; font-size:13px; text-transform:uppercase; letter-spacing:2px; margin:0 0 12px; font-weight:600;">Weekly drops</p>
      <h1 style="color:#fff; font-size:32px; font-weight:800; margin:0 0 16px; line-height:1.2; letter-spacing:-0.5px;">This Week's Hottest Finds 🔥</h1>
      <p style="color:#a1a1aa; font-size:15px; line-height:1.6; margin:0; max-width:400px; display:inline-block;">
        ${products.length} fresh drops hand-picked for the repfam. Don't sleep on these.
      </p>
    </div>

    <!-- Divider -->
    <div style="height:1px; background:#1a1a1a; margin:0 32px;"></div>

    <!-- Products Header -->
    <div style="padding:32px 24px 16px;">
      <p style="color:#f97316; font-size:12px; text-transform:uppercase; letter-spacing:2px; margin:0 0 4px; font-weight:600;">Top picks</p>
      <h2 style="color:#fff; font-size:22px; font-weight:700; margin:0; letter-spacing:-0.3px;">Trending this week</h2>
    </div>

    <!-- Product Grid -->
    <div style="padding:0 16px 8px;">
      ${productGrid}
    </div>

    <!-- CTA Button -->
    <div style="text-align:center; padding:8px 24px 32px;">
      <a href="https://murmreps.com/products?sort=newest" style="display:inline-block; background:#f97316; color:#fff; padding:14px 40px; border-radius:10px; text-decoration:none; font-weight:700; font-size:15px; letter-spacing:0.3px;">
        Browse all new drops →
      </a>
    </div>

    <!-- Divider -->
    <div style="height:1px; background:#1a1a1a; margin:0 32px;"></div>

    <!-- KakoBuy CTA -->
    <div style="padding:32px 24px;">
      <div style="background:linear-gradient(135deg, #f97316 0%, #c2410c 100%); border-radius:12px; padding:24px; text-align:center;">
        <p style="color:#fff; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin:0 0 8px; opacity:0.8; font-weight:600;">Recommended agent</p>
        <p style="color:#fff; font-size:22px; font-weight:800; margin:0 0 8px; letter-spacing:-0.3px;">KakoBuy</p>
        <p style="color:rgba(255,255,255,0.85); font-size:13px; margin:0 0 16px; line-height:1.5;">Fastest QC photos. Best customer service. Free returns on every order.</p>
        <a href="https://ikako.vip/r/6gkjt" style="display:inline-block; background:#fff; color:#f97316; padding:12px 32px; border-radius:10px; text-decoration:none; font-weight:700; font-size:14px;">
          Sign up to KakoBuy →
        </a>
      </div>
    </div>

    <!-- Social -->
    <div style="text-align:center; padding:8px 24px 32px;">
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
      <a href="https://murmreps.com/api/newsletter/unsubscribe?email={{email}}" style="color:#444; font-size:11px; text-decoration:underline;">Unsubscribe</a>
    </div>

  </div>
</body>
</html>`;
}
