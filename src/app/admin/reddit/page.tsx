"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface ContentResult {
  platform: string;
  title?: string;
  body: string;
  subreddit?: string;
  hashtags?: string;
  videoIdea?: string;
  contentType?: string;
  altText?: string;
  board?: string;
  link?: string;
}

interface BrandOption { name: string; count: number; }

type Platform = "reddit" | "tiktok" | "instagram" | "discord" | "pinterest";

const platformTemplates: Record<Platform, { value: string; label: string }[]> = {
  reddit: [
    { value: "weekly-finds", label: "Weekly Finds (25 items)" },
    { value: "intro", label: "Site Intro Post" },
    { value: "haul-guide", label: "Haul Guide" },
    { value: "budget", label: "Budget Steals Under ¥100" },
    { value: "girls", label: "Women's Finds" },
    { value: "brand-spotlight", label: "Brand Spotlight" },
  ],
  tiktok: [
    { value: "product-showcase", label: "Product Showcase" },
    { value: "top-5", label: "Top 5 Finds" },
    { value: "budget-challenge", label: "Budget Challenge" },
    { value: "girls", label: "Girls Collection" },
    { value: "pov-hook", label: "POV / Hook" },
  ],
  instagram: [
    { value: "carousel-weekly", label: "Carousel — Weekly Finds" },
    { value: "carousel-girls", label: "Carousel — Girls" },
    { value: "single-product", label: "Single Product Feature" },
    { value: "reel-walkthrough", label: "Reel — Site Walkthrough" },
    { value: "story-poll", label: "Story — Quick Poll" },
  ],
  discord: [
    { value: "weekly-drops", label: "Weekly Finds Drop" },
    { value: "new-products", label: "New Products Alert" },
    { value: "budget-alert", label: "Budget Alert" },
    { value: "girls-drop", label: "Girls Drop" },
    { value: "welcome", label: "Welcome / Server Info" },
  ],
  pinterest: [
    { value: "outfit-pin", label: "Outfit Flat-Lay Pin" },
    { value: "single-product-pin", label: "Single Product Pin" },
    { value: "top-5-pin", label: "Top 5 Finds Pin" },
    { value: "girls-pin", label: "Girls Collection Pin" },
    { value: "brand-spotlight-pin", label: "Brand Spotlight Pin" },
  ],
};

const platformLabels: Record<Platform, string> = {
  reddit: "Reddit",
  tiktok: "TikTok",
  instagram: "Instagram",
  discord: "Discord",
  pinterest: "Pinterest",
};

