"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Chart: any;
  }
}

const TABS = ["Overview", "Products", "Engagement", "Content", "Categories", "Health"] as const;
type Tab = (typeof TABS)[number];

const DATE_RANGES = [
  { label: "1d", days: 1 },
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

// ── Shared UI ──────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6 ${className}`}>{children}</div>;
}

function StatBox({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <p className="text-[28px] font-bold leading-none text-white">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="mt-2 text-[13px] text-gray-400">{label}</p>
      {sub && <p className="mt-1 text-[11px] text-gray-500">{sub}</p>}
    </Card>
  );
}

function Spinner() {
  return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FE4205] border-t-transparent" /></div>;
}

// ── Main Component ─────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [storedPw, setStoredPw] = useState("");
  const [tab, setTab] = useState<Tab>("Overview");
  const [rangeDays, setRangeDays] = useState(30);
  const [chartReady, setChartReady] = useState(false);

  // Tab data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const loadedTabs = useRef<Set<string>>(new Set());

  // Auth
  useEffect(() => {
    const saved = sessionStorage.getItem("admin-auth");
    if (saved) { setStoredPw(saved); setAuthed(true); }
  }, []);
  const handleLogin = () => {
    if (!password) return;
    setStoredPw(password);
    sessionStorage.setItem("admin-auth", password);
    setAuthed(true);
  };

  // Chart.js
  useEffect(() => {
    if (!authed) return;
    if (typeof window !== "undefined" && window.Chart) { setChartReady(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/chart.js";
    s.onload = () => setChartReady(true);
    document.head.appendChild(s);
  }, [authed]);

  const getDateFilter = useCallback(() => {
    if (rangeDays === 0) return "";
    const d = new Date(); d.setDate(d.getDate() - rangeDays);
    return d.toISOString();
  }, [rangeDays]);

  const headers = useCallback(() => ({ "x-admin-password": storedPw }), [storedPw]);

  // Fetch tab data
  const fetchTab = useCallback(async (t: Tab, force = false) => {
    const key = `${t}-${rangeDays}`;
    if (!force && loadedTabs.current.has(key)) return;
    setLoading(true);
    try {
      const from = getDateFilter();
      const tabKey = t.toLowerCase();
      const params = new URLSearchParams({ tab: tabKey });
      if (from) params.set("from", from);
      const res = await fetch(`/api/admin/analytics?${params}`, { headers: headers() });
      if (res.ok) {
        const json = await res.json();
        setData(prev => ({ ...prev, [tabKey]: json }));
        loadedTabs.current.add(key);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [rangeDays, getDateFilter, headers]);

  // Product tab state
  const [prodSort, setProdSort] = useState("views");
  const [prodOrder, setProdOrder] = useState("desc");
  const [prodPage, setProdPage] = useState(1);
  const [prodLimit, setProdLimit] = useState(50);
  const [prodSearch, setProdSearch] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodBrand, setProdBrand] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      tab: "products",
      sort: prodSort,
      order: prodOrder,
      page: String(prodPage),
      limit: String(prodLimit),
    });
    if (prodSearch) params.set("search", prodSearch);
    if (prodCategory) params.set("category", prodCategory);
    if (prodBrand) params.set("brand", prodBrand);
    try {
      const res = await fetch(`/api/admin/analytics?${params}`, { headers: headers() });
      if (res.ok) {
        const json = await res.json();
        setData(prev => ({ ...prev, products: json }));
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [prodSort, prodOrder, prodPage, prodLimit, prodSearch, prodCategory, prodBrand, headers]);

  useEffect(() => {
    if (authed && tab === "Products") fetchProducts();
  }, [authed, tab, fetchProducts]);

  useEffect(() => {
    if (authed && tab !== "Products") fetchTab(tab);
  }, [authed, tab, fetchTab]);

  // Refetch when range changes (for overview/engagement)
  useEffect(() => {
    if (!authed) return;
    loadedTabs.current.clear();
    if (tab !== "Products") fetchTab(tab, true);
  }, [rangeDays]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login ──
  if (!authed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-8">
          <h1 className="mb-6 text-center font-heading text-xl font-bold text-white">Analytics Login</h1>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Admin password"
            className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FE4205]/50" />
          <button onClick={handleLogin}
            className="mt-4 w-full rounded-lg bg-[#FE4205] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Command Center</h1>
          <p className="mt-1 text-sm text-gray-400">Site performance, engagement &amp; data health</p>
        </div>
        <Link href="/admin" className="inline-flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#141414] px-4 py-2 text-sm text-gray-400 hover:text-white">
          ← Back to Admin
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1 rounded-xl bg-[#0f0f0f] p-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-[#FE4205] text-white" : "text-gray-400 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Date range (for Overview & Engagement) */}
      {(tab === "Overview" || tab === "Engagement") && (
        <div className="mb-6 flex flex-wrap gap-2">
          {DATE_RANGES.map(r => (
            <button key={r.label} onClick={() => setRangeDays(r.days)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${rangeDays === r.days ? "bg-[#FE4205] text-white" : "bg-[#141414] text-gray-400 hover:text-white"}`}>
              {r.label}
            </button>
          ))}
        </div>
      )}

      {loading && <Spinner />}

      {/* Tab content */}
      {!loading && tab === "Overview" && <OverviewTab data={data.overview} chartReady={chartReady} />}
      {!loading && tab === "Products" && (
        <ProductsTab
          data={data.products}
          sort={prodSort} onSort={s => { setProdSort(s); setProdPage(1); }}
          order={prodOrder} onOrder={o => { setProdOrder(o); setProdPage(1); }}
          page={prodPage} onPage={setProdPage}
          limit={prodLimit} onLimit={l => { setProdLimit(l); setProdPage(1); }}
          search={prodSearch} onSearch={s => { setProdSearch(s); setProdPage(1); }}
          category={prodCategory} onCategory={c => { setProdCategory(c); setProdPage(1); }}
          brand={prodBrand} onBrand={b => { setProdBrand(b); setProdPage(1); }}
        />
      )}
      {!loading && tab === "Engagement" && <EngagementTab data={data.engagement} chartReady={chartReady} />}
      {!loading && tab === "Content" && <ContentTab data={data.content} chartReady={chartReady} />}
      {!loading && tab === "Categories" && <CategoriesTab data={data.categories} chartReady={chartReady} />}
      {!loading && tab === "Health" && <HealthTab data={data.health} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// TAB 1: OVERVIEW
// ════════════════════════════════════════════════════════════════════════
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OverviewTab({ data, chartReady }: { data: any; chartReady: boolean }) {
  const viewsRef = useRef<HTMLCanvasElement>(null);
  const topRef = useRef<HTMLCanvasElement>(null);
  const agentRef = useRef<HTMLCanvasElement>(null);
  const hourlyRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const charts = useRef<any[]>([]);

  useEffect(() => {
    if (!chartReady || !data || !window.Chart) return;
    charts.current.forEach(c => c.destroy());
    charts.current = [];
    const Chart = window.Chart;
    const grid = { color: "rgba(255,255,255,0.06)" };
    const tick = { color: "#6B7280" };

    if (viewsRef.current && data.viewsOverTime?.length > 0) {
      charts.current.push(new Chart(viewsRef.current, {
        type: "line",
        data: { labels: data.viewsOverTime.map((v: { date: string }) => v.date.slice(5)), datasets: [{ label: "Views", data: data.viewsOverTime.map((v: { count: number }) => v.count), borderColor: "#FE4205", backgroundColor: "rgba(254,66,5,0.1)", fill: true, tension: 0.3, pointRadius: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: "Daily Page Views", color: "#fff", font: { size: 14 } } }, scales: { x: { ticks: tick, grid }, y: { ticks: tick, grid, beginAtZero: true } } },
      }));
    }
    if (topRef.current && data.topViewed?.length > 0) {
      charts.current.push(new Chart(topRef.current, {
        type: "bar",
        data: { labels: data.topViewed.map((p: { name: string }) => p.name.slice(0, 25)), datasets: [{ label: "Views", data: data.topViewed.map((p: { views: number }) => p.views), backgroundColor: "rgba(254,66,5,0.8)", borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, indexAxis: "y", plugins: { legend: { display: false }, title: { display: true, text: "Top 10 Most Viewed Products", color: "#fff", font: { size: 14 } } }, scales: { x: { ticks: tick, grid, beginAtZero: true }, y: { ticks: { ...tick, font: { size: 10 } }, grid: { display: false } } } },
      }));
    }
    if (agentRef.current && data.agentClicks?.length > 0) {
      const palette = ["#FE4205", "#FF6B3D", "#FF9470", "#FFB89E", "#FFD5C4", "#E63B04", "#CC3503", "#B32E03"];
      charts.current.push(new Chart(agentRef.current, {
        type: "doughnut",
        data: { labels: data.agentClicks.map((a: { agent_name: string }) => a.agent_name), datasets: [{ data: data.agentClicks.map((a: { count: number }) => a.count), backgroundColor: data.agentClicks.map((_: unknown, i: number) => palette[i % palette.length]), borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right", labels: { color: "#9CA3AF", padding: 12, font: { size: 11 } } }, title: { display: true, text: "Agent Click Distribution", color: "#fff", font: { size: 14 } } } },
      }));
    }
    if (hourlyRef.current && data.hourlyActivity?.length > 0) {
      charts.current.push(new Chart(hourlyRef.current, {
        type: "bar",
        data: { labels: data.hourlyActivity.map((h: { hour: number }) => `${String(h.hour).padStart(2, "0")}:00`), datasets: [{ label: "Events", data: data.hourlyActivity.map((h: { count: number }) => h.count), backgroundColor: "rgba(254,66,5,0.7)", borderRadius: 3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: "Hourly Activity", color: "#fff", font: { size: 14 } } }, scales: { x: { ticks: { ...tick, maxRotation: 45 }, grid }, y: { ticks: tick, grid, beginAtZero: true } } },
      }));
    }
    return () => { charts.current.forEach(c => c.destroy()); charts.current = []; };
  }, [chartReady, data]);

  if (!data) return <p className="text-sm text-gray-500">No data</p>;
  const s = data.stats || {};

  return (
    <>
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatBox label="Total Products" value={s.totalProducts || 0} />
        <StatBox label="Total Views" value={s.totalViews || 0} />
        <StatBox label="Total Likes" value={s.totalLikes || 0} />
        <StatBox label="Subscribers" value={s.subscriberCount || 0} />
        <StatBox label="Blog Comments" value={s.commentCount || 0} />
        <StatBox label="Agent Clicks" value={s.agentClicks || 0} sub={`${s.converterUses || 0} converter uses`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><canvas ref={viewsRef} className="h-[300px] w-full" /></Card>
        <Card><canvas ref={topRef} className="h-[300px] w-full" /></Card>
        <Card><canvas ref={agentRef} className="h-[300px] w-full" /></Card>
        <Card><canvas ref={hourlyRef} className="h-[250px] w-full" /></Card>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════
// TAB 2: PRODUCTS
// ════════════════════════════════════════════════════════════════════════
interface ProductsTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  sort: string; onSort: (s: string) => void;
  order: string; onOrder: (o: string) => void;
  page: number; onPage: (p: number) => void;
  limit: number; onLimit: (l: number) => void;
  search: string; onSearch: (s: string) => void;
  category: string; onCategory: (c: string) => void;
  brand: string; onBrand: (b: string) => void;
}

function ProductsTab({ data, sort, onSort, order, onOrder, page, onPage, limit, onLimit, search, onSearch, category, onCategory, brand, onBrand }: ProductsTabProps) {
  if (!data) return <Spinner />;
  const summary = data.summary || {};
  const products = data.products || [];
  const totalPages = Math.ceil((data.totalCount || 0) / limit);

  const sortOptions = [
    { value: "views", label: "Views" },
    { value: "likes", label: "Likes" },
    { value: "score", label: "Score" },
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "name", label: "Name" },
  ];

  return (
    <>
      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatBox label="Total Products" value={summary.total || 0} />
        <StatBox label="With Images" value={summary.withImages || 0} sub={summary.total ? `${Math.round((summary.withImages / summary.total) * 100)}%` : ""} />
        <StatBox label="Average Score" value={summary.avgScore || "0"} />
        <StatBox label="Added This Week" value={summary.addedThisWeek || 0} />
        <StatBox label="Zero Views" value={summary.zeroViews || 0} />
        <StatBox label="Unknown Brand" value={summary.unknownBrands || 0} />
      </div>

      {/* Quick insights sidebar layout */}
      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <input placeholder="Search by name..." value={search} onChange={e => onSearch(e.target.value)}
              className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FE4205]/50 w-48" />
            <select value={category} onChange={e => onCategory(e.target.value)}
              className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none">
              <option value="">All Categories</option>
              {(data.allCategories || []).map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={brand} onChange={e => onBrand(e.target.value)}
              className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none">
              <option value="">All Brands</option>
              {(data.allBrands || []).slice(0, 100).map((b: string) => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={sort} onChange={e => onSort(e.target.value)}
              className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none">
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={() => onOrder(order === "desc" ? "asc" : "desc")}
              className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0a0a0a] px-3 py-2 text-sm text-gray-400 hover:text-white">
              {order === "desc" ? "↓ Desc" : "↑ Asc"}
            </button>
            <select value={limit} onChange={e => onLimit(Number(e.target.value))}
              className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none">
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Product table */}
          <Card className="overflow-x-auto !p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)] text-left text-xs text-gray-500">
                  <th className="pb-3 pr-2">#</th>
                  <th className="pb-3 pr-2">Image</th>
                  <th className="pb-3 pr-2">Name</th>
                  <th className="pb-3 pr-2">Brand</th>
                  <th className="pb-3 pr-2">Category</th>
                  <th className="pb-3 pr-2 text-right">Views</th>
                  <th className="pb-3 pr-2 text-right">Likes</th>
                  <th className="pb-3 pr-2 text-right">Dislikes</th>
                  <th className="pb-3 pr-2 text-right">Like %</th>
                  <th className="pb-3 pr-2 text-right">Score</th>
                  <th className="pb-3 text-right">Created</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: { id: number; name: string; brand: string; category: string; image: string; views: number; likes: number; dislikes: number; qc_rating: number | null; created_at: string }, i: number) => {
                  const likeRatio = (p.likes + p.dislikes) > 0 ? Math.round((p.likes / (p.likes + p.dislikes)) * 100) : 0;
                  return (
                    <tr key={p.id} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[#FE4205]/5">
                      <td className="py-2 pr-2 text-gray-500">{(page - 1) * limit + i + 1}</td>
                      <td className="py-2 pr-2">
                        {p.image ? (
                          <Image src={p.image} alt="" width={32} height={32} className="h-8 w-8 rounded object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded bg-[#0a0a0a]" />
                        )}
                      </td>
                      <td className="max-w-[200px] truncate py-2 pr-2">
                        <Link href={`/products/${p.id}`} className="text-white hover:text-[#FE4205]">{p.name}</Link>
                      </td>
                      <td className="py-2 pr-2 text-gray-400">{p.brand}</td>
                      <td className="py-2 pr-2 text-gray-400">{p.category}</td>
                      <td className="py-2 pr-2 text-right text-white">{p.views.toLocaleString()}</td>
                      <td className="py-2 pr-2 text-right text-green-400">{p.likes}</td>
                      <td className="py-2 pr-2 text-right text-red-400">{p.dislikes}</td>
                      <td className="py-2 pr-2 text-right text-gray-400">{likeRatio}%</td>
                      <td className="py-2 pr-2 text-right text-white">{p.qc_rating ?? "—"}</td>
                      <td className="py-2 text-right text-gray-500 text-xs">{p.created_at?.slice(0, 10)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <p className="text-gray-500">{data.totalCount} products · Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}
                    className="rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-1 text-gray-400 hover:text-white disabled:opacity-30">
                    ← Prev
                  </button>
                  <button onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
                    className="rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-1 text-gray-400 hover:text-white disabled:opacity-30">
                    Next →
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Quick insights panel */}
        <div className="space-y-4">
          <Card>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Top Brands</h4>
            {(data.topBrands || []).map((b: { name: string; count: number }) => (
              <div key={b.name} className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-white">{b.name}</span>
                <span className="text-gray-400">{b.count}</span>
              </div>
            ))}
          </Card>
          <Card>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Top Categories</h4>
            {(data.topCategories || []).map((c: { name: string; count: number }) => (
              <div key={c.name} className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-white">{c.name}</span>
                <span className="text-gray-400">{c.count}</span>
              </div>
            ))}
          </Card>
          <Card>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Score Distribution</h4>
            {["0-20", "21-40", "41-60", "61-80", "81-100"].map((label, i) => {
              const val = (data.scoreDistribution || [])[i] || 0;
              const total = (data.scoreDistribution || []).reduce((a: number, b: number) => a + b, 0) || 1;
              return (
                <div key={label} className="mb-2">
                  <div className="flex justify-between text-xs text-gray-400"><span>{label}</span><span>{val}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-[#0a0a0a]">
                    <div className="h-2 rounded-full bg-[#FE4205]" style={{ width: `${(val / total) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════
// TAB 3: ENGAGEMENT
// ════════════════════════════════════════════════════════════════════════
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EngagementTab({ data, chartReady }: { data: any; chartReady: boolean }) {
  const pieRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLCanvasElement>(null);
  const searchRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const charts = useRef<any[]>([]);

  useEffect(() => {
    if (!chartReady || !data || !window.Chart) return;
    charts.current.forEach(c => c.destroy());
    charts.current = [];
    const Chart = window.Chart;
    const grid = { color: "rgba(255,255,255,0.06)" };
    const tick = { color: "#6B7280" };
    const palette = ["#FE4205", "#FF6B3D", "#FF9470", "#FFB89E", "#FFD5C4", "#E63B04", "#CC3503", "#B32E03"];

    if (pieRef.current && data.agentBreakdown?.length > 0) {
      charts.current.push(new Chart(pieRef.current, {
        type: "doughnut",
        data: { labels: data.agentBreakdown.map((a: { name: string }) => a.name), datasets: [{ data: data.agentBreakdown.map((a: { count: number }) => a.count), backgroundColor: data.agentBreakdown.map((_: unknown, i: number) => palette[i % palette.length]), borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right", labels: { color: "#9CA3AF", padding: 12 } }, title: { display: true, text: "Agent Click Breakdown", color: "#fff", font: { size: 14 } } } },
      }));
    }
    if (lineRef.current && data.clicksOverTime?.length > 0) {
      charts.current.push(new Chart(lineRef.current, {
        type: "line",
        data: { labels: data.clicksOverTime.map((c: { date: string }) => c.date.slice(5)), datasets: [{ label: "Agent Clicks", data: data.clicksOverTime.map((c: { count: number }) => c.count), borderColor: "#FE4205", backgroundColor: "rgba(254,66,5,0.1)", fill: true, tension: 0.3, pointRadius: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: "Agent Clicks Over Time", color: "#fff", font: { size: 14 } } }, scales: { x: { ticks: tick, grid }, y: { ticks: tick, grid, beginAtZero: true } } },
      }));
    }
    if (searchRef.current && data.searchOverTime?.length > 0) {
      charts.current.push(new Chart(searchRef.current, {
        type: "line",
        data: { labels: data.searchOverTime.map((s: { date: string }) => s.date.slice(5)), datasets: [{ label: "Searches", data: data.searchOverTime.map((s: { count: number }) => s.count), borderColor: "#3B82F6", backgroundColor: "rgba(59,130,246,0.1)", fill: true, tension: 0.3, pointRadius: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: "Search Volume Over Time", color: "#fff", font: { size: 14 } } }, scales: { x: { ticks: tick, grid }, y: { ticks: tick, grid, beginAtZero: true } } },
      }));
    }
    return () => { charts.current.forEach(c => c.destroy()); charts.current = []; };
  }, [chartReady, data]);

  if (!data) return <p className="text-sm text-gray-500">No data</p>;

  return (
    <>
      {/* Agent click stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatBox label="Total Agent Clicks" value={data.totalClicks || 0} />
        <StatBox label="Clicks Today" value={data.clicksToday || 0} />
        <StatBox label="Clicks This Week" value={data.clicksWeek || 0} />
        <StatBox label="Clicks This Month" value={data.clicksMonth || 0} />
        <StatBox label="Overall CTR" value={`${data.overallCtr || 0}%`} sub="agent clicks / product views" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><canvas ref={pieRef} className="h-[300px] w-full" /></Card>
        <Card><canvas ref={lineRef} className="h-[300px] w-full" /></Card>

        {/* Top products by clicks */}
        <Card className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-white">Top Products by Agent Clicks</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)] text-left text-xs text-gray-500">
                  <th className="pb-3 pr-4">Product</th>
                  <th className="pb-3 pr-4 text-right">Views</th>
                  <th className="pb-3 pr-4 text-right">Agent Clicks</th>
                  <th className="pb-3 text-right">CTR</th>
                </tr>
              </thead>
              <tbody>
                {(data.topByClicks || []).map((p: { id: number; name: string; views: number; clicks: number; ctr: string }) => (
                  <tr key={p.id} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[#FE4205]/5">
                    <td className="py-2.5 pr-4"><Link href={`/products/${p.id}`} className="text-white hover:text-[#FE4205]">{p.name}</Link></td>
                    <td className="py-2.5 pr-4 text-right text-gray-400">{p.views.toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-right text-white">{p.clicks}</td>
                    <td className="py-2.5 text-right text-[#FE4205]">{p.ctr}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Search analytics */}
      <h3 className="mb-4 mt-10 font-heading text-lg font-bold text-white">Search Analytics</h3>
      <div className="mb-4 text-sm text-gray-400">{data.totalSearches || 0} total searches</div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><canvas ref={searchRef} className="h-[250px] w-full" /></Card>
        <div className="grid gap-6">
          <Card>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Top Searches</h4>
            <div className="max-h-[200px] overflow-y-auto">
              {(data.topSearches || []).map((s: { query: string; count: number }) => (
                <div key={s.query} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-white">{s.query}</span>
                  <span className="text-gray-400">{s.count}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-red-400">Zero Result Searches</h4>
            <div className="max-h-[200px] overflow-y-auto">
              {(data.zeroResultSearches || []).length === 0 && <p className="text-sm text-gray-500">None</p>}
              {(data.zeroResultSearches || []).map((s: { query: string; count: number }) => (
                <div key={s.query} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-white">{s.query}</span>
                  <span className="text-red-400">{s.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <p className="text-sm text-gray-500">📌 Wishlists are stored in localStorage — server-side tracking is not available.</p>
      </Card>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════
// TAB 4: CONTENT
// ════════════════════════════════════════════════════════════════════════
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ContentTab({ data, chartReady }: { data: any; chartReady: boolean }) {
  const growthRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const charts = useRef<any[]>([]);

  useEffect(() => {
    if (!chartReady || !data || !window.Chart) return;
    charts.current.forEach(c => c.destroy());
    charts.current = [];
    const Chart = window.Chart;
    if (growthRef.current && data.subscriberGrowth?.length > 0) {
      // Cumulative growth
      let cum = 0;
      const cumData = data.subscriberGrowth.map((s: { date: string; count: number }) => { cum += s.count; return { date: s.date, count: cum }; });
      charts.current.push(new Chart(growthRef.current, {
        type: "line",
        data: { labels: cumData.map((s: { date: string }) => s.date.slice(5)), datasets: [{ label: "Subscribers", data: cumData.map((s: { count: number }) => s.count), borderColor: "#10B981", backgroundColor: "rgba(16,185,129,0.1)", fill: true, tension: 0.3, pointRadius: 1 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: "Subscriber Growth (Cumulative)", color: "#fff", font: { size: 14 } } }, scales: { x: { ticks: { color: "#6B7280" }, grid: { color: "rgba(255,255,255,0.06)" } }, y: { ticks: { color: "#6B7280" }, grid: { color: "rgba(255,255,255,0.06)" }, beginAtZero: true } } },
      }));
    }
    return () => { charts.current.forEach(c => c.destroy()); charts.current = []; };
  }, [chartReady, data]);

  if (!data) return <p className="text-sm text-gray-500">No data</p>;

  return (
    <>
      {/* Newsletter stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox label="Total Subscribers" value={data.totalSubs || 0} />
        <StatBox label="This Week" value={data.subsWeek || 0} />
        <StatBox label="This Month" value={data.subsMonth || 0} />
        <StatBox label="Blog Posts" value={data.totalPosts || 0} sub={`${data.totalComments || 0} comments`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><canvas ref={growthRef} className="h-[300px] w-full" /></Card>

        {/* Blog posts table */}
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-white">Blog Posts</h3>
          <div className="max-h-[280px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)] text-left text-xs text-gray-500">
                  <th className="pb-2 pr-2">Title</th>
                  <th className="pb-2 pr-2 text-right">Comments</th>
                  <th className="pb-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {(data.posts || []).map((p: { id: string; title: string; slug: string; published_at: string; comments: number }) => (
                  <tr key={p.id} className="border-b border-[rgba(255,255,255,0.03)]">
                    <td className="max-w-[200px] truncate py-2 pr-2 text-white">{p.title}</td>
                    <td className="py-2 pr-2 text-right text-gray-400">{p.comments}</td>
                    <td className="py-2 text-right text-xs text-gray-500">{p.published_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Recent subscribers */}
      <Card className="mt-6">
        <h3 className="mb-4 text-sm font-semibold text-white">Recent Subscribers (Last 50)</h3>
        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)] text-left text-xs text-gray-500">
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Source</th>
                <th className="pb-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {(data.recentSubs || []).map((s: { email: string; source: string; subscribed_at: string }, i: number) => (
                <tr key={i} className="border-b border-[rgba(255,255,255,0.03)]">
                  <td className="py-2 pr-4 text-white">{s.email}</td>
                  <td className="py-2 pr-4 text-gray-400">{s.source || "—"}</td>
                  <td className="py-2 text-right text-xs text-gray-500">{s.subscribed_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Collections */}
      {(data.collections || []).length > 0 && (
        <Card className="mt-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Collections</h3>
          <div className="flex flex-wrap gap-2">
            {(data.collections || []).map((c: { id: string; name: string; slug: string; published: boolean }) => (
              <span key={c.id} className={`rounded-pill px-3 py-1 text-xs font-medium ${c.published ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"}`}>
                {c.name} {!c.published && "(draft)"}
              </span>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════
// TAB 5: CATEGORIES & BRANDS
// ════════════════════════════════════════════════════════════════════════
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CategoriesTab({ data, chartReady }: { data: any; chartReady: boolean }) {
  const catRef = useRef<HTMLCanvasElement>(null);
  const brandRef = useRef<HTMLCanvasElement>(null);
  const tierRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const charts = useRef<any[]>([]);

  useEffect(() => {
    if (!chartReady || !data || !window.Chart) return;
    charts.current.forEach(c => c.destroy());
    charts.current = [];
    const Chart = window.Chart;
    const grid = { color: "rgba(255,255,255,0.06)" };
    const tick = { color: "#6B7280" };

    if (catRef.current && data.categoryBreakdown?.length > 0) {
      charts.current.push(new Chart(catRef.current, {
        type: "bar",
        data: { labels: data.categoryBreakdown.map((c: { name: string }) => c.name), datasets: [{ label: "Products", data: data.categoryBreakdown.map((c: { count: number }) => c.count), backgroundColor: "rgba(254,66,5,0.8)", borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, indexAxis: "y", plugins: { legend: { display: false }, title: { display: true, text: "Products per Category", color: "#fff", font: { size: 14 } } }, scales: { x: { ticks: tick, grid, beginAtZero: true }, y: { ticks: { ...tick, font: { size: 10 } }, grid: { display: false } } } },
      }));
    }
    if (brandRef.current && data.brandBreakdown?.length > 0) {
      const top30 = data.brandBreakdown.slice(0, 30);
      charts.current.push(new Chart(brandRef.current, {
        type: "bar",
        data: { labels: top30.map((b: { name: string }) => b.name.slice(0, 20)), datasets: [{ label: "Products", data: top30.map((b: { count: number }) => b.count), backgroundColor: "rgba(59,130,246,0.8)", borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, indexAxis: "y", plugins: { legend: { display: false }, title: { display: true, text: "Top 30 Brands by Product Count", color: "#fff", font: { size: 14 } } }, scales: { x: { ticks: tick, grid, beginAtZero: true }, y: { ticks: { ...tick, font: { size: 9 } }, grid: { display: false } } } },
      }));
    }
    if (tierRef.current && data.tierBreakdown?.length > 0) {
      const palette = ["#6B7280", "#F59E0B", "#10B981", "#FE4205", "#9CA3AF"];
      charts.current.push(new Chart(tierRef.current, {
        type: "doughnut",
        data: { labels: data.tierBreakdown.map((t: { name: string }) => t.name), datasets: [{ data: data.tierBreakdown.map((t: { count: number }) => t.count), backgroundColor: data.tierBreakdown.map((_: unknown, i: number) => palette[i % palette.length]), borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right", labels: { color: "#9CA3AF", padding: 12 } }, title: { display: true, text: "Tier Distribution", color: "#fff", font: { size: 14 } } } },
      }));
    }
    return () => { charts.current.forEach(c => c.destroy()); charts.current = []; };
  }, [chartReady, data]);

  if (!data) return <p className="text-sm text-gray-500">No data</p>;

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatBox label="Total Categories" value={data.totalCategories || 0} />
        <StatBox label="Total Brands" value={data.totalBrands || 0} />
        <StatBox label="Main Collection" value={data.collectionSplit?.main || 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><canvas ref={catRef} className="h-[400px] w-full" /></Card>
        <Card><canvas ref={tierRef} className="h-[300px] w-full" /></Card>
        <Card className="lg:col-span-2"><canvas ref={brandRef} className="h-[500px] w-full" /></Card>
      </div>

      {/* Category table */}
      <Card className="mt-6">
        <h3 className="mb-4 text-sm font-semibold text-white">Category Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)] text-left text-xs text-gray-500">
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4 text-right">Products</th>
                <th className="pb-3 pr-4 text-right">Avg Score</th>
                <th className="pb-3 pr-4 text-right">Avg Views</th>
                <th className="pb-3 text-right">Avg Likes</th>
              </tr>
            </thead>
            <tbody>
              {(data.categoryBreakdown || []).map((c: { name: string; count: number; avgScore: number; avgViews: number; avgLikes: number }) => (
                <tr key={c.name} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[#FE4205]/5">
                  <td className="py-2.5 pr-4 text-white">{c.name} {c.count < 5 && <span className="text-xs text-yellow-400">(low)</span>}</td>
                  <td className="py-2.5 pr-4 text-right text-gray-400">{c.count}</td>
                  <td className="py-2.5 pr-4 text-right text-gray-400">{c.avgScore}</td>
                  <td className="py-2.5 pr-4 text-right text-gray-400">{c.avgViews}</td>
                  <td className="py-2.5 text-right text-gray-400">{c.avgLikes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Brand table */}
      <Card className="mt-6">
        <h3 className="mb-4 text-sm font-semibold text-white">Brand Details (Top 50)</h3>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#141414]">
              <tr className="border-b border-[rgba(255,255,255,0.06)] text-left text-xs text-gray-500">
                <th className="pb-3 pr-4">Brand</th>
                <th className="pb-3 pr-4 text-right">Products</th>
                <th className="pb-3 pr-4 text-right">Avg Score</th>
                <th className="pb-3 pr-4 text-right">Avg Views</th>
                <th className="pb-3">Categories</th>
              </tr>
            </thead>
            <tbody>
              {(data.brandBreakdown || []).map((b: { name: string; count: number; avgScore: number; avgViews: number; categories: string }) => (
                <tr key={b.name} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[#FE4205]/5">
                  <td className="py-2.5 pr-4 text-white">{b.name}</td>
                  <td className="py-2.5 pr-4 text-right text-gray-400">{b.count}</td>
                  <td className="py-2.5 pr-4 text-right text-gray-400">{b.avgScore}</td>
                  <td className="py-2.5 pr-4 text-right text-gray-400">{b.avgViews}</td>
                  <td className="py-2.5 text-xs text-gray-500 max-w-[200px] truncate">{b.categories}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tier details */}
      {(data.tierBreakdown || []).length > 0 && (
        <Card className="mt-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Tier Breakdown</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(data.tierBreakdown || []).map((t: { name: string; count: number; avgPrice: number }) => (
              <div key={t.name} className="rounded-lg bg-[#0a0a0a] p-4 text-center">
                <p className="text-lg font-bold text-white">{t.count}</p>
                <p className="text-xs text-gray-400 capitalize">{t.name}</p>
                {t.avgPrice > 0 && <p className="mt-1 text-xs text-gray-500">Avg ¥{t.avgPrice}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════
// TAB 6: HEALTH & ALERTS
// ════════════════════════════════════════════════════════════════════════
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HealthTab({ data }: { data: any }) {
  if (!data) return <p className="text-sm text-gray-500">No data</p>;
  const alerts = data.alerts || {};
  const cat = data.categoryHealth || {};
  const fresh = data.freshness || {};

  const alertItems = [
    { label: "Products without images", value: alerts.noImage, color: "text-red-400", link: "/admin/products" },
    { label: "Products with score < 20", value: alerts.lowScore, color: "text-yellow-400" },
    { label: "Brand = Unknown/Various", value: alerts.unknownBrand, color: "text-yellow-400", link: "/admin/products" },
    { label: "Very short names (<5 chars)", value: alerts.shortName, color: "text-yellow-400" },
    { label: "Duplicate product names", value: alerts.duplicates, color: "text-orange-400" },
    { label: "Products with 0 views", value: alerts.zeroViews, color: "text-gray-400" },
  ];

  return (
    <>
      <h2 className="mb-4 font-heading text-lg font-bold text-white">Data Quality Alerts</h2>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {alertItems.map(a => (
          <Card key={a.label} className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${a.value > 0 ? a.color : "text-green-400"}`}>{a.value || 0}</p>
              <p className="mt-1 text-xs text-gray-400">{a.label}</p>
            </div>
            {a.link && a.value > 0 && (
              <Link href={a.link} className="rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs text-gray-400 hover:text-white">
                View →
              </Link>
            )}
          </Card>
        ))}
      </div>

      <h2 className="mb-4 font-heading text-lg font-bold text-white">Category Health</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-red-400">Low Quality Categories (avg score &lt;30)</h4>
          {(cat.lowQuality || []).length === 0 ? (
            <p className="text-sm text-green-400">✓ All categories above threshold</p>
          ) : (
            <div className="space-y-1">
              {(cat.lowQuality || []).map((c: string) => (
                <p key={c} className="text-sm text-white">{c}</p>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-yellow-400">Zero Views Categories</h4>
          {(cat.zeroViews || []).length === 0 ? (
            <p className="text-sm text-green-400">✓ All categories have views</p>
          ) : (
            <div className="space-y-1">
              {(cat.zeroViews || []).map((c: string) => (
                <p key={c} className="text-sm text-white">{c}</p>
              ))}
            </div>
          )}
        </Card>
      </div>

      <h2 className="mb-4 font-heading text-lg font-bold text-white">Freshness</h2>
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox label="Added This Week" value={fresh.addedThisWeek || 0} />
        <StatBox label="Added This Month" value={fresh.addedThisMonth || 0} />
        <StatBox label="Days Since Last Import" value={fresh.daysSinceImport ?? "—"} />
        <StatBox label="Last Blog Post" value={fresh.lastBlogPost ? fresh.lastBlogPost.slice(0, 10) : "—"} />
      </div>

      <h2 className="mb-4 font-heading text-lg font-bold text-white">Quick Actions</h2>
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/products" className="rounded-btn bg-[#FE4205] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">
          View Products Without Images
        </Link>
        <Link href="/admin/products" className="rounded-btn border border-[rgba(255,255,255,0.1)] bg-[#141414] px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white">
          View Unknown Brand Products
        </Link>
        <Link href="/admin" className="rounded-btn border border-[rgba(255,255,255,0.1)] bg-[#141414] px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white">
          Run Category Audit
        </Link>
      </div>
    </>
  );
}
