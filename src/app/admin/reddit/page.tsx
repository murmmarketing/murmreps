"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Post {
  title: string;
  body: string;
  subreddit: string;
}

interface BrandOption {
  name: string;
  count: number;
}

const templates = [
  { value: "weekly-finds", label: "Weekly Finds (25 items)" },
  { value: "intro", label: "Site Intro Post" },
  { value: "haul-guide", label: "Haul Guide" },
  { value: "budget", label: "Budget Steals Under ¥100" },
  { value: "girls", label: "Women's Finds" },
  { value: "brand-spotlight", label: "Brand Spotlight" },
];

export default function RedditGeneratorPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("");

  const [template, setTemplate] = useState("weekly-finds");
  const [brand, setBrand] = useState("");
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<"title" | "body" | null>(null);

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

  // Fetch brands for spotlight dropdown
  const fetchBrands = useCallback(async () => {
    if (!storedPassword) return;
    const res = await fetch("/api/admin/reddit/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": storedPassword,
      },
      body: JSON.stringify({ template: "brands" }),
    });
    if (res.ok) {
      const data = await res.json();
      setBrands(data.brands || []);
    }
  }, [storedPassword]);

  useEffect(() => {
    if (authed) fetchBrands();
  }, [authed, fetchBrands]);

  const generate = async () => {
    if (template === "brand-spotlight" && !brand) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reddit/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": storedPassword,
        },
        body: JSON.stringify({ template, brand }),
      });
      if (res.status === 401) {
        setAuthed(false);
        sessionStorage.removeItem("admin-auth");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPost(data);
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string, type: "title" | "body") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // Login
  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="w-full max-w-sm rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111] p-8">
          <h1 className="mb-6 text-center text-xl font-bold text-white">
            Reddit Generator
          </h1>
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
      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.06)]">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-sm text-[#6B7280] hover:text-white transition-colors"
              >
                ← Admin
              </Link>
              <h1 className="text-lg font-bold">Reddit Post Generator</h1>
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

      <div className="mx-auto max-w-4xl px-6 py-6">
        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#9CA3AF]">
              Template
            </label>
            <select
              value={template}
              onChange={(e) => {
                setTemplate(e.target.value);
                setPost(null);
              }}
              className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2.5 text-sm text-white outline-none focus:border-[#FE4205]"
            >
              {templates.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {template === "brand-spotlight" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#9CA3AF]">
                Brand
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2.5 text-sm text-white outline-none focus:border-[#FE4205]"
              >
                <option value="">Select brand...</option>
                {brands.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name} ({b.count})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={generate}
            disabled={loading || (template === "brand-spotlight" && !brand)}
            className="rounded-lg bg-[#FE4205] px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)] disabled:opacity-30"
          >
            {loading ? "Generating..." : "Generate Post"}
          </button>
        </div>

        {/* Output */}
        {post && (
          <div className="space-y-4">
            {/* Subreddit */}
            <p className="text-sm text-[#6B7280]">
              Best for:{" "}
              <span className="text-[#FE4205]">{post.subreddit}</span>
            </p>

            {/* Title */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                  Post Title
                </label>
                <button
                  onClick={() => copyToClipboard(post.title, "title")}
                  className="text-sm text-[#FE4205] hover:text-[#FE4205]/80 transition-colors"
                >
                  {copied === "title" ? "✓ Copied!" : "Copy"}
                </button>
              </div>
              <p className="font-medium text-white">{post.title}</p>
            </div>

            {/* Body */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                  Post Body
                </label>
                <button
                  onClick={() => copyToClipboard(post.body, "body")}
                  className="text-sm text-[#FE4205] hover:text-[#FE4205]/80 transition-colors"
                >
                  {copied === "body" ? "✓ Copied!" : "Copy"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#d4d4d8]">
                {post.body}
              </pre>
            </div>

            {/* Actions */}
            <button
              onClick={generate}
              disabled={loading}
              className="text-sm text-[#6B7280] hover:text-white transition-colors disabled:opacity-30"
            >
              🔄 Regenerate (shuffle products)
            </button>
          </div>
        )}

        {!post && !loading && (
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] px-8 py-16 text-center">
            <p className="text-[#6B7280]">
              Select a template and click Generate to create a Reddit post.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <svg
              className="h-8 w-8 animate-spin text-[#FE4205]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
