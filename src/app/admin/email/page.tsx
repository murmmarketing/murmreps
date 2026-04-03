"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface Subscriber {
  id: string;
  email: string;
  source: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

interface Campaign {
  id: string;
  subject: string;
  audience: string;
  sent_count: number;
  error_count: number;
  sent_at: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

const AGENT_DEAL_TEMPLATE = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family:Arial,Helvetica,sans-serif; -webkit-font-smoothing:antialiased;">
  <div style="max-width:600px; margin:0 auto;">

    <div style="height:24px;"></div>

    <!-- Logo -->
    <div style="text-align:center; padding:32px 24px 24px;">
      <span style="font-size:28px; font-weight:800; letter-spacing:-0.5px;">
        <span style="color:#f97316;">M</span><span style="color:#ffffff;">urm</span><span style="color:#f97316;">Reps</span>
      </span>
    </div>

    <!-- Hero -->
    <div style="text-align:center; padding:48px 32px; background:linear-gradient(135deg, #f97316 0%, #c2410c 100%); border-radius:16px; margin:0 16px 24px;">
      <p style="color:#fff; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin:0 0 12px; opacity:0.8; font-weight:600;">Exclusive for MurmReps subscribers</p>
      <h1 style="color:#fff; font-size:36px; font-weight:800; margin:0 0 12px; line-height:1.1; letter-spacing:-0.5px;">KakoBuy</h1>
      <p style="color:rgba(255,255,255,0.9); font-size:16px; line-height:1.6; margin:0 0 24px; max-width:380px; display:inline-block;">
        The #1 agent used by 80% of the rep community. Start your first haul today.
      </p>
      <a href="https://ikako.vip/r/6gkjt" style="display:inline-block; background:#fff; color:#f97316; padding:14px 40px; border-radius:10px; text-decoration:none; font-weight:700; font-size:15px;">
        Sign up to KakoBuy →
      </a>
    </div>

    <!-- Divider -->
    <div style="height:1px; background:#1a1a1a; margin:0 32px;"></div>

    <!-- Why KakoBuy -->
    <div style="padding:32px 24px 16px;">
      <p style="color:#f97316; font-size:12px; text-transform:uppercase; letter-spacing:2px; margin:0 0 4px; font-weight:600;">Why KakoBuy?</p>
      <h2 style="color:#fff; font-size:22px; font-weight:700; margin:0; letter-spacing:-0.3px;">Built for the repfam</h2>
    </div>

    <!-- Benefit Cards -->
    <div style="padding:0 24px 32px;">
      <div style="background:#111; border-radius:12px; padding:20px; margin-bottom:12px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="48" style="vertical-align:top;">
              <div style="background:rgba(249,115,22,0.12); width:36px; height:36px; border-radius:10px; text-align:center; line-height:36px; font-size:18px;">⚡</div>
            </td>
            <td style="vertical-align:top; padding-left:14px;">
              <p style="color:#fff; font-size:15px; font-weight:600; margin:0 0 4px;">Fastest QC Photos</p>
              <p style="color:#a1a1aa; font-size:13px; line-height:1.5; margin:0;">Get detailed quality check photos within 24 hours of your item arriving at the warehouse.</p>
            </td>
          </tr>
        </table>
      </div>

      <div style="background:#111; border-radius:12px; padding:20px; margin-bottom:12px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="48" style="vertical-align:top;">
              <div style="background:rgba(249,115,22,0.12); width:36px; height:36px; border-radius:10px; text-align:center; line-height:36px; font-size:18px;">🛡️</div>
            </td>
            <td style="vertical-align:top; padding-left:14px;">
              <p style="color:#fff; font-size:15px; font-weight:600; margin:0 0 4px;">Free Returns</p>
              <p style="color:#a1a1aa; font-size:13px; line-height:1.5; margin:0;">Don't like what you see? Return any item for free. No questions asked.</p>
            </td>
          </tr>
        </table>
      </div>