export default function ContentGeneratorPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("");

  const [platform, setPlatform] = useState<Platform>("reddit");
  const [template, setTemplate] = useState("weekly-finds");
  const [brand, setBrand] = useState("");
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [result, setResult] = useState<ContentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-auth");
    if (saved) { setStoredPassword(saved); setAuthed(true); }
  }, []);

  const handleLogin = () => {
    if (!password) return;
    setStoredPassword(password);
    sessionStorage.setItem("admin-auth", password);
    setAuthed(true);
  };

  const fetchBrands = useCallback(async () => {
    if (!storedPassword) return;
    const res = await fetch("/api/admin/reddit/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": storedPassword },
      body: JSON.stringify({ template: "brands" }),
    });
    if (res.ok) { const d = await res.json(); setBrands(d.brands || []); }
  }, [storedPassword]);

  useEffect(() => { if (authed) fetchBrands(); }, [authed, fetchBrands]);

  useEffect(() => {
    setTemplate(platformTemplates[platform][0].value);
    setResult(null);
  }, [platform]);

  const generate = async () => {
    if ((template === "brand-spotlight" || template === "brand-spotlight-pin") && !brand) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reddit/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": storedPassword },
        body: JSON.stringify({ platform, template, brand }),
      });
      if (res.status === 401) { setAuthed(false); sessionStorage.removeItem("admin-auth"); return; }
      if (res.ok) setResult(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyBlock = ({ label, text, field, charLimit }: { label: string; text: string; field: string; charLimit?: number }) => (
    <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">{label}</label>
          {charLimit && <span className={`text-xs ${text.length > charLimit ? "text-red-400" : "text-[#6B7280]"}`}>{text.length}/{charLimit}</span>}
        </div>
        <button onClick={() => copy(text, field)} className="text-sm text-[#FE4205] hover:text-[#FE4205]/80 transition-colors">{copiedField === field ? "✓ Copied!" : "Copy"}</button>
      </div>
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#d4d4d8]">{text}</pre>
    </div>
  );

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="w-full max-w-sm rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111] p-8">
          <h1 className="mb-6 text-center text-xl font-bold text-white">Content Generator</h1>
          <input type="password" placeholder="Admin password" value={password}
            onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="mb-4 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder-[#6B7280] outline-none focus:border-[#FE4205]" />
          <button onClick={handleLogin} className="w-full rounded-lg bg-[#FE4205] py-3 text-sm font-bold text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)]">Log in</button>
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
              <Link href="/admin" className="text-sm text-[#6B7280] hover:text-white transition-colors">← Admin</Link>
              <h1 className="text-lg font-bold">Content Generator</h1>
            </div>
            <button onClick={() => { sessionStorage.removeItem("admin-auth"); setAuthed(false); }}
              className="text-sm text-[#6B7280] hover:text-white transition-colors">Logout</button>
          </div>
        </div>
      </div>

      {/* Platform tabs */}
      <div className="border-b border-[rgba(255,255,255,0.06)] px-6">
        <div className="mx-auto max-w-4xl flex gap-0">
          {(Object.keys(platformLabels) as Platform[]).map((p) => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                platform === p ? "border-[#FE4205] text-white" : "border-transparent text-[#6B7280] hover:text-[#9CA3AF]"
              }`}>
              {platformLabels[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-6">
        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#9CA3AF]">Template</label>
            <select value={template} onChange={(e) => { setTemplate(e.target.value); setResult(null); }}
              className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2.5 text-sm text-white outline-none focus:border-[#FE4205]">
              {platformTemplates[platform].map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {(template === "brand-spotlight" || template === "brand-spotlight-pin") && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#9CA3AF]">Brand</label>
              <select value={brand} onChange={(e) => setBrand(e.target.value)}
                className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2.5 text-sm text-white outline-none focus:border-[#FE4205]">
                <option value="">Select brand...</option>
                {brands.map((b) => <option key={b.name} value={b.name}>{b.name} ({b.count})</option>)}
              </select>
            </div>
          )}

          <button onClick={generate} disabled={loading || ((template === "brand-spotlight" || template === "brand-spotlight-pin") && !brand)}
            className="rounded-lg bg-[#FE4205] px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)] disabled:opacity-30">
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {/* Output */}
        {result && (
          <div className="space-y-4">
            {result.subreddit && <p className="text-sm text-[#6B7280]">Best for: <span className="text-[#FE4205]">{result.subreddit}</span></p>}
            {result.contentType && <p className="text-sm text-[#6B7280]">Format: <span className="text-[#FE4205]">{result.contentType}</span></p>}
            {result.board && <p className="text-sm text-[#6B7280]">Board: <span className="text-[#FE4205]">{result.board}</span></p>}
            {(platform === "reddit" || platform === "pinterest") && result.title && <CopyBlock label={platform === "pinterest" ? "Pin Title" : "Post Title"} text={result.title} field="title" charLimit={platform === "pinterest" ? 100 : undefined} />}
            <CopyBlock
              label={platform === "reddit" ? "Post Body" : platform === "discord" ? "Message" : platform === "pinterest" ? "Pin Description" : "Caption"}
              text={result.body} field="body"
              charLimit={platform === "tiktok" ? 4000 : platform === "instagram" ? 2200 : platform === "pinterest" ? 500 : undefined} />
            {platform === "tiktok" && result.hashtags && <CopyBlock label="Hashtags" text={result.hashtags} field="hashtags" />}
            {platform === "tiktok" && result.videoIdea && <CopyBlock label="Video Idea" text={result.videoIdea} field="videoIdea" />}
            {platform === "pinterest" && result.altText && <CopyBlock label="Alt Text" text={result.altText} field="altText" />}
            {platform === "pinterest" && result.link && <CopyBlock label="Pin Link" text={result.link} field="link" />}
            <button onClick={generate} disabled={loading} className="text-sm text-[#6B7280] hover:text-white transition-colors disabled:opacity-30">🔄 Regenerate</button>
          </div>
        )}

        {!result && !loading && (
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] px-8 py-16 text-center">
            <p className="text-[#6B7280]">Select a template and click Generate.</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <svg className="h-8 w-8 animate-spin text-[#FE4205]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
