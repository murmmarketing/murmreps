"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Stats {
  totalProducts: number;
  withImages: number;
  girlsProducts: number;
  subscribers: number;
  campaigns: number;
  recentSubscribers: { email: string; subscribed_at: string }[];
  recentProducts: { id: number; name: string; brand: string; created_at: string }[];
}

function StatCard({
  label, value, icon, gradient,
}: {
  label: string; value: number | string; icon: string; gradient: string;
}) {
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-5 ${gradient}`}>
      <div className="mb-2 text-2xl">{icon}</div>
      <p className="text-3xl font-bold text-white">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="mt-1 text-sm text-[#9CA3AF]">{label}</p>
    </div>
  );
}

function ToolCard({
  href, icon, title, description, badge,
}: {
  href: string; icon: string; title: string; description: string; badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111] p-5 transition-all hover:border-[rgba(255,255,255,0.12)] hover:bg-[#141414]"
    >
      <div className="mb-3 flex items-start justify-between">
        <span className="text-2xl">{icon}</span>
        {badge && (
          <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-2.5 py-1 text-xs text-[#9CA3AF] group-hover:bg-[rgba(255,255,255,0.1)]">
            {badge}
          </span>
        )}
      </div>
      <h3 className="mb-1 font-semibold text-white transition-colors group-hover:text-[#FE4205]">
        {title}
      </h3>
      <p className="text-sm text-[#6B7280]">{description}</p>
    </Link>
  );
}

function ActivityRow({
  icon, title, detail, time,
}: {
  icon: string; title: string; detail: string; time: string;
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="text-xs text-[#6B7280]">{detail}</p>
        </div>
      </div>
      <span className="shrink-0 text-xs text-[#52525b]">{time}</span>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);

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

  const fetchStats = useCallback(async () => {
    if (!storedPassword) return;
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { "x-admin-password": storedPassword },
      });
      if (res.status === 401) {
        setAuthed(false);
        sessionStorage.removeItem("admin-auth");
        return;
      }
      if (res.ok) setStats(await res.json());
    } catch { /* ignore */ }
  }, [storedPassword]);

  useEffect(() => {
    if (authed) fetchStats();
  }, [authed, fetchStats]);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="w-full max-w-sm rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111] p-8">
          <h1 className="mb-6 text-center text-xl font-bold text-white">MurmReps Admin</h1>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="mb-4 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder-[#6B7280] outline-none focus:border-[#FE4205]"
          />
          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-[#FE4205] py-3 text-sm font-bold text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)]"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  const s = stats;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-[#6B7280]">MurmReps Admin</p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="text-sm text-[#6B7280] transition-colors hover:text-white">
              View site →
            </Link>
            <button
              onClick={() => {
                sessionStorage.removeItem("admin-auth");
                setAuthed(false);
              }}
              className="text-sm text-[#6B7280] transition-colors hover:text-red-400"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total Products"
            value={s?.totalProducts ?? "—"}
            icon="📦"
            gradient="from-[#FE4205]/20 to-[#FE4205]/5 border-[#FE4205]/30"
          />
          <StatCard
            label="With Images"
            value={s?.withImages ?? "—"}
            icon="🖼️"
            gradient="from-green-500/20 to-green-500/5 border-green-500/30"
          />
          <StatCard
            label="Newsletter Subs"
            value={s?.subscribers ?? "—"}
            icon="📧"
            gradient="from-blue-500/20 to-blue-500/5 border-blue-500/30"
          />
          <StatCard
            label="Girls Collection"
            value={s?.girlsProducts ?? "—"}
            icon="👜"
            gradient="from-pink-500/20 to-pink-500/5 border-pink-500/30"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/admin/email"
            className="rounded-lg bg-[#FE4205] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#e03a04]"
          >
            Send Campaign
          </Link>
          <Link
            href="/admin/reddit"
            className="rounded-lg bg-[#1a1a1a] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#222]"
          >
            Generate Content
          </Link>
          <Link
            href="/admin/products"
            className="rounded-lg bg-[#1a1a1a] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#222]"
          >
            Manage Products
          </Link>
        </div>

        {/* Tools Grid */}
        <h2 className="mb-4 text-lg font-bold text-white">Tools</h2>
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard
            href="/admin/products"
            icon="📦"
            title="Products"
            description="Browse, edit, and manage all products"
            badge={s ? `${s.totalProducts.toLocaleString()}` : undefined}
          />
          <ToolCard
            href="/admin/email"
            icon="📧"
            title="Email Marketing"
            description="Subscribers, campaigns, and email templates"
            badge={s ? `${s.subscribers} subs` : undefined}
          />
          <ToolCard
            href="/admin/reddit"
            icon="✍️"
            title="Content Generator"
            description="Reddit, TikTok, Instagram, Discord posts"
            badge="4 platforms"
          />
          <ToolCard
            href="/admin/analytics"
            icon="📊"
            title="Analytics"
            description="Views, engagement, and traffic data"
          />
          <ToolCard
            href="/admin/products?action=import"
            icon="📥"
            title="Bulk Import"
            description="Import products from CSV or JSON"
          />
          <ToolCard
            href="/admin/products?action=scan"
            icon="🖼️"
            title="Image Scanner"
            description="Find broken images and missing photos"
          />
          <ToolCard
            href="/admin/products?action=duplicates"
            icon="🔍"
            title="Duplicate Finder"
            description="Find and merge duplicate products"
          />
          <ToolCard
            href="/admin/products?action=tiers"
            icon="⭐"
            title="Tier Manager"
            description="Recalculate product tiers and scoring"
          />
          <ToolCard
            href="/admin/marketing"
            icon="📱"
            title="Marketing"
            description="TikTok, Meta, and social integrations"
          />
        </div>

        {/* Recent Activity */}
        <h2 className="mb-4 text-lg font-bold text-white">Recent Activity</h2>
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111] divide-y divide-[rgba(255,255,255,0.06)]">
          {s?.recentProducts?.map((p) => (
            <ActivityRow
              key={`prod-${p.id}`}
              icon="📦"
              title="Product added"
              detail={`${p.name} (${p.brand})`}
              time={timeAgo(p.created_at)}
            />
          ))}
          {s?.recentSubscribers?.map((sub) => (
            <ActivityRow
              key={`sub-${sub.email}`}
              icon="📧"
              title="New subscriber"
              detail={sub.email}
              time={timeAgo(sub.subscribed_at)}
            />
          ))}
          {!s && (
            <div className="p-8 text-center text-[#6B7280]">
              Loading activity...
            </div>
          )}
          {s && !s.recentProducts?.length && !s.recentSubscribers?.length && (
            <div className="p-8 text-center text-[#6B7280]">
              No recent activity
            </div>
          )}
        </div>

        {/* Footer stats */}
        {s && s.campaigns > 0 && (
          <p className="mt-6 text-center text-xs text-[#52525b]">
            {s.campaigns} email campaign{s.campaigns !== 1 ? "s" : ""} sent
          </p>
        )}
      </div>
    </div>
  );
}
