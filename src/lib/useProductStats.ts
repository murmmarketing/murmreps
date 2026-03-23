"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const VOTED_KEY = "murmreps-voted";

type UserVote = "like" | "dislike" | null;

interface ProductStat {
  likes: number;
  dislikes: number;
  views: number;
  userVote: UserVote;
}

function getVotedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(VOTED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function persistVotedSet(set: Set<string>) {
  localStorage.setItem(VOTED_KEY, JSON.stringify(Array.from(set)));
}

/**
 * Hook that reads likes/dislikes/views from Supabase product data,
 * tracks user votes in localStorage, and calls Supabase RPCs for votes.
 */
export function useProductStats() {
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [optimistic, setOptimistic] = useState<Record<string, { likes: number; dislikes: number }>>({});

  useEffect(() => {
    setVoted(getVotedSet());
  }, []);

  const getUserVote = useCallback(
    (id: string): UserVote => {
      if (voted.has(`${id}-like`)) return "like";
      if (voted.has(`${id}-dislike`)) return "dislike";
      return null;
    },
    [voted]
  );

  const get = useCallback(
    (id: string, product?: { views?: number; likes?: number; dislikes?: number }): ProductStat => {
      const base = {
        views: product?.views ?? 0,
        likes: product?.likes ?? 0,
        dislikes: product?.dislikes ?? 0,
      };
      const opt = optimistic[id];
      return {
        views: base.views,
        likes: base.likes + (opt?.likes ?? 0),
        dislikes: base.dislikes + (opt?.dislikes ?? 0),
        userVote: getUserVote(id),
      };
    },
    [optimistic, getUserVote]
  );

  const vote = useCallback(
    async (id: string, type: "like" | "dislike") => {
      const currentVote = getUserVote(id);

      // If already voted this way, do nothing (no toggle to keep it simple with server counts)
      if (currentVote === type) return;

      // Update localStorage
      const newVoted = new Set(Array.from(voted));
      if (currentVote) {
        newVoted.delete(`${id}-${currentVote}`);
      }
      newVoted.add(`${id}-${type}`);
      setVoted(newVoted);
      persistVotedSet(newVoted);

      // Optimistic update
      setOptimistic((prev) => {
        const cur = prev[id] ?? { likes: 0, dislikes: 0 };
        return {
          ...prev,
          [id]: {
            likes: cur.likes + (type === "like" ? 1 : 0),
            dislikes: cur.dislikes + (type === "dislike" ? 1 : 0),
          },
        };
      });

      // Call Supabase RPC
      if (type === "like") {
        await supabase.rpc("increment_likes", { product_id: Number(id) });
      } else {
        await supabase.rpc("increment_dislikes", { product_id: Number(id) });
      }
    },
    [voted, getUserVote]
  );

  return { get, vote };
}
