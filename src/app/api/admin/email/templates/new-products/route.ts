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
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: products, count } = await supabase
      .from('products')
      .select('id, name, brand, price_eur, image, views, category', { count: 'exact' })
      .not('image', 'is', null)
      .neq('image', '')
      .gte('created_at', oneDayAgo)
      .order('score', { ascending: false })
      .limit(8);

    const items = products || [];
    const totalNew = count || items.length;
    const html = buildNewProductsHTML(items, totalNew);
    return NextResponse.json({ html, productCount: totalNew });
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

function buildNewProductsHTML(products: ProductRow[], totalCount: number): string {
  const productCards = products.map((p) => `
      <div style="margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #222;">
        <table style="width:100%;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:80px; vertical-align:top;">
              <img src="${p.image}" alt="${p.name}" style="width:72px; height:72px; border-radius:8px; object-fit:cover;" />
            </td>
            <td style="vertical-align:top; padding-left:12px;">
              <a href="https://murmreps.com/products/${p.id}" style="color:#fff; font-size:15px; text-decoration:none; font-weight:600;">${p.name}</a>
              <p style="color:#f97316; font-size:13px; margin:4px 0 0;">${p.brand} · ${p.price_eur ? '€' + p.price_eur.toFixed(2) : 'Price TBD'}</p>
              <p style="color:#666; font-size:12px; margin:2px 0 0;">${p.category}</p>
            </td>
          </tr>
        </table>
      </div>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family:Arial,sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:20px;">
    <div style="text-align:center; padding:30px 0; border-bottom:1px solid #222;">
      <h1 style="color:#f97316; font-size:28px; margin:0;">
        <span style="color:#f97316;">M</span><span style="color:#fff;">urmReps</span>
      </h1>
    </div>

    <div style="padding:30px 0; text-align:center;">
      <h2 style="color:#fff; font-size:24px; margin:0 0 10px;">${totalCount} New Products Just Landed 🚀</h2>
      <p style="color:#999; font-size:16px; line-height:1.6;">
        Fresh additions in the last 24 hours. Be the first to cop.
      </p>
    </div>

    <div style="background:#111; border-radius:12px; padding:24px; margin-bottom:24px;">
      ${productCards || '<p style="color:#999;">No new products in the last 24 hours.</p>'}

      <div style="text-align:center; margin-top:20px;">
        <a href="https://murmreps.com/products?sort=newest" style="display:inline-block; background:#f97316; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:bold; font-size:14px;">
          See all new additions →
        </a>
      </div>
    </div>

    <div style="text-align:center; padding:20px 0;">
      <p style="color:#666; font-size:12px; margin:0;">MurmReps — The rep community's most trusted source.</p>
      <p style="color:#444; font-size:11px; margin:8px 0 0;">
        <a href="https://murmreps.com/api/newsletter/unsubscribe?email={{email}}" style="color:#444; text-decoration:underline;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
