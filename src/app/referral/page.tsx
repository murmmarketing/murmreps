"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";

interface LeaderboardEntry { nickname: string; conversions: number; }

function badge(n: number): string {
  if (n >= 25) return "Legend";
  if (n >= 10) return "Ambassador";
  if (n >= 5) return "Connector";
  if (n >= 1) return "Starter";
  return "";
}

export default function ReferralPage() {
  const { showToast } = useToast();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [refCode, setRefCode] = useState("");
  const [visits, setVisits] = useState(0);
  const [conversions, setConversions] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("murmreps_my_ref");
    if (saved) { setRefCode(saved); fetchStats(saved); }
    fetchLeaderboard();
  }, []);

  const fetchStats = async (code: string) => {
    const res = await fetch(`/api/referral/stats?code=${code}`);
    if (res.ok) { const d = await res.json(); setVisits(d.visits); setConversions(d.conversions); }
  };

  const fetchLeaderboard = async () => {
    const res = await fetch("/api/referral/leaderboard");
    if (res.ok) { const d = await res.json(); setLeaderboard(d.leaderboard || []); }
  };

  const generate = async () => {
    if (nickname.length < 2) return;
    setLoading(true);
    const res = await fetch("/api/referral/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, email }),
    });
    if (res.ok) {
      const d = await res.json();
      setRefCode(d.ref_code);
      localStorage.setItem("murmreps_my_ref", d.ref_code);
    }
    setLoading(false);
  };

  const link = refCode ? `https://murmreps.com?ref=${refCode}` : "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center mb-10">
        <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">Share MurmReps, Earn Rep</h1>
        <p className="mt-3 text-text-secondary">Get your unique link and track how many people you bring.</p>
      </div>

      {!refCode ? (
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6 space-y-4">
          <input value={nickname} onChange={(e) => setNickname(e.target.value.slice(0, 30))} placeholder="Your nickname *"
            className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder-text-muted outline-none focus:border-accent/50" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)"
            className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder-text-muted outline-none focus:border-accent/50" />
          <button onClick={generate} disabled={loading || nickname.length < 2}
            className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_24px_rgba(254,66,5,0.3)] disabled:opacity-30">
            {loading ? "Generating..." : "Generate My Link"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Link */}
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
            <p className="text-xs text-text-muted mb-2">Your referral link</p>
            <div className="flex gap-2">
              <input readOnly value={link} className="flex-1 rounded-lg bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] px-3 py-2.5 text-sm text-white outline-none" />
              <button onClick={() => { navigator.clipboard.writeText(link); showToast("Link copied!"); }}
                className="shrink-0 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-white">Copy</button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 text-center">
              <p className="text-2xl font-bold text-white">{visits}</p>
              <p className="text-xs text-text-muted">Visits</p>
            </div>
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 text-center">
              <p className="text-2xl font-bold text-accent">{conversions}</p>
              <p className="text-xs text-text-muted">Signups</p>
            </div>
          </div>

          {badge(conversions) && (
            <div className="text-center">
              <span className="rounded-full bg-accent/15 px-4 py-1.5 text-sm font-semibold text-accent">{badge(conversions)}</span>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-white mb-4">Top Referrers</h2>
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] divide-y divide-[rgba(255,255,255,0.06)]">
            {leaderboard.map((e, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-text-muted w-6">{i + 1}</span>
                  <span className="text-sm text-white">{e.nickname}</span>
                  {badge(e.conversions) && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">{badge(e.conversions)}</span>}
                </div>
                <span className="text-sm text-accent font-bold">{e.conversions}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
