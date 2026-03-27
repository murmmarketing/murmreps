"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ─── types ─── */
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Chart: any;
  }
}

type Platform = "overview" | "meta" | "instagram" | "tiktok" | "ga4";

interface KPI {
  label: string;
  value: string;
  delta?: number;
}

interface CampaignRow {
  name: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
}

interface DailyRow {
  date: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
}

interface MetaSummary {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  purchases: number;
  revenue: number;
  roas: number;
  linkClicks: number;
}

interface MetaAPIResponse {
  connected: boolean;
  error?: string;
  summary?: MetaSummary;
  daily?: DailyRow[];
  campaigns?: CampaignRow[];
}



/* ─── constants ─── */
const PLATFORMS: { id: Platform; label: string; icon: string; color: string }[] = [
  { id: "overview", label: "Overview", icon: "grid", color: "#FE4205" },
  { id: "meta", label: "Meta Ads", icon: "meta", color: "#1877F2" },
  { id: "instagram", label: "Instagram", icon: "instagram", color: "#E1306C" },
  { id: "tiktok", label: "TikTok", icon: "tiktok", color: "#FF0050" },
  { id: "ga4", label: "Analytics", icon: "chart", color: "#4285F4" },
];

const DATE_RANGES = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

/* ─── icon components ─── */
function PlatformIcon({ type, className }: { type: string; className?: string }) {
  const cn = className || "w-4 h-4";
  switch (type) {
    case "grid":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "meta":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
      );
    case "instagram":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48v-7.06a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-.81-.07 4.8 4.8 0 01-.38.02z" />
        </svg>
      );
    case "chart":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function ArrowIcon({ up }: { up: boolean }) {
  return up ? (
    <svg className="inline w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 2l4 5H2z" />
    </svg>
  ) : (
    <svg className="inline w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 10L2 5h8z" />
    </svg>
  );
}

