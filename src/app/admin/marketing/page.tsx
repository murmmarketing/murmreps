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

type Platform = "overview" | "instagram" | "tiktok" | "ga4";

interface GA4Overview {
  sessions: number;
  totalUsers: number;
  newUsers: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
}

interface GA4DailyRow {
  date: string;
  sessions: number;
  users: number;
  pageViews: number;
}

interface GA4Source {
  source: string;
  medium: string;
  sessions: number;
  users: number;
}

interface GA4Page {
  path: string;
  title: string;
  views: number;
  users: number;
  avgDuration: number;
}

interface GA4Device {
  device: string;
  sessions: number;
  users: number;
}

interface GA4Country {
  country: string;
  sessions: number;
  users: number;
}

interface TikTokProfile {
  open_id: string;
  display_name: string;
  avatar_url: string;
  bio_description: string;
  profile_deep_link: string;
  is_verified: boolean;
  follower_count: number;
  following_count: number;
  likes_count: number;
  video_count: number;
}

interface TikTokVideo {
  id: string;
  title: string;
  video_description: string;
  duration: number;
  cover_image_url: string;
  share_url: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  create_time: number;
}


/* ─── constants ─── */
const PLATFORMS: { id: Platform; label: string; icon: string; color: string }[] = [
  { id: "overview", label: "Overview", icon: "grid", color: "#FE4205" },
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
  // Chart refs
  const ga4SessionsChartRef = useRef<HTMLCanvasElement>(null);
  const ga4PageViewsChartRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartInstances = useRef<Record<string, any>>({});

  // TikTok state
  const [tiktokConnected, setTiktokConnected] = useState<boolean | null>(null);
  const [tiktokProfile, setTiktokProfile] = useState<TikTokProfile | null>(null);
  const [tiktokVideos, setTiktokVideos] = useState<TikTokVideo[]>([]);
  const [tiktokError, setTiktokError] = useState<string | null>(null);
  const [tiktokLoading, setTiktokLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // GA4 state
  const [ga4Connected, setGa4Connected] = useState<boolean | null>(null);
  const [ga4Error, setGa4Error] = useState<string | null>(null);
  const [ga4Overview, setGa4Overview] = useState<GA4Overview | null>(null);
  const [ga4Daily, setGa4Daily] = useState<GA4DailyRow[]>([]);
  const [ga4Sources, setGa4Sources] = useState<GA4Source[]>([]);
  const [ga4Pages, setGa4Pages] = useState<GA4Page[]>([]);
  const [ga4Devices, setGa4Devices] = useState<GA4Device[]>([]);
  const [ga4Countries, setGa4Countries] = useState<GA4Country[]>([]);
  const [ga4Loading, setGa4Loading] = useState(false);

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

  // Fetch TikTok data
  const fetchTikTokData = useCallback(async () => {
    if (!storedPassword) return;
    setTiktokLoading(true);
    setTiktokError(null);
    try {
      const [profileRes, videosRes] = await Promise.all([
        fetch("/api/tiktok/profile/", { headers: { "x-admin-password": storedPassword } }),
        fetch("/api/tiktok/videos/", { headers: { "x-admin-password": storedPassword } }),
      ]);

      const profileData = await profileRes.json();
      const videosData = await videosRes.json();

      if (!profileData.connected) {
        setTiktokConnected(false);
        setTiktokProfile(null);
        setTiktokVideos([]);
      } else if (profileData.error) {
        setTiktokConnected(true);
        setTiktokError(profileData.error);
      } else {
        setTiktokConnected(true);
        setTiktokProfile(profileData.profile || null);
        setTiktokVideos(videosData.videos || []);
      }
    } catch (err) {
      setTiktokConnected(false);
      setTiktokError(String(err));
    } finally {
      setTiktokLoading(false);
    }
  }, [storedPassword]);

  useEffect(() => {
    if (authed && storedPassword) {
      fetchTikTokData();
    }
  }, [authed, storedPassword, fetchTikTokData]);

  // Handle TikTok disconnect
  const handleTikTokDisconnect = async () => {
    if (!confirm("Disconnect your TikTok account?")) return;
    setDisconnecting(true);
    try {
      await fetch("/api/tiktok/disconnect/", {
        method: "POST",
        headers: { "x-admin-password": storedPassword },
      });
      setTiktokConnected(false);
      setTiktokProfile(null);
      setTiktokVideos([]);
    } catch {
      // ignore
    } finally {
      setDisconnecting(false);
    }
  };

  // Fetch GA4 data
  const fetchGA4Data = useCallback(async () => {
    if (!storedPassword) return;
    setGa4Loading(true);
    setGa4Error(null);
    try {
      const res = await fetch(`/api/analytics/ga4?days=${rangeDays}`, {
        headers: { "x-admin-password": storedPassword },
      });
      const data = await res.json();

      if (!data.connected) {
        setGa4Connected(false);
        setGa4Error(data.error || null);
        setGa4Overview(null);
        setGa4Daily([]);
        setGa4Sources([]);
        setGa4Pages([]);
        setGa4Devices([]);
        setGa4Countries([]);
      } else {
        setGa4Connected(true);
        setGa4Overview(data.overview || null);
        setGa4Daily(data.daily || []);
        setGa4Sources(data.sources || []);
        setGa4Pages(data.pages || []);
        setGa4Devices(data.devices || []);
        setGa4Countries(data.countries || []);
      }
    } catch (err) {
      setGa4Connected(false);
      setGa4Error(String(err));
    } finally {
      setGa4Loading(false);
    }
  }, [storedPassword, rangeDays]);

  useEffect(() => {
    if (authed && storedPassword) {
      fetchGA4Data();
    }
  }, [authed, storedPassword, rangeDays, fetchGA4Data]);

  // Render GA4 charts
  useEffect(() => {
    if (!chartReady || !window.Chart || ga4Daily.length === 0 || platform !== "ga4") return;

    const Chart = window.Chart;
    // Destroy only GA4 chart instances
    if (chartInstances.current.ga4Sessions) chartInstances.current.ga4Sessions.destroy();
    if (chartInstances.current.ga4PageViews) chartInstances.current.ga4PageViews.destroy();

    const gridColor = "rgba(255,255,255,0.05)";
    const tickColor = "#6B7280";

    const labels = ga4Daily.map((d) => {
      const y = d.date.substring(0, 4);
      const m = d.date.substring(4, 6);
      const day = d.date.substring(6, 8);
      const dt = new Date(`${y}-${m}-${day}`);
      return `${dt.getDate()}/${dt.getMonth() + 1}`;
    });

    // Sessions & Users line chart
    if (ga4SessionsChartRef.current) {
      chartInstances.current.ga4Sessions = new Chart(ga4SessionsChartRef.current, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Sessions",
              data: ga4Daily.map((d) => d.sessions),
              borderColor: "#FE4205",
              backgroundColor: "rgba(254,66,5,0.08)",
              fill: true,
              tension: 0.35,
              pointRadius: 0,
              pointHoverRadius: 4,
              borderWidth: 2,
            },
            {
              label: "Users",
              data: ga4Daily.map((d) => d.users),
              borderColor: "#4285F4",
              backgroundColor: "rgba(66,133,244,0.08)",
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
              ticks: { color: tickColor, callback: (v: number) => (v >= 1000 ? (v / 1000).toFixed(0) + "K" : String(v)) },
              grid: { color: gridColor },
              beginAtZero: true,
            },
          },
        },
      });
    }

    // Page Views bar chart
    if (ga4PageViewsChartRef.current) {
      chartInstances.current.ga4PageViews = new Chart(ga4PageViewsChartRef.current, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Page Views",
              data: ga4Daily.map((d) => d.pageViews),
              backgroundColor: "rgba(254,66,5,0.5)",
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
            x: { ticks: { color: tickColor, maxTicksLimit: 10 }, grid: { color: gridColor } },
            y: {
              ticks: { color: tickColor, callback: (v: number) => (v >= 1000 ? (v / 1000).toFixed(0) + "K" : String(v)) },
              grid: { color: gridColor },
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [chartReady, ga4Daily, platform]);


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
          const isConnected = p.id === "overview" || (p.id === "ga4" && ga4Connected === true) || (p.id === "tiktok" && tiktokConnected === true);
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
          Last {rangeDays} days
        </span>
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {platform === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ContentPlaceholder platformName="Instagram" />
          <ContentPlaceholder platformName="TikTok" />
        </div>
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
        <>
          {tiktokLoading && tiktokConnected === null ? (
            /* Loading skeleton */
            <div className="space-y-6">
              <div className="animate-pulse rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-[rgba(255,255,255,0.06)]" />
                  <div className="space-y-2">
                    <div className="h-5 w-32 rounded bg-[rgba(255,255,255,0.06)]" />
                    <div className="h-3 w-48 rounded bg-[rgba(255,255,255,0.06)]" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4">
                    <div className="h-3 w-16 rounded bg-[rgba(255,255,255,0.06)]" />
                    <div className="mt-3 h-7 w-20 rounded bg-[rgba(255,255,255,0.06)]" />
                  </div>
                ))}
              </div>
            </div>
          ) : tiktokConnected && tiktokProfile ? (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {tiktokProfile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tiktokProfile.avatar_url}
                        alt={tiktokProfile.display_name}
                        className="h-16 w-16 rounded-full border-2 border-[#FF0050]/30 object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF0050]/10">
                        <PlatformIcon type="tiktok" className="h-8 w-8 text-[#FF0050]" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{tiktokProfile.display_name}</h3>
                        {tiktokProfile.is_verified && (
                          <svg className="h-5 w-5 text-[#20D5EC]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </div>
                      {tiktokProfile.bio_description && (
                        <p className="mt-1 max-w-md text-sm text-gray-400">{tiktokProfile.bio_description}</p>
                      )}
                      {tiktokProfile.profile_deep_link && (
                        <a
                          href={tiktokProfile.profile_deep_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-xs text-[#FF0050] hover:underline"
                        >
                          View on TikTok &rarr;
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleTikTokDisconnect}
                    disabled={disconnecting}
                    className="rounded-lg border border-[rgba(255,255,255,0.1)] px-4 py-2 text-sm text-gray-400 transition-colors hover:border-red-500/30 hover:text-red-400"
                  >
                    {disconnecting ? "Disconnecting..." : "Disconnect"}
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Followers", value: fmt(tiktokProfile.follower_count) },
                  { label: "Following", value: fmt(tiktokProfile.following_count) },
                  { label: "Total Likes", value: fmt(tiktokProfile.likes_count) },
                  { label: "Videos", value: fmt(tiktokProfile.video_count) },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">{stat.label}</p>
                    <p className="mt-2 text-xl font-bold text-white sm:text-2xl">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Video Performance Summary */}
              {tiktokVideos.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {(() => {
                      const totalViews = tiktokVideos.reduce((s, v) => s + v.view_count, 0);
                      const totalLikes = tiktokVideos.reduce((s, v) => s + v.like_count, 0);
                      const totalComments = tiktokVideos.reduce((s, v) => s + v.comment_count, 0);
                      const avgViews = tiktokVideos.length > 0 ? totalViews / tiktokVideos.length : 0;
                      return [
                        { label: "Total Views", value: fmt(totalViews) },
                        { label: "Total Likes", value: fmt(totalLikes) },
                        { label: "Total Comments", value: fmt(totalComments) },
                        { label: "Avg. Views / Video", value: fmt(Math.round(avgViews)) },
                      ];
                    })().map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-[#FF0050]/10 bg-[#FF0050]/5 p-4">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-[#FF0050]/60">{stat.label}</p>
                        <p className="mt-2 text-xl font-bold text-white sm:text-2xl">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Videos Table */}
                  <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Recent Videos</h3>
                      <span className="text-xs text-gray-500">{tiktokVideos.length} videos</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[rgba(255,255,255,0.06)] text-left text-xs text-gray-500">
                            <th className="pb-3 pr-4">#</th>
                            <th className="pb-3 pr-4">Video</th>
                            <th className="pb-3 pr-4 text-right">Views</th>
                            <th className="pb-3 pr-4 text-right">Likes</th>
                            <th className="pb-3 pr-4 text-right">Comments</th>
                            <th className="pb-3 pr-4 text-right">Shares</th>
                            <th className="pb-3 text-right">Posted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tiktokVideos.map((video, i) => (
                            <tr key={video.id} className="border-b border-[rgba(255,255,255,0.03)] transition-colors hover:bg-[#FF0050]/5">
                              <td className="py-3 pr-4 text-gray-500">{i + 1}</td>
                              <td className="py-3 pr-4">
                                <div className="flex items-center gap-3">
                                  {video.cover_image_url && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={video.cover_image_url}
                                      alt=""
                                      className="h-10 w-8 shrink-0 rounded object-cover"
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <a
                                      href={video.share_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block truncate text-white hover:text-[#FF0050]"
                                      title={video.video_description || video.title}
                                    >
                                      {video.title || video.video_description || "Untitled"}
                                    </a>
                                    {video.duration > 0 && (
                                      <span className="text-xs text-gray-500">{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 pr-4 text-right text-white">{fmt(video.view_count)}</td>
                              <td className="py-3 pr-4 text-right text-gray-300">{fmt(video.like_count)}</td>
                              <td className="py-3 pr-4 text-right text-gray-300">{fmt(video.comment_count)}</td>
                              <td className="py-3 pr-4 text-right text-gray-300">{fmt(video.share_count)}</td>
                              <td className="py-3 text-right text-gray-400">
                                {new Date(video.create_time * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : tiktokConnected && tiktokError ? (
            <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF0050]/10">
                <PlatformIcon type="tiktok" className="h-7 w-7 text-[#FF0050]" />
              </div>
              <h3 className="text-lg font-semibold text-white">TikTok API Error</h3>
              <p className="mt-2 text-sm text-red-400">{tiktokError}</p>
              <button
                onClick={fetchTikTokData}
                className="mt-4 rounded-lg bg-[#FF0050] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Retry
              </button>
            </div>
          ) : (
            /* Not connected — show connect button */
            <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-8">
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF0050]/10">
                  <PlatformIcon type="tiktok" className="h-7 w-7 text-[#FF0050]" />
                </div>
                <h3 className="text-lg font-semibold text-white">Connect TikTok</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Link your TikTok account to see your profile stats, video performance, and engagement metrics in real time.
                </p>
                <div className="mt-6 text-left">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">What you&apos;ll get</p>
                  <ul className="space-y-2">
                    {[
                      "Follower count, likes, and profile stats",
                      "Video performance — views, likes, comments, shares",
                      "Content analytics to track what performs best",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#FF0050]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="/api/tiktok/auth/"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#FF0050] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <PlatformIcon type="tiktok" className="h-4 w-4" />
                  Connect TikTok Account
                </a>
                <p className="mt-4 text-xs text-gray-500">
                  Requires <code className="rounded bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 text-[10px] text-gray-300">TIKTOK_CLIENT_KEY</code> and{" "}
                  <code className="rounded bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 text-[10px] text-gray-300">TIKTOK_CLIENT_SECRET</code> in Vercel env vars.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── GA4 TAB ─── */}
      {platform === "ga4" && (
        <>
          {ga4Loading && ga4Connected === null ? (
            /* Loading skeleton */
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4">
                    <div className="h-3 w-16 rounded bg-[rgba(255,255,255,0.06)]" />
                    <div className="mt-3 h-7 w-20 rounded bg-[rgba(255,255,255,0.06)]" />
                  </div>
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
                    <div className="h-4 w-32 rounded bg-[rgba(255,255,255,0.06)]" />
                    <div className="mt-8 h-[280px] rounded bg-[rgba(255,255,255,0.03)]" />
                  </div>
                ))}
              </div>
            </div>
          ) : ga4Connected && ga4Overview ? (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  { label: "Sessions", value: fmt(ga4Overview.sessions) },
                  { label: "Users", value: fmt(ga4Overview.totalUsers) },
                  { label: "New Users", value: fmt(ga4Overview.newUsers) },
                  { label: "Page Views", value: fmt(ga4Overview.pageViews) },
                  {
                    label: "Avg Duration",
                    value: (() => {
                      const s = Math.round(ga4Overview.avgSessionDuration);
                      const m = Math.floor(s / 60);
                      const sec = s % 60;
                      return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
                    })(),
                  },
                  { label: "Bounce Rate", value: `${(ga4Overview.bounceRate * 100).toFixed(1)}%` },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">{stat.label}</p>
                    <p className="mt-2 text-xl font-bold text-white sm:text-2xl">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
                  <h3 className="mb-1 text-sm font-semibold text-white">Sessions & Users</h3>
                  <p className="mb-4 text-xs text-gray-500">Daily trend from Google Analytics</p>
                  <div className="h-[280px]">
                    <canvas ref={ga4SessionsChartRef} />
                  </div>
                </div>
                <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
                  <h3 className="mb-1 text-sm font-semibold text-white">Page Views</h3>
                  <p className="mb-4 text-xs text-gray-500">Daily page views from Google Analytics</p>
                  <div className="h-[280px]">
                    <canvas ref={ga4PageViewsChartRef} />
                  </div>
                </div>
              </div>

              {/* Tables Row — Top Pages + Traffic Sources */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Top Pages */}
                <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Top Pages</h3>
                    <span className="text-xs text-gray-500">{ga4Pages.length} pages</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.06)] text-left text-xs text-gray-500">
                          <th className="pb-3 pr-4">Page</th>
                          <th className="pb-3 pr-4 text-right">Views</th>
                          <th className="pb-3 pr-4 text-right">Users</th>
                          <th className="pb-3 text-right">Avg Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ga4Pages.map((page) => (
                          <tr key={page.path} className="border-b border-[rgba(255,255,255,0.03)] transition-colors hover:bg-[#FE4205]/5">
                            <td className="max-w-[200px] truncate py-3 pr-4 text-white" title={page.title || page.path}>
                              {page.path}
                            </td>
                            <td className="py-3 pr-4 text-right text-white">{fmt(page.views)}</td>
                            <td className="py-3 pr-4 text-right text-gray-300">{fmt(page.users)}</td>
                            <td className="py-3 text-right text-gray-400">
                              {(() => {
                                const s = Math.round(page.avgDuration);
                                const m = Math.floor(s / 60);
                                const sec = s % 60;
                                return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
                              })()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Traffic Sources */}
                <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Traffic Sources</h3>
                    <span className="text-xs text-gray-500">{ga4Sources.length} sources</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.06)] text-left text-xs text-gray-500">
                          <th className="pb-3 pr-4">Source / Medium</th>
                          <th className="pb-3 pr-4 text-right">Sessions</th>
                          <th className="pb-3 text-right">Users</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ga4Sources.map((src) => (
                          <tr key={`${src.source}-${src.medium}`} className="border-b border-[rgba(255,255,255,0.03)] transition-colors hover:bg-[#FE4205]/5">
                            <td className="py-3 pr-4 text-white">
                              {src.source}{src.medium !== "(none)" ? ` / ${src.medium}` : ""}
                            </td>
                            <td className="py-3 pr-4 text-right text-white">{fmt(src.sessions)}</td>
                            <td className="py-3 text-right text-gray-300">{fmt(src.users)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Bottom Row — Devices + Countries */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Devices */}
                <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6">
                  <h3 className="mb-4 text-sm font-semibold text-white">Devices</h3>
                  <div className="space-y-3">
                    {(() => {
                      const totalSessions = ga4Devices.reduce((s, d) => s + d.sessions, 0);
                      return ga4Devices.map((device) => {
                        const pct = totalSessions > 0 ? (device.sessions / totalSessions) * 100 : 0;
                        return (
                          <div key={device.device}>
                            <div className="mb-1 flex items-center justify-between text-sm">
                              <span className="capitalize text-white">{device.device}</span>
                              <span className="text-gray-400">{fmt(device.sessions)} ({pct.toFixed(1)}%)</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                              <div
                                className="h-full rounded-full bg-[#FE4205]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Countries */}
                <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6">
                  <h3 className="mb-4 text-sm font-semibold text-white">Top Countries</h3>
                  <div className="space-y-2">
                    {ga4Countries.map((country, i) => (
                      <div key={country.country} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-right text-xs text-gray-500">{i + 1}</span>
                          <span className="text-white">{country.country}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400">{fmt(country.sessions)} sessions</span>
                          <span className="text-gray-500">{fmt(country.users)} users</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Link to site analytics */}
              <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Product Analytics</h3>
                    <p className="mt-1 text-sm text-gray-400">
                      View product views, searches, and agent clicks on the Site Analytics page.
                    </p>
                  </div>
                  <Link
                    href="/admin/analytics"
                    className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#141414] px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    Site Analytics &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Not connected / Error state — show setup instructions */
            <div className="space-y-6">
              <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4285F4]/10">
                  <PlatformIcon type="chart" className="h-7 w-7 text-[#4285F4]" />
                </div>
                {ga4Error ? (
                  <>
                    <h3 className="text-lg font-semibold text-white">Analytics API Error</h3>
                    <p className="mt-2 text-sm text-red-400">{ga4Error}</p>
                    <button
                      onClick={fetchGA4Data}
                      className="mt-4 rounded-lg bg-[#4285F4] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      Retry
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-white">Google Analytics Not Connected</h3>
                    <p className="mt-2 text-sm text-gray-400">
                      Add <code className="rounded bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 text-xs text-gray-300">GA4_PROPERTY_ID</code> and{" "}
                      <code className="rounded bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 text-xs text-gray-300">GOOGLE_SERVICE_ACCOUNT_KEY</code> to your Vercel environment variables.
                    </p>
                  </>
                )}
                <div className="mt-6 mx-auto max-w-sm text-left">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Setup steps</p>
                  <ol className="space-y-2 text-sm text-gray-400">
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
              </div>
            </div>
          )}
        </>
      )}

      {/* Footer status bar */}
      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[rgba(255,255,255,0.06)] pt-4">
        <span className="text-xs text-gray-500">Platform status:</span>
        <StatusBadge connected={false} label="Instagram" />
        <StatusBadge connected={tiktokConnected} label="TikTok" />
        <StatusBadge connected={ga4Connected} label="Analytics" />
      </div>
    </div>
  );
}
