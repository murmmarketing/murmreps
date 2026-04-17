"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Giveaway {
  id: string;
  title: string;
  description: string | null;
  prize_description: string;
  prize_image_url: string | null;
  entry_requirements: { type: string; label: string; url?: string }[];
  start_date: string;
  end_date: string;
  is_active: boolean;
  winner_name: string | null;
}

function useCountdown(endDate: string) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) return "Ended";
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return `${d}d ${h}h ${m}m ${s}s`;
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return timeLeft;
}

function GiveawayCard({ giveaway }: { giveaway: Giveaway }) {
  const countdown = useCountdown(giveaway.end_date);
  const [email, setEmail] = useState("");
  const [discord, setDiscord] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [instagram, setInstagram] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [entryCount, setEntryCount] = useState(0);

  useEffect(() => {
    supabase
      .from("giveaway_entries")
      .select("id", { count: "exact", head: true })
      .eq("giveaway_id", giveaway.id)
      .then(({ count }) => setEntryCount(count || 0));
  }, [giveaway.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError("");

    const { error: err } = await supabase.from("giveaway_entries").insert({
      giveaway_id: giveaway.id,
      email: email.trim(),
      discord_username: discord.trim() || null,
      tiktok_username: tiktok.trim() || null,
      instagram_username: instagram.trim() || null,
    });

    setSubmitting(false);
    if (err) {
      setError("Something went wrong. Try again.");
    } else {
      setSubmitted(true);
      setEntryCount((c) => c + 1);
    }
  };

  const ended = countdown === "Ended";

  return (
    <div className="rounded-2xl border border-subtle bg-surface overflow-hidden">
      {giveaway.prize_image_url && (
        <div
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${giveaway.prize_image_url})` }}
        />
      )}
      <div className="p-6">
        <h2 className="font-heading text-xl font-bold text-white">
          {giveaway.title}
        </h2>
        {giveaway.description && (
          <p className="mt-2 text-sm text-text-secondary">
            {giveaway.description}
          </p>
        )}
        <p className="mt-3 text-sm text-accent font-medium">
          🎁 {giveaway.prize_description}
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="rounded-btn bg-void px-3 py-2 text-center">
            <p className="text-xs text-text-muted">Time left</p>
            <p className="font-mono font-semibold text-white">{countdown}</p>
          </div>
          <div className="rounded-btn bg-void px-3 py-2 text-center">
            <p className="text-xs text-text-muted">Entries</p>
            <p className="font-semibold text-white">{entryCount}</p>
          </div>
        </div>

        {/* Requirements */}
        {giveaway.entry_requirements.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Requirements
            </p>
            <div className="mt-2 space-y-2">
              {giveaway.entry_requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="text-accent">✓</span>
                  {req.url ? (
                    <a href={req.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline">
                      {req.label}
                    </a>
                  ) : (
                    req.label
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Entry form */}
        {!ended && !submitted && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <input
              type="email"
              required
              placeholder="Your email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-btn border border-subtle bg-void px-4 py-2.5 text-sm text-white placeholder-text-muted outline-none focus:border-accent/50"
            />
            <input
              type="text"
              placeholder="Discord username"
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              className="w-full rounded-btn border border-subtle bg-void px-4 py-2.5 text-sm text-white placeholder-text-muted outline-none focus:border-accent/50"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="TikTok @"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                className="rounded-btn border border-subtle bg-void px-4 py-2.5 text-sm text-white placeholder-text-muted outline-none focus:border-accent/50"
              />
              <input
                type="text"
                placeholder="Instagram @"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="rounded-btn border border-subtle bg-void px-4 py-2.5 text-sm text-white placeholder-text-muted outline-none focus:border-accent/50"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-btn bg-accent py-3 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(254,66,5,0.15)] disabled:opacity-50"
            >
              {submitting ? "Entering..." : "Enter Giveaway"}
            </button>
          </form>
        )}

        {submitted && (
          <div className="mt-6 rounded-btn bg-green-500/10 border border-green-500/30 p-4 text-center">
            <p className="text-sm font-medium text-green-400">
              🎉 You&apos;re in! Good luck.
            </p>
          </div>
        )}

        {ended && giveaway.winner_name && (
          <div className="mt-6 rounded-btn bg-accent/10 border border-accent/30 p-4 text-center">
            <p className="text-xs text-text-muted">Winner</p>
            <p className="text-sm font-semibold text-white">{giveaway.winner_name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GiveawayPage() {
  const [active, setActive] = useState<Giveaway[]>([]);
  const [past, setPast] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const now = new Date().toISOString();

      const [{ data: activeData }, { data: pastData }] = await Promise.all([
        supabase
          .from("giveaways")
          .select("*")
          .eq("is_active", true)
          .gte("end_date", now)
          .order("end_date", { ascending: true }),
        supabase
          .from("giveaways")
          .select("*")
          .or(`is_active.eq.false,end_date.lt.${now}`)
          .order("end_date", { ascending: false })
          .limit(10),
      ]);

      setActive((activeData || []) as Giveaway[]);
      setPast((pastData || []) as Giveaway[]);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        MurmReps Giveaways
      </h1>
      <p className="mt-2 text-text-secondary">
        Enter for a chance to win free hauls, agent credits, and more
      </p>

      {loading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : (
        <>
          {active.length > 0 ? (
            <div className="mt-8 space-y-6">
              {active.map((g) => (
                <GiveawayCard key={g.id} giveaway={g} />
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-2xl border border-subtle bg-surface p-8 text-center">
              <p className="text-lg font-semibold text-white">
                No active giveaways right now
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Follow us on{" "}
                <a
                  href="https://discord.gg/8r5EFMRg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Discord
                </a>{" "}
                and{" "}
                <a
                  href="https://instagram.com/murmreps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Instagram
                </a>{" "}
                to get notified when the next giveaway drops.
              </p>
            </div>
          )}

          {past.length > 0 && (
            <section className="mt-16">
              <h2 className="font-heading text-2xl font-bold text-white">
                Past giveaways
              </h2>
              <div className="mt-6 space-y-4">
                {past.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-card border border-subtle bg-surface p-5"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-base font-semibold text-white">
                        {g.title}
                      </h3>
                      <span className="text-xs text-text-muted">
                        Ended{" "}
                        {new Date(g.end_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      🎁 {g.prize_description}
                    </p>
                    {g.winner_name && (
                      <p className="mt-2 text-sm">
                        <span className="text-text-muted">Winner:</span>{" "}
                        <span className="font-medium text-accent">
                          {g.winner_name}
                        </span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <div className="mt-12 flex flex-wrap gap-3 text-sm">
        <a href="/products" className="text-accent hover:underline">Browse all finds →</a>
        <a href="/deals" className="text-accent hover:underline">View deals &amp; coupons →</a>
        <a href="/how-to-buy-reps" className="text-accent hover:underline">How to buy reps →</a>
      </div>
    </div>
  );
}