/* ─── helpers ─── */
function fmt(n: number, opts?: { prefix?: string; suffix?: string; decimals?: number }): string {
  const { prefix = "", suffix = "", decimals } = opts || {};
  if (Math.abs(n) >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M${suffix}`;
  if (Math.abs(n) >= 1_000) return `${prefix}${(n / 1_000).toFixed(1)}K${suffix}`;
  if (decimals !== undefined) return `${prefix}${n.toFixed(decimals)}${suffix}`;
  return `${prefix}${n.toLocaleString()}${suffix}`;
}

/* ─── main component ─── */
export default function MarketingDashboard() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("");

  const [platform, setPlatform] = useState<Platform>("overview");
  const [rangeDays, setRangeDays] = useState(30);
  const [chartReady, setChartReady] = useState(false);
  const [campaignSort, setCampaignSort] = useState<"spend" | "roas" | "ctr" | "clicks">("spend");

  // Chart refs
  const spendChartRef = useRef<HTMLCanvasElement>(null);
  const reachChartRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartInstances = useRef<Record<string, any>>({});

  // Real data from API
  const [metaConnected, setMetaConnected] = useState<boolean | null>(null); // null = loading
  const [metaError, setMetaError] = useState<string | null>(null);
  const [metaSummary, setMetaSummary] = useState<MetaSummary | null>(null);
  const [metaDaily, setMetaDaily] = useState<DailyRow[]>([]);
  const [metaCampaigns, setMetaCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Auth
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

  // Fetch REAL Meta Ads data from API
  const fetchMetaData = useCallback(async () => {
    if (!storedPassword) return;
    setLoading(true);
    setMetaError(null);
    try {
      const res = await fetch(`/api/admin/meta?days=${rangeDays}`, {
        headers: { "x-admin-password": storedPassword },
      });
      const data: MetaAPIResponse = await res.json();

      if (!data.connected) {
        setMetaConnected(false);
        setMetaSummary(null);
        setMetaDaily([]);
        setMetaCampaigns([]);
      } else if (data.error) {
        setMetaConnected(true);
        setMetaError(data.error);
        setMetaSummary(null);
        setMetaDaily([]);
        setMetaCampaigns([]);
      } else {
        setMetaConnected(true);
        setMetaSummary(data.summary || null);
        setMetaDaily(data.daily || []);
        setMetaCampaigns(data.campaigns || []);
      }
    } catch (err) {
      setMetaConnected(false);
      setMetaError(String(err));
    } finally {
      setLoading(false);
    }
  }, [storedPassword, rangeDays]);

  useEffect(() => {
    if (authed && storedPassword) {
      fetchMetaData();
    }
  }, [authed, storedPassword, rangeDays, fetchMetaData]);

  // Build KPIs from real data
  const kpis: KPI[] = metaSummary
    ? [
        { label: "Ad Spend", value: fmt(metaSummary.spend, { prefix: "€", decimals: 0 }) },
        { label: "ROAS", value: fmt(metaSummary.roas, { suffix: "x", decimals: 1 }) },
        { label: "Impressions", value: fmt(metaSummary.impressions) },
        { label: "Reach", value: fmt(metaSummary.reach) },
        { label: "Link Clicks", value: fmt(metaSummary.linkClicks) },
        { label: "CTR", value: fmt(metaSummary.ctr, { suffix: "%", decimals: 2 }) },
      ]
    : [];

  // Render charts from real data
  useEffect(() => {
    if (!chartReady || !window.Chart || metaDaily.length === 0) return;

    const Chart = window.Chart;
    Object.values(chartInstances.current).forEach((c) => c?.destroy());
    chartInstances.current = {};

    const gridColor = "rgba(255,255,255,0.05)";
    const tickColor = "#6B7280";

    // Spend chart
    if (spendChartRef.current && (platform === "overview" || platform === "meta")) {
      chartInstances.current.spend = new Chart(spendChartRef.current, {
        type: "line",
        data: {
          labels: metaDaily.map((d) => {
            const dt = new Date(d.date);
            return `${dt.getDate()}/${dt.getMonth() + 1}`;
          }),
          datasets: [
            {
              label: "Ad Spend",
              data: metaDaily.map((d) => d.spend),
              borderColor: "#1877F2",
              backgroundColor: "rgba(24,119,242,0.08)",
              fill: true,
              tension: 0.35,
              pointRadius: 0,
              pointHoverRadius: 4,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              display: true,
              position: "top",
              align: "end",
              labels: { color: tickColor, boxWidth: 12, padding: 16, font: { size: 11 } },
            },
          },
          scales: {
            x: { ticks: { color: tickColor, maxTicksLimit: 10 }, grid: { color: gridColor } },
            y: {
              ticks: { color: tickColor, callback: (v: number) => "€" + v.toFixed(0) },
              grid: { color: gridColor },
              beginAtZero: true,
            },
          },
        },
      });
    }

    // Impressions + Reach chart
    if (reachChartRef.current && (platform === "overview" || platform === "meta")) {
      chartInstances.current.reach = new Chart(reachChartRef.current, {
        type: "bar",
        data: {
          labels: metaDaily.map((d) => {
            const dt = new Date(d.date);
            return `${dt.getDate()}/${dt.getMonth() + 1}`;
          }),
          datasets: [
            {
              label: "Impressions",
              data: metaDaily.map((d) => d.impressions),
              backgroundColor: "rgba(254,66,5,0.6)",
              borderRadius: 3,
            },
            {
              label: "Reach",
              data: metaDaily.map((d) => d.reach),
              backgroundColor: "rgba(254,66,5,0.25)",
              borderRadius: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              display: true,
              position: "top",
              align: "end",
              labels: { color: tickColor, boxWidth: 12, padding: 16, font: { size: 11 } },
            },
          },
          scales: {
            x: { ticks: { color: tickColor, maxTicksLimit: 10 }, grid: { color: gridColor }, stacked: false },
            y: {
              ticks: { color: tickColor, callback: (v: number) => (v >= 1000 ? (v / 1000).toFixed(0) + "K" : String(v)) },
              grid: { color: gridColor },
              beginAtZero: true,
            },
          },
        },
      });
    }

    return () => {
      Object.values(chartInstances.current).forEach((c) => c?.destroy());
      chartInstances.current = {};
    };
  }, [chartReady, metaDaily, platform]);

  // Sort campaigns
  const sortedCampaigns = metaCampaigns.slice().sort((a, b) => {
    switch (campaignSort) {
      case "roas": return (b as unknown as { roas: number }).roas - (a as unknown as { roas: number }).roas;
      case "ctr": return b.ctr - a.ctr;
      case "clicks": return b.clicks - a.clicks;
      default: return b.spend - a.spend;
    }
  });

  /* ─── auth screen ─── */
  if (!authed) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FE4205]/10">
              <svg className="h-6 w-6 text-[#FE4205]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="font-heading text-xl font-bold text-white">Marketing Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">MurmReps Analytics</p>
          </div>
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

  /* ─── connect card ─── */
  const ConnectCard = ({ name, icon, color, instructions }: { name: string; icon: string; color: string; instructions: string[] }) => (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: color + "15" }}>
          <PlatformIcon type={icon} className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-white">Connect {name}</h3>
        <p className="mt-2 text-sm text-gray-400">Link your {name} account to see real-time metrics here.</p>
        <div className="mt-6 text-left">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Setup steps</p>
          <ol className="space-y-2">
            {instructions.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] text-[10px] font-bold text-gray-500">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <button className="mt-6 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80" style={{ backgroundColor: color }}>
          Connect {name}
        </button>
      </div>
    </div>
  );

  /* ─── content placeholder ─── */
  const ContentPlaceholder = ({ platformName }: { platformName: string }) => (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-12 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.04)]">
        <svg className="h-6 w-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm text-gray-500">Connect {platformName} to see content performance data</p>
    </div>
  );

  /* ─── status badge helper ─── */
  const StatusBadge = ({ connected, label }: { connected: boolean | null; label: string }) => (
    <span className="flex items-center gap-1.5 text-xs text-gray-400">
      <span className={`h-2 w-2 rounded-full ${connected === true ? "bg-emerald-400" : connected === null ? "bg-yellow-400 animate-pulse" : "bg-gray-600"}`} />
      {label}
    </span>
  );

  /* ─── No data empty state ─── */
  const EmptyMetaState = () => (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1877F2]/10">
        <PlatformIcon type="meta" className="h-7 w-7 text-[#1877F2]" />
      </div>
      {metaConnected === false ? (
        <>
          <h3 className="text-lg font-semibold text-white">Meta Ads Not Connected</h3>
          <p className="mt-2 text-sm text-gray-400">
            Add <code className="rounded bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 text-xs text-gray-300">META_ACCESS_TOKEN</code> and{" "}
            <code className="rounded bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 text-xs text-gray-300">META_AD_ACCOUNT_ID</code> to your environment variables on Vercel.
          </p>
          <div className="mt-6 text-left mx-auto max-w-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Quick setup</p>
            <ol className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] text-[9px] font-bold text-gray-500">1</span>
                Go to business.facebook.com → Business Settings → System Users
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] text-[9px] font-bold text-gray-500">2</span>
                Generate a token with <strong className="text-gray-300">ads_read</strong> permission
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] text-[9px] font-bold text-gray-500">3</span>
                Add both env vars in Vercel → Settings → Environment Variables
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] text-[9px] font-bold text-gray-500">4</span>
                Redeploy to apply changes
              </li>
            </ol>
          </div>
        </>
      ) : metaError ? (
        <>
          <h3 className="text-lg font-semibold text-white">Meta API Error</h3>
          <p className="mt-2 text-sm text-red-400">{metaError}</p>
          <p className="mt-2 text-xs text-gray-500">Check that your access token is valid and has ads_read permission.</p>
          <button
            onClick={fetchMetaData}
            className="mt-4 rounded-lg bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Retry
          </button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-white">No Ad Data</h3>
          <p className="mt-2 text-sm text-gray-400">No ad data found for the last {rangeDays} days. Make sure you have active or recent campaigns.</p>
        </>
      )}
    </div>
  );

  const hasMetaData = metaConnected === true && metaSummary !== null && !metaError;

  /* ─── main render ─── */
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Marketing Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">MurmReps — real-time platform analytics</p>
        </div>
        <div className="flex items-center gap-3">
          {loading && (
            <span className="flex items-center gap-2 text-xs text-gray-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#FE4205]" />
              Fetching data...
            </span>
          )}
          <button
            onClick={fetchMetaData}
            className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#141414] px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            Refresh
          </button>
          <Link
            href="/admin/analytics"
            className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#141414] px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            Site Analytics
          </Link>
          <Link
            href="/admin"
            className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#141414] px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            &larr; Admin
          </Link>
        </div>
      </div>

      {/* Platform tabs */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0e0e0e] p-1">
        {PLATFORMS.map((p) => {
          const isConnected = p.id === "overview" || p.id === "ga4" || (p.id === "meta" && metaConnected === true);
          return (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                platform === p.id
                  ? "bg-[#1a1a1a] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <PlatformIcon type={p.icon} className="h-4 w-4" />
              {p.label}
              {!isConnected && p.id !== "overview" && (
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" title="Not connected" />
              )}
              {isConnected && p.id !== "overview" && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Connected" />
              )}
            </button>
          );
        })}
      </div>

      {/* Date range pills */}
      <div className="mb-6 flex items-center gap-2">
        {DATE_RANGES.map((r) => (
          <button
            key={r.label}
            onClick={() => setRangeDays(r.days)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              rangeDays === r.days ? "bg-[#FE4205] text-white" : "bg-[#141414] text-gray-400 hover:text-white"
            }`}
          >
            {r.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-500">
          Last {rangeDays} days{hasMetaData ? " • Live data" : ""}
        </span>
      </div>

      {/* ─── OVERVIEW / META TAB ─── */}
      {(platform === "overview" || platform === "meta") && (
        <>
          {loading && metaConnected === null ? (
            /* Loading skeleton */
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4">
                  <div className="h-3 w-16 rounded bg-[rgba(255,255,255,0.06)]" />
                  <div className="mt-3 h-7 w-20 rounded bg-[rgba(255,255,255,0.06)]" />
                </div>
              ))}
            </div>
          ) : hasMetaData ? (
            <>
              {/* KPI Cards — REAL DATA */}
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {kpis.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">{kpi.label}</p>
                    <p className="mt-2 text-xl font-bold text-white sm:text-2xl">{kpi.value}</p>
                    {kpi.delta !== undefined && (
                      <p className={`mt-1 text-xs font-medium ${kpi.delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        <ArrowIcon up={kpi.delta >= 0} />{" "}
                        {Math.abs(kpi.delta).toFixed(1)}% vs prev
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Charts row — REAL DATA */}
              <div className="mb-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
                  <h3 className="mb-1 text-sm font-semibold text-white">Daily Ad Spend</h3>
                  <p className="mb-4 text-xs text-gray-500">Real spend data from Meta Ads</p>
                  <div className="h-[280px]">
                    <canvas ref={spendChartRef} />
                  </div>
                </div>
                <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
                  <h3 className="mb-1 text-sm font-semibold text-white">Impressions & Reach</h3>
                  <p className="mb-4 text-xs text-gray-500">Real delivery metrics from Meta Ads</p>
                  <div className="h-[280px]">
                    <canvas ref={reachChartRef} />
                  </div>
                </div>
              </div>

              {/* Campaigns table — REAL DATA */}
              {sortedCampaigns.length > 0 && (
                <div className="mb-6 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Campaigns</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Sort by:</span>
                      {(["spend", "ctr", "clicks"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setCampaignSort(s)}
                          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                            campaignSort === s ? "bg-[#FE4205]/20 text-[#FE4205]" : "text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          {s.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.06)] text-left text-xs text-gray-500">
                          <th className="pb-3 pr-4">#</th>
                          <th className="pb-3 pr-4">Campaign</th>
                          <th className="pb-3 pr-4 text-right">Spend</th>
                          <th className="pb-3 pr-4 text-right">Impr.</th>
                          <th className="pb-3 pr-4 text-right">Reach</th>
                          <th className="pb-3 pr-4 text-right">Clicks</th>
                          <th className="pb-3 pr-4 text-right">CTR</th>
                          <th className="pb-3 text-right">CPC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedCampaigns.map((c, i) => (
                          <tr key={c.name} className="border-b border-[rgba(255,255,255,0.03)] transition-colors hover:bg-[#FE4205]/5">
                            <td className="py-3 pr-4 text-gray-500">{i + 1}</td>
                            <td className="py-3 pr-4 text-white">{c.name}</td>
                            <td className="py-3 pr-4 text-right text-white">€{c.spend.toFixed(2)}</td>
                            <td className="py-3 pr-4 text-right text-gray-300">{fmt(c.impressions)}</td>
                            <td className="py-3 pr-4 text-right text-gray-300">{fmt(c.reach)}</td>
                            <td className="py-3 pr-4 text-right text-gray-300">{fmt(c.clicks)}</td>
                            <td className="py-3 pr-4 text-right text-gray-400">{c.ctr.toFixed(2)}%</td>
                            <td className="py-3 text-right text-gray-400">€{c.cpc.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyMetaState />
          )}

          {/* Content placeholders for unconnected platforms */}
          {platform === "overview" && (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <ContentPlaceholder platformName="Instagram" />
              <ContentPlaceholder platformName="TikTok" />
            </div>
          )}
        </>
      )}

      {/* ─── INSTAGRAM TAB ─── */}
      {platform === "instagram" && (
        <ConnectCard
          name="Instagram"
          icon="instagram"
          color="#E1306C"
          instructions={[
            "Go to developers.facebook.com and create a Business app",
            "Add the Instagram Graph API product",
            "Generate a User Access Token with instagram_basic + pages_show_list",
            "Exchange for a long-lived token (60 days)",
            "Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID to your Vercel env vars",
          ]}
        />
      )}

      {/* ─── TIKTOK TAB ─── */}
      {platform === "tiktok" && (
        <ConnectCard
          name="TikTok"
          icon="tiktok"
          color="#FF0050"
          instructions={[
            "Go to developers.tiktok.com and create an app",
            "Add TikTok Login Kit and Video List permissions",
            "Generate access token with user.info.basic + video.list scopes",
            "Add TIKTOK_ACCESS_TOKEN to your Vercel env vars",
            "For TikTok Ads: add TIKTOK_ADS_TOKEN and TIKTOK_ADVERTISER_ID",
          ]}
        />
      )}

      {/* ─── GA4 TAB ─── */}
      {platform === "ga4" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Google Analytics Connected</h3>
                <p className="text-xs text-gray-400">Property ID: G-D3QBGSNWPV</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Basic page tracking is active via the gtag snippet. To pull GA4 data into this dashboard programmatically, set up the GA4 Data API:
            </p>
            <ol className="mt-3 space-y-1.5 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] text-[9px] font-bold text-gray-500">1</span>
                Go to console.cloud.google.com &rarr; enable Analytics Data API
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] text-[9px] font-bold text-gray-500">2</span>
                Create a service account &rarr; download JSON key
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] text-[9px] font-bold text-gray-500">3</span>
                Add the service account email as a viewer in your GA4 property
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] text-[9px] font-bold text-gray-500">4</span>
                Add GA4_PROPERTY_ID and GOOGLE_SERVICE_ACCOUNT_KEY to Vercel env vars
              </li>
            </ol>
          </div>

          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Site Analytics</h3>
            <p className="text-sm text-gray-400">
              View your existing MurmReps site analytics (product views, searches, agent clicks) on the{" "}
              <Link href="/admin/analytics" className="text-[#FE4205] hover:underline">
                Site Analytics
              </Link>{" "}
              page.
            </p>
          </div>
        </div>
      )}

      {/* Footer status bar */}
      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[rgba(255,255,255,0.06)] pt-4">
        <span className="text-xs text-gray-500">Platform status:</span>
        <StatusBadge connected={metaConnected} label="Meta Ads" />
        <StatusBadge connected={false} label="Instagram" />
        <StatusBadge connected={false} label="TikTok" />
        <StatusBadge connected={true} label="Analytics" />
        {hasMetaData && (
          <span className="ml-auto text-xs text-emerald-400/70">
            Live data • last synced just now
          </span>
        )}
        {!hasMetaData && (
          <span className="ml-auto text-xs text-gray-600">
            Add META_ACCESS_TOKEN to Vercel to activate
          </span>
        )}
      </div>
    </div>
  );
}
