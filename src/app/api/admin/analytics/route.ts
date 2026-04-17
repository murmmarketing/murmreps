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
  const tab = searchParams.get("tab") || "overview";
  const from = searchParams.get("from") || "";
  const sort = searchParams.get("sort") || "views";
  const order = searchParams.get("order") || "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";

  try {
    const supabase = getAdminClient();
    const dateFilter = from || null;

    if (tab === "overview") {
      return await handleOverview(supabase, dateFilter);
    }
    if (tab === "products") {
      return await handleProducts(supabase, { sort, order, page, limit, search, category, brand });
    }
    if (tab === "engagement") {
      return await handleEngagement(supabase, dateFilter);
    }
    if (tab === "content") {
      return await handleContent(supabase);
    }
    if (tab === "categories") {
      return await handleCategories(supabase);
    }
    if (tab === "health") {
      return await handleHealth(supabase);
    }

    return NextResponse.json({ error: "Invalid tab" }, { status: 400 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleOverview(supabase: any, dateFilter: string | null) {
  const buildCount = (eventType: string) => {
    let q = supabase.from("analytics").select("id", { count: "exact", head: true }).eq("event_type", eventType);
    if (dateFilter) q = q.gte("created_at", dateFilter);
    return q;
  };

  const [
    viewsRes, clicksRes, converterRes,
    { count: totalProducts },
    { count: subscriberCount },
    { count: commentCount },
    { data: allProducts },
  ] = await Promise.all([
    buildCount("product_view"),
    buildCount("agent_click"),
    buildCount("converter_use"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }).is("unsubscribed_at", null),
    supabase.from("blog_comments").select("id", { count: "exact", head: true }),
    supabase.from("products").select("views, likes"),
  ]);

  const totalViews = (allProducts || []).reduce((s: number, p: { views: number }) => s + (p.views || 0), 0);
  const totalLikes = (allProducts || []).reduce((s: number, p: { likes: number }) => s + (p.likes || 0), 0);

  // Views over time
  let viewsTimeQ = supabase.from("analytics").select("created_at").eq("event_type", "product_view");
  if (dateFilter) viewsTimeQ = viewsTimeQ.gte("created_at", dateFilter);
  const { data: viewsTimeData } = await viewsTimeQ.order("created_at", { ascending: true });
  const viewsByDate: Record<string, number> = {};
  (viewsTimeData || []).forEach((r: { created_at: string }) => {
    const date = r.created_at.slice(0, 10);
    viewsByDate[date] = (viewsByDate[date] || 0) + 1;
  });
  const viewsOverTime = Object.entries(viewsByDate).map(([date, count]) => ({ date, count }));

  // Top 10 most viewed products
  const { data: topViewed } = await supabase
    .from("products")
    .select("id, name, views")
    .order("views", { ascending: false })
    .limit(10);

  // Agent clicks
  let agentQ = supabase.from("analytics").select("agent_name").eq("event_type", "agent_click").not("agent_name", "is", null);
  if (dateFilter) agentQ = agentQ.gte("created_at", dateFilter);
  const { data: agentData } = await agentQ;
  const agentCounts: Record<string, number> = {};
  (agentData || []).forEach((r: { agent_name: string }) => {
    agentCounts[r.agent_name] = (agentCounts[r.agent_name] || 0) + 1;
  });
  const agentClicks = Object.entries(agentCounts)
    .map(([agent_name, count]) => ({ agent_name, count }))
    .sort((a, b) => b.count - a.count);

  // Hourly activity
  let hourlyQ = supabase.from("analytics").select("created_at");
  if (dateFilter) hourlyQ = hourlyQ.gte("created_at", dateFilter);
  const { data: hourlyData } = await hourlyQ;
  const hourlyCounts: Record<number, number> = {};
  for (let h = 0; h < 24; h++) hourlyCounts[h] = 0;
  (hourlyData || []).forEach((r: { created_at: string }) => {
    hourlyCounts[new Date(r.created_at).getHours()] += 1;
  });
  const hourlyActivity = Object.entries(hourlyCounts).map(([h, c]) => ({ hour: Number(h), count: c }));

  return NextResponse.json({
    stats: {
      totalProducts: totalProducts || 0,
      totalViews,
      totalLikes,
      subscriberCount: subscriberCount || 0,
      commentCount: commentCount || 0,
      pageViews: viewsRes.count || 0,
      agentClicks: clicksRes.count || 0,
      converterUses: converterRes.count || 0,
    },
    viewsOverTime,
    topViewed: topViewed || [],
    agentClicks,
    hourlyActivity,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleProducts(supabase: any, opts: {
  sort: string; order: string; page: number; limit: number;
  search: string; category: string; brand: string;
}) {
  const { sort, order, page, limit, search, category, brand } = opts;
  const offset = (page - 1) * limit;
  const ascending = order === "asc";

  const sortMap: Record<string, string> = {
    views: "views", likes: "likes", dislikes: "dislikes",
    score: "qc_rating", newest: "created_at", oldest: "created_at",
    name: "name",
  };
  const sortCol = sortMap[sort] || "views";
  const sortAsc = sort === "oldest" ? true : ascending;

  let query = supabase
    .from("products")
    .select("id, name, brand, category, image, views, likes, dislikes, qc_rating, tier, created_at, verified", { count: "exact" });

  if (search) query = query.ilike("name", `%${search}%`);
  if (category) query = query.eq("category", category);
  if (brand) query = query.eq("brand", brand);

  query = query.order(sortCol, { ascending: sortAsc }).range(offset, offset + limit - 1);
  const { data: products, count } = await query;

  // Summary stats
  const [
    { count: total },
    { count: withImages },
    { data: avgData },
    { count: zeroViews },
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).not("image", "is", null).neq("image", ""),
    supabase.from("products").select("qc_rating"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("views", 0),
  ]);

  const ratings = (avgData || []).map((p: { qc_rating: number | null }) => p.qc_rating).filter((r: number | null) => r != null);
  const avgScore = ratings.length > 0 ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) : "0";

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { count: addedThisWeek } = await supabase
    .from("products").select("id", { count: "exact", head: true }).gte("created_at", weekAgo);

  // Top brands & categories
  const { data: allForAgg } = await supabase.from("products").select("brand, category");
  const brandCounts: Record<string, number> = {};
  const catCounts: Record<string, number> = {};
  (allForAgg || []).forEach((p: { brand: string; category: string }) => {
    brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    catCounts[p.category] = (catCounts[p.category] || 0) + 1;
  });
  const topBrands = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
  const topCategories = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
  const unknownBrands = (allForAgg || []).filter((p: { brand: string }) => !p.brand || p.brand === "Unknown" || p.brand === "Various").length;

  // Unique brand/category lists for filter dropdowns
  const allBrands = Object.keys(brandCounts).sort();
  const allCategories = Object.keys(catCounts).sort();

  // Score distribution
  const scoreDistribution = [0, 0, 0, 0, 0]; // 0-20, 21-40, 41-60, 61-80, 81-100
  ratings.forEach((r: number) => {
    if (r <= 20) scoreDistribution[0]++;
    else if (r <= 40) scoreDistribution[1]++;
    else if (r <= 60) scoreDistribution[2]++;
    else if (r <= 80) scoreDistribution[3]++;
    else scoreDistribution[4]++;
  });

  return NextResponse.json({
    products: products || [],
    totalCount: count || 0,
    summary: {
      total: total || 0,
      withImages: withImages || 0,
      avgScore,
      zeroViews: zeroViews || 0,
      addedThisWeek: addedThisWeek || 0,
      unknownBrands,
    },
    topBrands,
    topCategories,
    scoreDistribution,
    allBrands,
    allCategories,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleEngagement(supabase: any, dateFilter: string | null) {
  // Agent clicks from analytics table
  let agentQ = supabase.from("analytics").select("agent_name, product_id, created_at").eq("event_type", "agent_click");
  if (dateFilter) agentQ = agentQ.gte("created_at", dateFilter);
  const { data: agentData } = await agentQ;

  const agentCounts: Record<string, number> = {};
  const productClicks: Record<number, number> = {};
  let totalClicks = 0;
  (agentData || []).forEach((r: { agent_name: string; product_id: number }) => {
    if (r.agent_name) agentCounts[r.agent_name] = (agentCounts[r.agent_name] || 0) + 1;
    if (r.product_id) productClicks[r.product_id] = (productClicks[r.product_id] || 0) + 1;
    totalClicks++;
  });

  const agentBreakdown = Object.entries(agentCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  // Top products by clicks
  const topClickIds = Object.entries(productClicks).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id]) => Number(id));
  let topClickProducts: { id: number; name: string; views: number }[] = [];
  if (topClickIds.length > 0) {
    const { data } = await supabase.from("products").select("id, name, views").in("id", topClickIds);
    topClickProducts = (data || []) as typeof topClickProducts;
  }
  const topByClicks = topClickProducts.map((p) => ({
    ...p,
    clicks: productClicks[p.id] || 0,
    ctr: p.views > 0 ? ((productClicks[p.id] || 0) / p.views * 100).toFixed(1) : "0",
  })).sort((a, b) => b.clicks - a.clicks);

  // Clicks over time
  const clicksByDate: Record<string, number> = {};
  (agentData || []).forEach((r: { created_at: string }) => {
    const date = r.created_at.slice(0, 10);
    clicksByDate[date] = (clicksByDate[date] || 0) + 1;
  });
  const clicksOverTime = Object.entries(clicksByDate).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));

  // Today / week / month clicks
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);
  let clicksToday = 0, clicksWeek = 0, clicksMonth = 0;
  Object.entries(clicksByDate).forEach(([date, count]) => {
    if (date >= todayStr) clicksToday += count;
    if (date >= weekAgo) clicksWeek += count;
    if (date >= monthAgo) clicksMonth += count;
  });

  // Total product views for CTR
  const { count: totalViews } = await supabase
    .from("analytics").select("id", { count: "exact", head: true }).eq("event_type", "product_view");
  const overallCtr = (totalViews || 0) > 0 ? (totalClicks / (totalViews || 1) * 100).toFixed(1) : "0";

  // Search analytics
  let searchQ = supabase.from("search_queries").select("query, results_count, searched_at");
  if (dateFilter) searchQ = searchQ.gte("searched_at", dateFilter);
  const { data: searchData } = await searchQ.order("searched_at", { ascending: false }).limit(5000);

  const searchCounts: Record<string, { count: number; zeroResults: number }> = {};
  (searchData || []).forEach((r: { query: string; results_count: number }) => {
    const q = r.query.toLowerCase().trim();
    if (!searchCounts[q]) searchCounts[q] = { count: 0, zeroResults: 0 };
    searchCounts[q].count++;
    if (r.results_count === 0) searchCounts[q].zeroResults++;
  });

  const topSearches = Object.entries(searchCounts)
    .map(([query, data]) => ({ query, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const zeroResultSearches = Object.entries(searchCounts)
    .filter(([, data]) => data.zeroResults > 0)
    .map(([query, data]) => ({ query, count: data.zeroResults }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Search volume over time
  const searchByDate: Record<string, number> = {};
  (searchData || []).forEach((r: { searched_at: string }) => {
    const date = r.searched_at.slice(0, 10);
    searchByDate[date] = (searchByDate[date] || 0) + 1;
  });
  const searchOverTime = Object.entries(searchByDate).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    agentBreakdown,
    totalClicks,
    clicksToday,
    clicksWeek,
    clicksMonth,
    overallCtr,
    topByClicks,
    clicksOverTime,
    topSearches,
    zeroResultSearches,
    searchOverTime,
    totalSearches: (searchData || []).length,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleContent(supabase: any) {
  // Blog posts
  const { data: blogPosts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, published_at")
    .order("published_at", { ascending: false });

  // Comment counts per post
  const { data: commentData } = await supabase.from("blog_comments").select("post_id");
  const commentCounts: Record<string, number> = {};
  (commentData || []).forEach((c: { post_id: string }) => {
    commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
  });
  const totalComments = (commentData || []).length;

  const posts = (blogPosts || []).map((p: { id: string; title: string; slug: string; published_at: string }) => ({
    ...p,
    comments: commentCounts[p.id] || 0,
  }));

  // Newsletter
  const { count: totalSubs } = await supabase
    .from("newsletter_subscribers").select("id", { count: "exact", head: true }).is("unsubscribed_at", null);

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const { count: subsWeek } = await supabase
    .from("newsletter_subscribers").select("id", { count: "exact", head: true })
    .is("unsubscribed_at", null).gte("subscribed_at", weekAgo);
  const { count: subsMonth } = await supabase
    .from("newsletter_subscribers").select("id", { count: "exact", head: true })
    .is("unsubscribed_at", null).gte("subscribed_at", monthAgo);

  // Recent subscribers
  const { data: recentSubs } = await supabase
    .from("newsletter_subscribers")
    .select("email, subscribed_at, source")
    .is("unsubscribed_at", null)
    .order("subscribed_at", { ascending: false })
    .limit(50);

  // Subscriber growth over time
  const { data: allSubs } = await supabase
    .from("newsletter_subscribers")
    .select("subscribed_at")
    .is("unsubscribed_at", null)
    .order("subscribed_at", { ascending: true });
  const subsByDate: Record<string, number> = {};
  (allSubs || []).forEach((s: { subscribed_at: string }) => {
    const date = s.subscribed_at.slice(0, 10);
    subsByDate[date] = (subsByDate[date] || 0) + 1;
  });
  const subscriberGrowth = Object.entries(subsByDate).map(([date, count]) => ({ date, count }));

  // Collections
  const { data: collections } = await supabase
    .from("collections")
    .select("id, name, slug, published")
    .order("name", { ascending: true });

  return NextResponse.json({
    posts,
    totalPosts: (blogPosts || []).length,
    totalComments,
    totalSubs: totalSubs || 0,
    subsWeek: subsWeek || 0,
    subsMonth: subsMonth || 0,
    recentSubs: recentSubs || [],
    subscriberGrowth,
    collections: collections || [],
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCategories(supabase: any) {
  const { data: allProducts } = await supabase
    .from("products")
    .select("category, brand, views, likes, qc_rating, tier, price_cny");

  // Category breakdown
  const catMap: Record<string, { count: number; views: number; likes: number; scores: number[] }> = {};
  const brandMap: Record<string, { count: number; views: number; scores: number[]; categories: Set<string> }> = {};
  const tierMap: Record<string, { count: number; prices: number[] }> = {};
  let mainCount = 0;
  const girlsCount = 0;

  (allProducts || []).forEach((p: { category: string; brand: string; views: number; likes: number; qc_rating: number | null; tier: string | null; price_cny: number | null }) => {
    // Categories
    const cat = p.category || "Uncategorized";
    if (!catMap[cat]) catMap[cat] = { count: 0, views: 0, likes: 0, scores: [] };
    catMap[cat].count++;
    catMap[cat].views += p.views || 0;
    catMap[cat].likes += p.likes || 0;
    if (p.qc_rating != null) catMap[cat].scores.push(p.qc_rating);

    // Brands
    const br = p.brand || "Unknown";
    if (!brandMap[br]) brandMap[br] = { count: 0, views: 0, scores: [], categories: new Set() };
    brandMap[br].count++;
    brandMap[br].views += p.views || 0;
    if (p.qc_rating != null) brandMap[br].scores.push(p.qc_rating);
    brandMap[br].categories.add(cat);

    // Tiers
    const tier = p.tier || "untiered";
    if (!tierMap[tier]) tierMap[tier] = { count: 0, prices: [] };
    tierMap[tier].count++;
    if (p.price_cny != null) tierMap[tier].prices.push(p.price_cny);

    mainCount++;
  });

  const categoryBreakdown = Object.entries(catMap)
    .map(([name, d]) => ({
      name,
      count: d.count,
      avgViews: d.count > 0 ? Math.round(d.views / d.count) : 0,
      avgLikes: d.count > 0 ? Math.round(d.likes / d.count) : 0,
      avgScore: d.scores.length > 0 ? Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const brandBreakdown = Object.entries(brandMap)
    .map(([name, d]) => ({
      name,
      count: d.count,
      avgViews: d.count > 0 ? Math.round(d.views / d.count) : 0,
      avgScore: d.scores.length > 0 ? Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length) : 0,
      categories: Array.from(d.categories).join(", "),
    }))
    .sort((a, b) => b.count - a.count);

  const tierBreakdown = Object.entries(tierMap).map(([name, d]) => ({
    name,
    count: d.count,
    avgPrice: d.prices.length > 0 ? Math.round(d.prices.reduce((a, b) => a + b, 0) / d.prices.length) : 0,
  }));

  return NextResponse.json({
    categoryBreakdown,
    brandBreakdown: brandBreakdown.slice(0, 50),
    tierBreakdown,
    collectionSplit: { main: mainCount, girls: girlsCount },
    totalBrands: Object.keys(brandMap).length,
    totalCategories: Object.keys(catMap).length,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleHealth(supabase: any) {
  const { data: allProducts } = await supabase
    .from("products")
    .select("id, name, brand, category, image, views, qc_rating, created_at");

  const products = allProducts || [];
  const noImage = products.filter((p: { image: string | null }) => !p.image || p.image === "");
  const lowScore = products.filter((p: { qc_rating: number | null }) => p.qc_rating != null && p.qc_rating < 20);
  const unknownBrand = products.filter((p: { brand: string }) => !p.brand || p.brand === "Unknown" || p.brand === "Various");
  const shortName = products.filter((p: { name: string }) => p.name.length < 5);
  const zeroViews = products.filter((p: { views: number }) => p.views === 0);

  // Duplicates
  const nameCounts: Record<string, number> = {};
  products.forEach((p: { name: string }) => {
    const lower = p.name.toLowerCase().trim();
    nameCounts[lower] = (nameCounts[lower] || 0) + 1;
  });
  const duplicates = Object.entries(nameCounts).filter(([, c]) => c > 1).length;

  // Category health
  const catStats: Record<string, { scores: number[]; viewsTotal: number }> = {};
  products.forEach((p: { category: string; qc_rating: number | null; views: number }) => {
    const cat = p.category || "Uncategorized";
    if (!catStats[cat]) catStats[cat] = { scores: [], viewsTotal: 0 };
    if (p.qc_rating != null) catStats[cat].scores.push(p.qc_rating);
    catStats[cat].viewsTotal += p.views || 0;
  });
  const lowQualityCategories = Object.entries(catStats)
    .filter(([, d]) => d.scores.length > 0 && d.scores.reduce((a, b) => a + b, 0) / d.scores.length < 30)
    .map(([name]) => name);
  const zeroViewCategories = Object.entries(catStats)
    .filter(([, d]) => d.viewsTotal === 0)
    .map(([name]) => name);

  // Freshness
  const now = Date.now();
  const week = products.filter((p: { created_at: string }) => now - new Date(p.created_at).getTime() < 7 * 86400000).length;
  const month = products.filter((p: { created_at: string }) => now - new Date(p.created_at).getTime() < 30 * 86400000).length;

  const sorted = [...products].sort((a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const lastImport = sorted.length > 0 ? sorted[0].created_at : null;
  const daysSinceImport = lastImport ? Math.floor((now - new Date(lastImport).getTime()) / 86400000) : null;

  // Last blog post
  const { data: lastBlog } = await supabase
    .from("blog_posts")
    .select("published_at")
    .order("published_at", { ascending: false })
    .limit(1);

  return NextResponse.json({
    alerts: {
      noImage: noImage.length,
      lowScore: lowScore.length,
      unknownBrand: unknownBrand.length,
      shortName: shortName.length,
      duplicates,
      zeroViews: zeroViews.length,
    },
    categoryHealth: {
      lowQuality: lowQualityCategories,
      zeroViews: zeroViewCategories,
    },
    freshness: {
      addedThisWeek: week,
      addedThisMonth: month,
      daysSinceImport,
      lastBlogPost: lastBlog?.[0]?.published_at || null,
    },
  });
}
