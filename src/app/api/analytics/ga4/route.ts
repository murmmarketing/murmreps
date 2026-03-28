import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/* ─── Token cache ─── */
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5-min buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not configured");

  const key = JSON.parse(keyJson);
  const now = Math.floor(Date.now() / 1000);

  const jwtToken = jwt.sign(
    {
      iss: key.client_email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    },
    key.private_key,
    { algorithm: "RS256" }
  );

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwtToken,
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(data.error_description || data.error || "Failed to get access token");
  }

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };

  return data.access_token;
}

/* ─── GA4 report runner ─── */
async function runReport(
  accessToken: string,
  propertyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: Record<string, any>
) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `GA4 API error: ${res.status}`);
  }

  return res.json();
}

/* ─── Helpers ─── */
function getDateRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMetricValue(row: any, index: number): number {
  return parseFloat(row?.metricValues?.[index]?.value || "0");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractDimensionValue(row: any, index: number): string {
  return row?.dimensionValues?.[index]?.value || "";
}

/* ─── Main handler ─── */
export async function GET(req: NextRequest) {
  const adminPassword = req.headers.get("x-admin-password");
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    return NextResponse.json({ connected: false, error: "GA4_PROPERTY_ID not configured" });
  }

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return NextResponse.json({ connected: false, error: "GOOGLE_SERVICE_ACCOUNT_KEY not configured" });
  }

  const period = parseInt(req.nextUrl.searchParams.get("days") || "30", 10);
  const dateRange = getDateRange(period);

  try {
    const accessToken = await getAccessToken();

    // Run all 6 reports in parallel
    const [overviewRes, sourcesRes, pagesRes, dailyRes, devicesRes, countriesRes] = await Promise.all([
      // Report 1 — Overview metrics
      runReport(accessToken, propertyId, {
        dateRanges: [dateRange],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "newUsers" },
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
          { name: "bounceRate" },
        ],
      }),

      // Report 2 — Traffic sources
      runReport(accessToken, propertyId, {
        dateRanges: [dateRange],
        dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      }),

      // Report 3 — Top pages
      runReport(accessToken, propertyId, {
        dateRanges: [dateRange],
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }, { name: "averageSessionDuration" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 15,
      }),

      // Report 4 — Daily sessions/users
      runReport(accessToken, propertyId, {
        dateRanges: [dateRange],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "screenPageViews" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),

      // Report 5 — Device breakdown
      runReport(accessToken, propertyId, {
        dateRanges: [dateRange],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }],
      }),

      // Report 6 — Country breakdown
      runReport(accessToken, propertyId, {
        dateRanges: [dateRange],
        dimensions: [{ name: "country" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      }),
    ]);

    // Parse overview
    const overviewRow = overviewRes.rows?.[0];
    const overview = {
      sessions: extractMetricValue(overviewRow, 0),
      totalUsers: extractMetricValue(overviewRow, 1),
      newUsers: extractMetricValue(overviewRow, 2),
      pageViews: extractMetricValue(overviewRow, 3),
      avgSessionDuration: extractMetricValue(overviewRow, 4),
      bounceRate: extractMetricValue(overviewRow, 5),
    };

    // Parse traffic sources
    const sources = (sourcesRes.rows || []).map((row: Record<string, unknown>) => ({
      source: extractDimensionValue(row, 0),
      medium: extractDimensionValue(row, 1),
      sessions: extractMetricValue(row, 0),
      users: extractMetricValue(row, 1),
    }));

    // Parse top pages
    const pages = (pagesRes.rows || []).map((row: Record<string, unknown>) => ({
      path: extractDimensionValue(row, 0),
      title: extractDimensionValue(row, 1),
      views: extractMetricValue(row, 0),
      users: extractMetricValue(row, 1),
      avgDuration: extractMetricValue(row, 2),
    }));

    // Parse daily data
    const daily = (dailyRes.rows || []).map((row: Record<string, unknown>) => ({
      date: extractDimensionValue(row, 0),
      sessions: extractMetricValue(row, 0),
      users: extractMetricValue(row, 1),
      pageViews: extractMetricValue(row, 2),
    }));

    // Parse devices
    const devices = (devicesRes.rows || []).map((row: Record<string, unknown>) => ({
      device: extractDimensionValue(row, 0),
      sessions: extractMetricValue(row, 0),
      users: extractMetricValue(row, 1),
    }));

    // Parse countries
    const countries = (countriesRes.rows || []).map((row: Record<string, unknown>) => ({
      country: extractDimensionValue(row, 0),
      sessions: extractMetricValue(row, 0),
      users: extractMetricValue(row, 1),
    }));

    return NextResponse.json({
      connected: true,
      overview,
      sources,
      pages,
      daily,
      devices,
      countries,
    });
  } catch (err) {
    console.error("GA4 API error:", err);
    return NextResponse.json({
      connected: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
