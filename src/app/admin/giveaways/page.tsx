"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const ADMIN_PW_KEY = "murmreps_admin_pw";

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
  created_at: string;
}

interface Entry {
  id: string;
  email: string;
  discord_username: string | null;
  tiktok_username: string | null;
  instagram_username: string | null;
  created_at: string;
}

export default function AdminGiveaways() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedGiveaway, setSelectedGiveaway] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Create form state
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prizeDesc, setPrizeDesc] = useState("");
  const [prizeImage, setPrizeImage] = useState("");
  const [endDate, setEndDate] = useState("");
  const [requirements, setRequirements] = useState("Join Discord, Follow TikTok @murmreps, Follow Instagram @murmreps");

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_PW_KEY);
    if (saved) setAuthed(true);
  }, []);

  const getHeaders = useCallback(() => {
    const pw = sessionStorage.getItem(ADMIN_PW_KEY) || password;
    return { "Content-Type": "application/json", "x-admin-password": pw };
  }, [password]);

  const login = () => {
    sessionStorage.setItem(ADMIN_PW_KEY, password);
    setAuthed(true);
  };

  const fetchGiveaways = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/giveaway", { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      setGiveaways(data.giveaways || []);
    }
    setLoading(false);
  }, [getHeaders]);

  useEffect(() => {
    if (authed) fetchGiveaways();
  }, [authed, fetchGiveaways]);

  const fetchEntries = async (giveawayId: string) => {
    setSelectedGiveaway(giveawayId);
    const res = await fetch(`/api/giveaway?id=${giveawayId}&entries=true`, {
      headers: getHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries || []);
    }
  };

  const createGiveaway = async () => {
    const reqs = requirements
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean)
      .map((label) => {
        const type = label.toLowerCase().includes("discord")
          ? "discord"
          : label.toLowerCase().includes("tiktok")
            ? "tiktok"
            : label.toLowerCase().includes("instagram")
              ? "instagram"
              : "other";
        return { type, label };
      });

    const res = await fetch("/api/giveaway", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        action: "create",
        title,
        description: description || null,
        prize_description: prizeDesc,
        prize_image_url: prizeImage || null,
        end_date: new Date(endDate).toISOString(),
        entry_requirements: reqs,
      }),
    });
    if (res.ok) {
      setShowCreate(false);
      setTitle("");
      setDescription("");
      setPrizeDesc("");
      setPrizeImage("");
      setEndDate("");
      fetchGiveaways();
    }
  };

  const pickWinner = async (giveawayId: string) => {
    const res = await fetch("/api/giveaway", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ action: "pick_winner", giveaway_id: giveawayId }),
    });
    if (res.ok) {
      const data = await res.json();
      alert(`Winner: ${data.winner}`);
      fetchGiveaways();
    }
  };

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24">
        <h1 className="font-heading text-xl font-bold text-white">Admin Login</h1>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
          className="mt-4 w-full rounded-btn border border-subtle bg-void px-4 py-2.5 text-sm text-white outline-none focus:border-accent/50"
        />
        <button
          onClick={login}
          className="mt-3 w-full rounded-btn bg-accent py-2.5 text-sm font-semibold text-white"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">
            Giveaway Manager
          </h1>
          <Link href="/admin" className="text-sm text-text-muted hover:text-white transition-colors">
            ← Back to admin
          </Link>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-btn bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          {showCreate ? "Cancel" : "+ New Giveaway"}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mt-6 rounded-card border border-subtle bg-surface p-5 space-y-3">
          <input
            placeholder="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-btn border border-subtle bg-void px-4 py-2.5 text-sm text-white outline-none focus:border-accent/50"
          />
          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-btn border border-subtle bg-void px-4 py-2.5 text-sm text-white outline-none focus:border-accent/50"
          />
          <input
            placeholder="Prize description *"
            value={prizeDesc}
            onChange={(e) => setPrizeDesc(e.target.value)}
            className="w-full rounded-btn border border-subtle bg-void px-4 py-2.5 text-sm text-white outline-none focus:border-accent/50"
          />
          <input
            placeholder="Prize image URL"
            value={prizeImage}
            onChange={(e) => setPrizeImage(e.target.value)}
            className="w-full rounded-btn border border-subtle bg-void px-4 py-2.5 text-sm text-white outline-none focus:border-accent/50"
          />
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-btn border border-subtle bg-void px-4 py-2.5 text-sm text-white outline-none focus:border-accent/50"
          />
          <input
            placeholder="Requirements (comma-separated)"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="w-full rounded-btn border border-subtle bg-void px-4 py-2.5 text-sm text-white outline-none focus:border-accent/50"
          />
          <button
            onClick={createGiveaway}
            disabled={!title || !prizeDesc || !endDate}
            className="rounded-btn bg-accent px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            Create Giveaway
          </button>
        </div>
      )}

      {/* Giveaway list */}
      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {giveaways.map((g) => (
            <div
              key={g.id}
              className="rounded-card border border-subtle bg-surface p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading text-base font-semibold text-white">
                    {g.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    🎁 {g.prize_description}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Ends:{" "}
                    {new Date(g.end_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {g.winner_name && (
                    <p className="mt-1 text-sm text-accent font-medium">
                      Winner: {g.winner_name}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchEntries(g.id)}
                    className="rounded-btn border border-subtle px-3 py-1.5 text-xs font-medium text-white hover:border-accent"
                  >
                    View entries
                  </button>
                  {!g.winner_name && (
                    <button
                      onClick={() => pickWinner(g.id)}
                      className="rounded-btn bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                    >
                      Pick winner
                    </button>
                  )}
                </div>
              </div>

              {/* Entries panel */}
              {selectedGiveaway === g.id && entries.length > 0 && (
                <div className="mt-4 border-t border-subtle pt-4">
                  <p className="text-xs font-medium text-text-muted mb-2">
                    {entries.length} entries
                  </p>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex flex-wrap items-center gap-3 rounded-btn bg-void px-3 py-2 text-xs"
                      >
                        <span className="text-white font-medium">
                          {entry.email}
                        </span>
                        {entry.discord_username && (
                          <span className="text-[#5865F2]">
                            DC: {entry.discord_username}
                          </span>
                        )}
                        {entry.tiktok_username && (
                          <span className="text-text-secondary">
                            TT: {entry.tiktok_username}
                          </span>
                        )}
                        {entry.instagram_username && (
                          <span className="text-text-secondary">
                            IG: {entry.instagram_username}
                          </span>
                        )}
                        <span className="ml-auto text-text-muted">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {giveaways.length === 0 && (
            <p className="text-sm text-text-muted">
              No giveaways yet. Create one above.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