      <div style="background:#111; border-radius:12px; padding:20px; margin-bottom:12px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="48" style="vertical-align:top;">
              <div style="background:rgba(249,115,22,0.12); width:36px; height:36px; border-radius:10px; text-align:center; line-height:36px; font-size:18px;">💬</div>
            </td>
            <td style="vertical-align:top; padding-left:14px;">
              <p style="color:#fff; font-size:15px; font-weight:600; margin:0 0 4px;">24/7 Live Chat Support</p>
              <p style="color:#a1a1aa; font-size:13px; line-height:1.5; margin:0;">Real humans answering your questions around the clock. Not bots.</p>
            </td>
          </tr>
        </table>
      </div>

      <div style="background:#111; border-radius:12px; padding:20px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="48" style="vertical-align:top;">
              <div style="background:rgba(249,115,22,0.12); width:36px; height:36px; border-radius:10px; text-align:center; line-height:36px; font-size:18px;">📦</div>
            </td>
            <td style="vertical-align:top; padding-left:14px;">
              <p style="color:#fff; font-size:15px; font-weight:600; margin:0 0 4px;">Competitive Shipping</p>
              <p style="color:#a1a1aa; font-size:13px; line-height:1.5; margin:0;">Multiple shipping lines with real-time tracking. 7-15 day delivery to most countries.</p>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Big CTA -->
    <div style="padding:0 24px 32px;">
      <div style="background:linear-gradient(135deg, #f97316 0%, #c2410c 100%); border-radius:12px; padding:32px; text-align:center;">
        <h2 style="color:#fff; font-size:24px; font-weight:800; margin:0 0 8px; letter-spacing:-0.3px;">Start buying now</h2>
        <p style="color:rgba(255,255,255,0.85); font-size:14px; margin:0 0 20px; line-height:1.5;">Create your free KakoBuy account and browse 15,000+ finds on MurmReps.</p>
        <a href="https://ikako.vip/r/6gkjt" style="display:inline-block; background:#fff; color:#f97316; padding:14px 40px; border-radius:10px; text-decoration:none; font-weight:700; font-size:15px;">
          Sign up to KakoBuy →
        </a>
      </div>
    </div>

    <!-- Other agents mention -->
    <div style="text-align:center; padding:0 24px 32px;">
      <p style="color:#52525b; font-size:12px; margin:0; line-height:1.6;">
        Also available: Superbuy, CnFans, MuleBuy, ACBuy, LoveGoBuy, JoyaGoo, SugarGoo
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center; padding:24px 24px 40px;">
      <p style="color:#333; font-size:12px; margin:0 0 8px;">
        MurmReps · The rep community's most trusted source
      </p>
      <a href="https://murmreps.com/api/newsletter/unsubscribe?email={{email}}" style="color:#444; font-size:11px; text-decoration:underline;">Unsubscribe</a>
    </div>

