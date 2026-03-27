import { NextRequest, NextResponse } from "next/server";

const META_BASE = "https://graph.facebook.com/v21.0";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "30");
  const token = process.env.META_ACCESS_TOKEN;
  const accountId = process.env.META_AD_ACCOUNT_ID;

  if (!token || !accountId) {
    return NextResponse.json({ connected: false });
  }

  const since = new Date();
  since.setDate(since.getDate() - days);
  const until = new Date();
  const timeRange = JSON.stringify({
    since: since.toISOString().split("T")[0],
    until: until.toISOString().split("T")[0],
  });

  try {
    // Account-level summary
    const summaryRes = await fetch(
      `${META_BASE}/act_${accountId}/insights?` +
        new URLSearchParams({
          fields: "spend,impressions,reach,clicks,ctr,cpc,actions,action_values,cost_per_action_type",
          time_range: timeRange,
          access_token: token,
        })
    );
    const summaryData = await summaryRes.json();

    if (summaryData.error) {
      return NextResponse.json({ connected: true, error: summaryData.error.message, data: null });
    }

    // Daily breakdown
    const dailyRes = await fetch(
      `${META_BASE}/act_${accountId}/insights?` +
        new URLSearchParams({
          fields: "spend,impressions,reach,clicks",
          time_range: timeRange,
          time_increment: "1",
          access_token: token,
        })
    );
    const dailyData = await dailyRes.json();

    // Campaign breakdown
    const campaignsRes = await fetch(
      `${META_BASE}/act_${accountId}/insights?` +
        new URLSearchParams({
          fields: "campaign_name,spend,impressions,reach,clicks,ctr,cpc,actions,cost_per_action_type",
          time_range: timeRange,
          level: "campaign",
          limit: "25",
          access_token: token,
        })
    );
    const campaignsData = await campaignsRes.json();

    // Extract key metrics from summary
    const s = summaryData.data?.[0] || {};
    type MetaAction = { action_type: string; value: string };
    const getAction = (actions: MetaAction[], type: string): string =>
      actions?.find((a) => a.action_type === type)?.value || "0";
    const getActionValue = (values: MetaAction[], type: string): string =>
      values?.find((a) => a.action_type === type)?.value || "0";

    const purchases = parseInt(getAction(s.actions, "offsite_conversion.fb_pixel_purchase"));
    const revenue = parseFloat(getActionValue(s.action_values, "offsite_conversion.fb_pixel_purchase"));
    const linkClicks = parseInt(getAction(s.actions, "link_click"));
    const spend = parseFloat(s.spend || "0");

    return NextResponse.json({
      connected: true,
      summary: {
        spend,
        impressions: parseInt(s.impressions || "0"),
        reach: parseInt(s.reach || "0"),
        clicks: parseInt(s.clicks || "0"),
        ctr: parseFloat(s.ctr || "0"),
        cpc: parseFloat(s.cpc || "0"),
        purchases,
        revenue,
        roas: spend > 0 ? revenue / spend : 0,
        linkClicks,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      daily: (dailyData.data || []).map((d: any) => ({
        date: d.date_start,
        spend: parseFloat(d.spend || "0"),
        impressions: parseInt(d.impressions || "0"),
        reach: parseInt(d.reach || "0"),
        clicks: parseInt(d.clicks || "0"),
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      campaigns: (campaignsData.data || []).map((c: any) => ({
        name: c.campaign_name,
        spend: parseFloat(c.spend || "0"),
        impressions: parseInt(c.impressions || "0"),
        reach: parseInt(c.reach || "0"),
        clicks: parseInt(c.clicks || "0"),
        ctr: parseFloat(c.ctr || "0"),
        cpc: parseFloat(c.cpc || "0"),
        conversions: parseInt(getAction(c.actions, "offsite_conversion.fb_pixel_purchase")),
      })),
    });
  } catch (error) {
    return NextResponse.json({ connected: true, error: String(error), data: null }, { status: 500 });
  }
}
