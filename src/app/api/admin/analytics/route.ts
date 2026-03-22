import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

function checkAuth(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const authError = checkAuth(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") || "";

  try {
    const supabase = getAdminClient();

    // Build date filter
    const dateFilter = from ? from : null;

    // 1. Stats: total views, agent clicks, unique products, converter uses
    const buildCountQuery = (eventType: string) => {
      let q = supabase.from("analytics").select("id", { count: "exact", head: true }).eq("event_type", eventType);
      if (dateFilter) q = q.gte("created_at", dateFilter);
      return q;
    };

    const [viewsRes, clicksRes, converterRes] = await Promise.all([
      buildCountQuery("product_view"),
      buildCountQuery("agent_click"),
      buildCountQuery("converter_use"),
    ]);

    // Unique products viewed
    let uniqueQ = supabase.from("analytics").select("product_id").eq("event_type", "product_view").not("product_id", "is", null);
    if (dateFilter) uniqueQ = uniqueQ.gte("created_at", dateFilter);
    const uniqueRes = await uniqueQ;
    const uniqueProducts = new Set((uniqueRes.data || []).map((r: { product_id: number }) => r.product_id)).size;

    const stats = [
      { label: "Total Page Views", value: viewsRes.count || 0 },
      { label: "Total Agent Clicks", value: clicksRes.count || 0 },
      { label: "Unique Products Viewed", value: uniqueProducts },
      { label: "Converter Uses", value: converterRes.count || 0 },
    ];

    // 2. Views over time
    let viewsTimeQ = supabase.from("analytics").select("created_at").eq("event_type", "product_view");
    if (dateFilter) viewsTimeQ = viewsTimeQ.gte("created_at", dateFilter);
    viewsTimeQ = viewsTimeQ.order("created_at", { ascending: true });
    const viewsTimeRes = await viewsTimeQ;
    const viewsByDate: Record<string, number> = {};
    (viewsTimeRes.data || []).forEach((r: { created_at: string }) => {
      const date = r.created_at.slice(0, 10);
      viewsByDate[date] = (viewsByDate[date] || 0) + 1;
    });
    const viewsOverTime = Object.entries(viewsByDate).map(([date, count]) => ({ date, count }));

    // 3. Agent clicks grouped by name
    let agentQ = supabase.from("analytics").select("agent_name").eq("event_type", "agent_click").not("agent_name", "is", null);
    if (dateFilter) agentQ = agentQ.gte("created_at", dateFilter);
    const agentRes = await agentQ;
    const agentCounts: Record<string, number> = {};
    (agentRes.data || []).forEach((r: { agent_name: string }) => {
      agentCounts[r.agent_name] = (agentCounts[r.agent_name] || 0) + 1;
    });
    const agentClicks = Object.entries(agentCounts)
      .map(([agent_name, count]) => ({ agent_name, count }))
      .sort((a, b) => b.count - a.count);

    // 4. Top products
    let topQ = supabase.from("analytics").select("product_id, event_type").in("event_type", ["product_view", "agent_click"]).not("product_id", "is", null);
    if (dateFilter) topQ = topQ.gte("created_at", dateFilter);
    const topRes = await topQ;
    const productViews: Record<number, number> = {};
    const productClicks: Record<number, number> = {};
    (topRes.data || []).forEach((r: { product_id: number; event_type: string }) => {
      if (r.event_type === "product_view") {
        productViews[r.product_id] = (productViews[r.product_id] || 0) + 1;
      } else {
        productClicks[r.product_id] = (productClicks[r.product_id] || 0) + 1;
      }
    });

    const allProductIds = Array.from(new Set([...Object.keys(productViews), ...Object.keys(productClicks)])).map(Number);
    let productsData: { id: number; name: string; category: string }[] = [];
    if (allProductIds.length > 0) {
      const { data: prods } = await supabase.from("products").select("id, name, category").in("id", allProductIds.slice(0, 100));
      productsData = (prods || []) as { id: number; name: string; category: string }[];
    }
    const productsMap = new Map(productsData.map((p) => [p.id, p]));

    const topProducts = allProductIds
      .map((id) => ({
        product_id: id,
        name: productsMap.get(id)?.name || `Product #${id}`,
        category: productsMap.get(id)?.category || "Unknown",
        views: productViews[id] || 0,
        clicks: productClicks[id] || 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 20);

    // 5. Category breakdown
    const categoryCounts: Record<string, number> = {};
    topProducts.forEach((p) => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + p.views;
    });
    // Also include other products not in top 20
    productsData.forEach((p) => {
      if (!categoryCounts[p.category]) {
        categoryCounts[p.category] = productViews[p.id] || 0;
      } else if (!topProducts.find((tp) => tp.product_id === p.id)) {
        categoryCounts[p.category] += productViews[p.id] || 0;
      }
    });
    const categoryBreakdown = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);

    // 6. Popular searches
    let searchQ = supabase.from("analytics").select("metadata").eq("event_type", "search");
    if (dateFilter) searchQ = searchQ.gte("created_at", dateFilter);
    const searchRes = await searchQ;
    const searchCounts: Record<string, number> = {};
    (searchRes.data || []).forEach((r: { metadata: { query?: string } }) => {
      const q = r.metadata?.query;
      if (q) {
        const lower = q.toLowerCase().trim();
        searchCounts[lower] = (searchCounts[lower] || 0) + 1;
      }
    });
    const popularSearches = Object.entries(searchCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // 7. Hourly activity
    let hourlyQ = supabase.from("analytics").select("created_at");
    if (dateFilter) hourlyQ = hourlyQ.gte("created_at", dateFilter);
    const hourlyRes = await hourlyQ;
    const hourlyCounts: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourlyCounts[h] = 0;
    (hourlyRes.data || []).forEach((r: { created_at: string }) => {
      const hour = new Date(r.created_at).getHours();
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    });
    const hourlyActivity = Object.entries(hourlyCounts)
      .map(([hour, count]) => ({ hour: Number(hour), count }))
      .sort((a, b) => a.hour - b.hour);

    return NextResponse.json({
      stats,
      viewsOverTime,
      agentClicks,
      topProducts,
      categoryBreakdown,
      popularSearches,
      hourlyActivity,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