  </div>
</body>
</html>`;

export default function EmailAdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("");

  // Stats
  const [totalActive, setTotalActive] = useState(0);
  const [thisWeek, setThisWeek] = useState(0);
  const [thisMonth, setThisMonth] = useState(0);
  const [unsubscribed, setUnsubscribed] = useState(0);

  // Subscribers table
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subSearch, setSubSearch] = useState("");
  const [subPage, setSubPage] = useState(1);
  const [subTotal, setSubTotal] = useState(0);
  const subPerPage = 25;

  // Campaign form
  const [audience, setAudience] = useState("all");
  const [audienceCount, setAudienceCount] = useState(0);
  const [subject, setSubject] = useState("");
  const [template, setTemplate] = useState("custom");
  const [htmlContent, setHtmlContent] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [generatingTemplate, setGeneratingTemplate] = useState(false);

  // Preview modal
  const [showPreview, setShowPreview] = useState(false);

  // Send confirmation
  const [showSendConfirm, setShowSendConfirm] = useState(false);

  // Campaign history
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Tab
  const [activeTab, setActiveTab] = useState<"subscribers" | "compose" | "history">("subscribers");

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

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

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!storedPassword) return;
    try {
      const headers = { "x-admin-password": storedPassword };

      // We'll use the products API pattern but hit Supabase directly via a custom endpoint
      // For now, fetch subscribers and compute stats client-side
      const res = await fetch(`/api/admin/email/subscribers?page=1&limit=1&stats=true`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTotalActive(data.totalActive || 0);
        setThisWeek(data.thisWeek || 0);
        setThisMonth(data.thisMonth || 0);
        setUnsubscribed(data.unsubscribed || 0);
      }
    } catch { /* ignore */ }
  }, [storedPassword]);

  // Fetch subscribers
  const fetchSubscribers = useCallback(async () => {
    if (!storedPassword) return;
    try {
      const params = new URLSearchParams({
        page: String(subPage),
        limit: String(subPerPage),
      });
      if (subSearch) params.set("search", subSearch);

      const res = await fetch(`/api/admin/email/subscribers?${params}`, {
        headers: { "x-admin-password": storedPassword },
      });
      if (res.status === 401) {
        setAuthed(false);
        sessionStorage.removeItem("admin-auth");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
        setSubTotal(data.total || 0);
      }
    } catch { /* ignore */ }
  }, [storedPassword, subPage, subSearch]);

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    if (!storedPassword) return;
    try {
      const res = await fetch(`/api/admin/email/campaigns`, {
        headers: { "x-admin-password": storedPassword },
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch { /* ignore */ }
  }, [storedPassword]);

  useEffect(() => {
    if (authed) {
      fetchStats();
      fetchSubscribers();
      fetchCampaigns();
    }
  }, [authed, fetchStats, fetchSubscribers, fetchCampaigns]);

  // Update audience count when audience changes
  useEffect(() => {
    if (audience === "all") setAudienceCount(totalActive);
    else if (audience === "this_week") setAudienceCount(thisWeek);
    else if (audience === "this_month") setAudienceCount(thisMonth);
  }, [audience, totalActive, thisWeek, thisMonth]);

  // Handle template change
  const handleTemplateChange = async (tmpl: string) => {
    setTemplate(tmpl);
    if (tmpl === "custom") {
      setHtmlContent("");
      setSubject("");
      return;
    }
    if (tmpl === "agent_deal") {
      setHtmlContent(AGENT_DEAL_TEMPLATE);
      setSubject("🤝 Exclusive agent deal for MurmReps fam");
      return;
    }

    setGeneratingTemplate(true);
    try {
      const endpoint = tmpl === "weekly_drops"
        ? "/api/admin/email/templates/weekly-drops"
        : "/api/admin/email/templates/new-products";

      const res = await fetch(endpoint, {
        headers: { "x-admin-password": storedPassword },
      });
      if (res.ok) {
        const data = await res.json();
        setHtmlContent(data.html);
        setSubject(
          tmpl === "weekly_drops"
            ? "🔥 This Week's Hottest Drops — MurmReps"
            : `🚀 ${data.productCount} New Products Just Landed — MurmReps`
        );
        addToast(`Template generated with ${data.productCount} products`);
      } else {
        addToast("Failed to generate template", "error");
      }
    } catch {
      addToast("Failed to generate template", "error");
    }
    setGeneratingTemplate(false);
  };

  // Send test
  const handleSendTest = async () => {
    if (!testEmail || !subject || !htmlContent) {
      addToast("Fill in subject, content, and test email", "error");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": storedPassword,
        },
        body: JSON.stringify({ subject, html: htmlContent, testEmail }),
      });
      if (res.ok) {
        addToast(`Test email sent to ${testEmail}`);
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to send test", "error");
      }
    } catch {
      addToast("Failed to send test email", "error");
    }
    setSending(false);
  };

  // Send campaign
  const handleSendCampaign = async () => {
    if (!subject || !htmlContent) {
      addToast("Fill in subject and content", "error");
      return;
    }
    setSending(true);
    setShowSendConfirm(false);
    try {
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": storedPassword,
        },
        body: JSON.stringify({ subject, html: htmlContent, audience }),
      });
      if (res.ok) {
        const data = await res.json();
        addToast(`Campaign sent! ${data.sent} delivered, ${data.errors} errors`);
        fetchCampaigns();
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to send campaign", "error");
      }
    } catch {
      addToast("Failed to send campaign", "error");
    }
    setSending(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const header = "Email,Source,Subscribed At,Status\n";
    const rows = subscribers.map((s) =>
      `${s.email},${s.source || "popup"},${s.subscribed_at},${s.unsubscribed_at ? "unsubscribed" : "active"}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `murmreps-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const subTotalPages = Math.max(1, Math.ceil(subTotal / subPerPage));

  // Login screen
  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="w-full max-w-sm rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111] p-8">
          <h1 className="mb-6 text-center text-xl font-bold text-white">Email Admin</h1>
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Toast system */}
      <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
              t.type === "success"
                ? "bg-green-900/80 text-green-200 border border-green-700/50"
                : "bg-red-900/80 text-red-200 border border-red-700/50"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.06)] bg-[#0A0A0A]">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-sm text-[#6B7280] hover:text-white transition-colors">
                ← Admin
              </Link>
              <h1 className="text-lg font-bold">Email Marketing</h1>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem("admin-auth");
                setAuthed(false);
              }}
              className="text-sm text-[#6B7280] hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto max-w-6xl px-6 py-5">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5" style={{ borderLeft: "4px solid #FE4205" }}>
            <div className="text-2xl font-bold">{totalActive.toLocaleString()}</div>
            <div className="mt-1 text-xs text-[#9CA3AF]">Active Subscribers</div>
          </div>
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5" style={{ borderLeft: "4px solid #10B981" }}>
            <div className="text-2xl font-bold">{thisWeek.toLocaleString()}</div>
            <div className="mt-1 text-xs text-[#9CA3AF]">This Week</div>
          </div>
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5" style={{ borderLeft: "4px solid #3B82F6" }}>
            <div className="text-2xl font-bold">{thisMonth.toLocaleString()}</div>
            <div className="mt-1 text-xs text-[#9CA3AF]">This Month</div>
          </div>
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5" style={{ borderLeft: "4px solid #6B7280" }}>
            <div className="text-2xl font-bold">{unsubscribed.toLocaleString()}</div>
            <div className="mt-1 text-xs text-[#9CA3AF]">Unsubscribed</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[rgba(255,255,255,0.06)] px-6">
        <div className="mx-auto max-w-6xl flex gap-0">
          {(["subscribers", "compose", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-[#FE4205] text-white"
                  : "border-transparent text-[#6B7280] hover:text-[#9CA3AF]"
              }`}
            >
              {tab === "subscribers" ? "Subscribers" : tab === "compose" ? "Send Campaign" : "History"}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-5">
        {/* =============== SUBSCRIBERS TAB =============== */}
        {activeTab === "subscribers" && (
          <div>
            {/* Search + Export */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <input
                type="text"
                placeholder="Search by email..."
                value={subSearch}
                onChange={(e) => { setSubSearch(e.target.value); setSubPage(1); }}
                className="w-full sm:w-80 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2.5 text-sm text-white placeholder-[#6B7280] outline-none focus:border-[#FE4205]"
              />
              <button
                onClick={handleExportCSV}
                className="shrink-0 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2.5 text-sm text-[#9CA3AF] hover:text-white transition-colors"
              >
                Export CSV
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[#141414]">
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Subscribed</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-[#6B7280]">
                        No subscribers yet
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((s) => (
                      <tr key={s.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]">
                        <td className="px-4 py-3 text-white">{s.email}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-xs text-[#9CA3AF]">
                            {s.source || "popup"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#9CA3AF]">
                          {new Date(s.subscribed_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {s.unsubscribed_at ? (
                            <span className="text-xs text-red-400">Unsubscribed</span>
                          ) : (
                            <span className="text-xs text-green-400">Active</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {subTotalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-[#6B7280]">
                  {subTotal} total · Page {subPage} of {subTotalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                    disabled={subPage === 1}
                    className="rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-1.5 text-sm text-[#9CA3AF] hover:text-white disabled:opacity-30 transition-colors"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setSubPage((p) => Math.min(subTotalPages, p + 1))}
                    disabled={subPage === subTotalPages}
                    className="rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-1.5 text-sm text-[#9CA3AF] hover:text-white disabled:opacity-30 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =============== COMPOSE TAB =============== */}
        {activeTab === "compose" && (
          <div className="max-w-3xl space-y-6">
            {/* Audience */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#9CA3AF]">Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2.5 text-sm text-white outline-none focus:border-[#FE4205]"
              >
                <option value="all">All subscribers</option>
                <option value="this_week">Subscribed this week</option>
                <option value="this_month">Subscribed this month</option>
              </select>
              <p className="mt-1.5 text-xs text-[#6B7280]">
                Sending to: <span className="text-white font-medium">{audienceCount}</span> subscribers
              </p>
            </div>

            {/* Subject */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#9CA3AF]">Subject line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject line"
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2.5 text-sm text-white placeholder-[#6B7280] outline-none focus:border-[#FE4205]"
              />
            </div>

            {/* Template */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#9CA3AF]">Template</label>
              <select
                value={template}
                onChange={(e) => handleTemplateChange(e.target.value)}
                disabled={generatingTemplate}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2.5 text-sm text-white outline-none focus:border-[#FE4205] disabled:opacity-50"
              >
                <option value="custom">Custom HTML</option>
                <option value="weekly_drops">Weekly Drops</option>
                <option value="new_products">New Products Alert</option>
                <option value="agent_deal">Agent Deal</option>
              </select>
              {generatingTemplate && (
                <p className="mt-1.5 text-xs text-[#FE4205]">Generating template from live data...</p>
              )}
            </div>

            {/* Content editor */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#9CA3AF]">HTML Content</label>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="Email HTML content..."
                rows={20}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-3 text-sm text-white placeholder-[#6B7280] outline-none focus:border-[#FE4205] font-mono"
              />
            </div>

            {/* Preview */}
            <button
              onClick={() => setShowPreview(true)}
              disabled={!htmlContent}
              className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-5 py-2.5 text-sm text-[#9CA3AF] hover:text-white transition-colors disabled:opacity-30"
            >
              Preview Email
            </button>

            {/* Send test */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
              <h3 className="mb-3 text-sm font-medium text-white">Send Test Email</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder-[#6B7280] outline-none focus:border-[#FE4205]"
                />
                <button
                  onClick={handleSendTest}
                  disabled={sending || !testEmail || !subject || !htmlContent}
                  className="shrink-0 rounded-lg border border-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors disabled:opacity-30"
                >
                  {sending ? "Sending..." : "Send Test"}
                </button>
              </div>
            </div>

            {/* Send to all */}
            <button
              onClick={() => setShowSendConfirm(true)}
              disabled={sending || !subject || !htmlContent || audienceCount === 0}
              className="w-full rounded-xl bg-[#FE4205] py-3.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)] disabled:opacity-30"
            >
              {sending ? "Sending..." : `Send to ${audienceCount} subscribers`}
            </button>
          </div>
        )}

        {/* =============== HISTORY TAB =============== */}
        {activeTab === "history" && (
          <div>
            <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[#141414]">
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Audience</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Sent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Errors</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-[#6B7280]">
                        No campaigns sent yet
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((c) => (
                      <tr key={c.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]">
                        <td className="px-4 py-3 text-white max-w-xs truncate">{c.subject}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-xs text-[#9CA3AF]">
                            {c.audience}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-green-400">{c.sent_count}</td>
                        <td className="px-4 py-3 text-red-400">{c.error_count}</td>
                        <td className="px-4 py-3 text-[#9CA3AF]">
                          {new Date(c.sent_at).toLocaleDateString()} {new Date(c.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              srcDoc={htmlContent}
              className="w-full h-[80vh] border-0"
              title="Email Preview"
            />
          </div>
        </div>
      )}

      {/* Send Confirmation Modal */}
      {showSendConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowSendConfirm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#141414] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2">Confirm Send</h3>
            <p className="text-sm text-[#9CA3AF] mb-1">
              Are you sure you want to send to <span className="text-white font-bold">{audienceCount}</span> subscribers?
            </p>
            <p className="text-xs text-[#6B7280] mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSendConfirm(false)}
                className="flex-1 rounded-lg border border-[rgba(255,255,255,0.08)] py-2.5 text-sm text-[#9CA3AF] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendCampaign}
                className="flex-1 rounded-lg bg-[#FE4205] py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)]"
              >
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
