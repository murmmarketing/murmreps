"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "murmreps-product-stats";
const SYNC_EVENT = "product-stats-change";

type UserVote = "like" | "dislike" | null;

interface ProductStat {
  likes: number;
  dislikes: number;
  views: number;
  userVote: UserVote;
}

type StatsMap = Record<string, ProductStat>;

function getStored(): StatsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getOrDefault(stats: StatsMap, id: string): ProductStat {
  return stats[id] ?? { likes: 0, dislikes: 0, views: 0, userVote: null };
}

function persist(stats: StatsMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  window.dispatchEvent(new Event(SYNC_EVENT));
}

export function useProductStats() {
  const [stats, setStats] = useState<StatsMap>({});

  useEffect(() => {
    setStats(getStored());

    const sync = () => setStats(getStored());
    window.addEventListener(SYNC_EVENT, sync);
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) sync();
    });
    return () => {
      window.removeEventListener(SYNC_EVENT, sync);
    };
  }, []);

  const vote = useCallback((id: string, type: "like" | "dislike") => {
    setStats((prev) => {
      const next = { ...prev };
      const stat = { ...getOrDefault(next, id) };

      if (stat.userVote === type) {
        // Toggle off
        if (type === "like") stat.likes = Math.max(0, stat.likes - 1);
        else stat.dislikes = Math.max(0, stat.dislikes - 1);
        stat.userVote = null;
      } else {
        // Remove opposite vote if exists
        if (stat.userVote === "like") stat.likes = Math.max(0, stat.likes - 1);
        if (stat.userVote === "dislike") stat.dislikes = Math.max(0, stat.dislikes - 1);
        // Add new vote
        if (type === "like") stat.likes += 1;
        else stat.dislikes += 1;
        stat.userVote = type;
      }

      next[id] = stat;
      persist(next);
      return next;
    });
  }, []);

  const addView = useCallback((id: string) => {
    setStats((prev) => {
      const next = { ...prev };
      const stat = { ...getOrDefault(next, id) };
      stat.views += 1;
      next[id] = stat;
      persist(next);
      return next;
    });
  }, []);

  const get = useCallback(
    (id: string): ProductStat => getOrDefault(stats, id),
    [stats]
  );

  return { get, vote, addView };
}
