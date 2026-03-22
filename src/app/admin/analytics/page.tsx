"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Chart: any;
  }
}

interface StatCard {
  label: string;
  value: number;
}

interface TopProduct {
  product_id: number;
  name: string;
  category: string;
  views: number;
  clicks: number;
}

interface SearchEntry {
  query: string;
  count: number;
}

const DATE_RANGES = [
  { label: "Today", days: 1 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "All time", days: 0 },
];

export default function AnalyticsPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("");
  const [rangeDays, setRangeDays] = useState(30);
  const [chartReady, setChartReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState<StatCard[]>([]);
  const [viewsOverTime, setViewsOverTime] = useState<{ date: string; count: number }[]>([]);
  const [agentClicks, setAgentClicks] = useState<{ agent_name: string; count: number }[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ category: string; count: number }[]>([]);
  const [popularSearches, setPopularSearches] = useState<SearchEntry[]>([]);
  const [hourlyActivity, setHourlyActivity] = useState<{ hour: number; count: number }[]>([]);
  const [hasData, setHasData] = useState(true);

  // Chart refs
  const viewsChartRef = useRef<HTMLCanvasElement>(null);
  const agentChartRef = useRef<HTMLCanvasElement>(null);
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const hourlyChartRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartInstances = useRef<Record<string, any>>({});

  // Auth check
  useEffect(() => {
    const saved = sessionStorage.getItem("admin-auth");
    if (saved) {
      setStoredPassword(saved);
      setAuthed(true);
    }
  }, []);

  const handleLogin = () => {
    if (!password) return;
    setStoredPassword(password);
    sessionStorage.setItem("admin-auth", password);
    setAuthed(true);
  };

  // Load Chart.js
  useEffect(() => {
    if (!authed) return;
    if (typeof window !== "undefined" && window.Chart) {
      setChartReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.onload = () => setChartReady(true);
    document.head.appendChild(script);
    return () => {
      if (script.parentNode) document.head.removeChild(script);
    };
  }, [authed]);

  // Date filter helper
  const getDateFilter = useCallback(() => {
    if (rangeDays === 0) return "";
    const d = new Date();
    d.setDate(d.getDate() - rangeDays);
    return d.toISOString();
  }, [rangeDays]);

  // Fetch analytics data
  const fetchData = useCallback(async () => {
    if (!storedPassword) return;
    setLoading(true);
    try {
      const dateFrom = getDateFilter();
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);

      const res = await fetch(`/api/admin/analytics?${params}`, {
        headers: { "x-admin-password": storedPassword },
      });

      if (!res.ok) {
        setHasData(false);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setStats(data.stats || []);
      setViewsOverTime(data.viewsOverTime || []);
      setAgentClicks(data.agentClicks || []);
      setTopProducts(data.topProducts || []);
      setCategoryBreakdown(data.categoryBreakdown || []);
      setPopularSearches(data.popularSearches || []);
      setHourlyActivity(data.hourlyActivity || []);

      const totalEvents = (data.stats || []).reduce((s: number, c: StatCard) => s + c.value, 0);
      setHasData(totalEvents > 0);
    } catch {
      setHasData(false);
    }
    setLoading(false);
  }, [storedPassword, getDateFilter]);

  useEffect(() => {
    if (authed) fetchData();
  }, [authed, fetchData]);

  // Render charts
  useEffect(() => {
    if (!chartReady || !window.Chart) return;

    const Chart = window.Chart;
    const darkTheme = {
      color: "#9CA3AF",
      borderColor: "rgba(255,255,255,0.06)",
    };

    // Destroy existing charts
    Object.values(chartInstances.current).forEach((c) => c.destroy());
    chartInstances.current = {};

    // Views over time
    if (viewsChartRef.current && viewsOverTime.length > 0) {
      chartInstances.current.views = new Chart(viewsChartRef.current, {
        type: "line",
        data: {
          labels: viewsOverTime.map((v) => v.date),
          datasets: [
            {
              label: "Views",
              data: viewsOverTime.map((v) => v.count),
              borderColor: "#FE4205",
              backgroundColor: "rgba(254,66,5,0.1)",
              fill: true,
              tension: 0.3,
              pointRadius: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Views Over Time", color: "#fff", font: { size: 14 } },
          },
          scales: {
            x: { ticks: { color: darkTheme.color }, grid: { color: darkTheme.borderColor } },
            y: { ticks: { color: darkTheme.color }, grid: { color: darkTheme.borderColor }, beginAtZero: true },
          },
        },
      });
    }

    // Agent clicks bar chart
    if (agentChartRef.current && agentClicks.length > 0) {
      chartInstances.current.agents = new Chart(agentChartRef.current, {
        type: "bar",
        data: {
          labels: agentClicks.map((a) => a.agent_name),
          datasets: [
            {
              label: "Clicks",
              data: agentClicks.map((a) => a.count),
              backgroundColor: "rgba(254,66,5,0.8)",
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y",
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Agent Clicks \u2014 Revenue Sources", color: "#fff", font: { size: 14 } },
          },
          scales: {
            x: { ticks: { color: darkTheme.color }, grid: { color: darkTheme.borderColor }, beginAtZero: true },
            y: { ticks: { color: darkTheme.color }, grid: { display: false } },
          },
        },
      });
    }

    // Category doughnut
    if (categoryChartRef.current && categoryBreakdown.length > 0) {
      const orangePalette = [
        "#FE4205", "#FF6B3D", "#FF9470", "#FFB89E", "#FFD5C4",
        "#E63B04", "#CC3503", "#B32E03", "#992802", "#802101",
        "#FF7F50", "#FF6347", "#FF4500", "#E84E10", "#D04A00",
      ];
      chartInstances.current.category = new Chart(categoryChartRef.current, {
        type: "doughnut",
        data: {
          labels: categoryBreakdown.map((c) => c.category),
          datasets: [
            {
              data: categoryBreakdown.map((c) => c.count),
              backgroundColor: categoryBreakdown.map((_, i) => orangePalette[i % orangePalette.length]),
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "right", labels: { color: darkTheme.color, padding: 12, font: { size: 11 } } },
            title: { display: true, text: "Category Breakdown", color: "#fff", font: { size: 14 } },
          },
        },
      });
    }

    // Hourly activity
    if (hourlyChartRef.current && hourlyActivity.length > 0) {
      chartInstances.current.hourly = new Chart(hourlyChartRef.current, {
        type: "bar",
        data: {
          labels: hourlyActivity.map((h) => `${String(h.hour).padStart(2, "0")}:00`),
          datasets: [
            {
              label: "Events",
              data: hourlyActivity.map((h) => h.count),
              backgroundColor: "rgba(254,66,5,0.7)",
              borderRadius: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Hourly Activity", color: "#fff", font: { size: 14 } },
          },
          scales: {
            x: { ticks: { color: darkTheme.color, maxRotation: 45 }, grid: { color: darkTheme.borderColor } },
            y: { ticks: { color: darkTheme.color }, grid: { color: darkTheme.borderColor }, beginAtZero: true },
          },
        },
      });
    }

    return () => {
      Object.values(chartInstances.current).forEach((c) => c.destroy());
      chartInstances.current = {};
    };
  }, [chartReady, viewsOverTime, agentClicks, categoryBreakdown, hourlyActivity]);

  // Login screen
  if (!authed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-8">
          <h1 className="mb-6 text-center font-heading text-xl font-bold text-white">Analytics Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Admin password"
            className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FE4205]/50"
          />
          <button
            onClick={handleLogin}
            className="mt-4 w-full rounded-lg bg-[#FE4205] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Analytics</h1>
          <p className="mt-1 text-sm text-gray-400">Track product views, agent clicks, and user activity</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#141414] px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          &larr; Back to Admin
        </Link>
      </div>

      {/* Date range pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        {DATE_RANGES.map((r) => (
          <button
            key={r.label}
            onClick={() => setRangeDays(r.days)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              rangeDays === r.days
                ? "bg-[#FE4205] text-white"
                : "bg-[#141414] text-gray-400 hover:text-white"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="py-12 text-center text-sm text-gray-500">Loading analytics...</div>
      )}

      {!loading && !hasData && (
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] px-8 py-16 text-center">
          <p className="text-lg font-medium text-gray-400">No data yet</p>
          <p className="mt-2 text-sm text-gray-500">
            Analytics will appear as visitors use the site.
          </p>
        </div>
      )}

      {!loading && hasData && (
        <>
          {/* Stats row */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6"
              >
                <p className="text-[32px] font-bold leading-none text-white">
                  {s.value.toLocaleString()}
                </p>
                <p className="mt-2 text-[13px] text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Charts grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Views over time */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6">
              <canvas ref={viewsChartRef} className="h-[300px] w-full" />
            </div>

            {/* Agent clicks */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6">
              <canvas ref={agentChartRef} className="h-[300px] w-full" />
            </div>

            {/* Top products table */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6 lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold text-white">Top Products</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.06)] text-left text-xs text-gray-500">
                      <th className="pb-3 pr-4">#</th>
                      <th className="pb-3 pr-4">Product</th>
                      <th className="pb-3 pr-4">Category</th>
                      <th className="pb-3 pr-4 text-right">Views</th>
                      <th className="pb-3 pr-4 text-right">Agent Clicks</th>
                      <th className="pb-3 text-right">Click Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr
                        key={p.product_id}
                        className="border-b border-[rgba(255,255,255,0.03)] transition-colors hover:bg-[#FE4205]/5"
                      >
                        <td className="py-3 pr-4 text-gray-500">{i + 1}</td>
                        <td className="py-3 pr-4">
                          <Link href={`/products/${p.product_id}`} className="text-white hover:text-[#FE4205]">
                            {p.name}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{p.category}</td>
                        <td className="py-3 pr-4 text-right text-white">{p.views.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-right text-white">{p.clicks.toLocaleString()}</td>
                        <td className="py-3 text-right text-gray-400">
                          {p.views > 0 ? ((p.clicks / p.views) * 100).toFixed(1) : "0.0"}%
                        </td>
                      </tr>
                    ))}
                    {topProducts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No product data yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6">
              <canvas ref={categoryChartRef} className="h-[300px] w-full" />
            </div>

            {/* Popular searches */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6">
              <h3 className="mb-4 text-sm font-semibold text-white">Popular Searches</h3>
              <div className="overflow-y-auto" style={{ maxHeight: 260 }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.06)] text-left text-xs text-gray-500">
                      <th className="pb-3 pr-4">Query</th>
                      <th className="pb-3 text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {popularSearches.map((s) => (
                      <tr
                        key={s.query}
                        className="border-b border-[rgba(255,255,255,0.03)] transition-colors hover:bg-[#FE4205]/5"
                      >
                        <td className="py-2.5 pr-4 text-white">{s.query}</td>
                        <td className="py-2.5 text-right text-gray-400">{s.count}</td>
                      </tr>
                    ))}
                    {popularSearches.length === 0 && (
                      <tr>
                        <td colSpan={2} className="py-8 text-center text-gray-500">
                          No search data yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hourly activity */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6 lg:col-span-2">
              <canvas ref={hourlyChartRef} className="h-[250px] w-full" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
