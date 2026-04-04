"use client";

import { useState, useEffect, useCallback } from "react";
import { trackEvent } from "@/lib/track";

const STORAGE_KEY = "murmreps-wishlist";

function getCookieIds(): string[] {
  if (typeof document === "undefined") return [];
  const match = document.cookie.split(";").find((c) => c.trim().startsWith("murmreps_wl="));
  return match ? match.split("=")[1].split(",").filter(Boolean) : [];
}

function saveCookie(ids: string[]) {
  if (typeof document === "undefined") return;
  const trimmed = ids.slice(0, 50).join(",");
  document.cookie = `murmreps_wl=${trimmed};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
}

function getStored(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const fromLS = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
    const fromCookie = getCookieIds();
    // Merge and deduplicate
    const merged = Array.from(new Set([...fromLS, ...fromCookie]));
    // Re-save if cookie had extra items
    if (merged.length > fromLS.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch {
    return getCookieIds(); // Fallback to cookie if localStorage fails
  }
}

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(getStored());

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setIds(getStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const isAdding = !prev.includes(id);
      const next = isAdding
        ? [...prev, id]
        : prev.filter((i) => i !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      saveCookie(next);
      window.dispatchEvent(new Event("wishlist-change"));
      if (isAdding) {
        trackEvent('wishlist_add', { product_id: Number(id) });
      }
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.filter((i) => i !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      saveCookie(next);
      window.dispatchEvent(new Event("wishlist-change"));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setIds([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    saveCookie([]);
    window.dispatchEvent(new Event("wishlist-change"));
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, count: ids.length, toggle, remove, clear, has };
}

/** Lightweight count-only hook for the navbar */
export function useWishlistCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getStored().length);

    const update = () => setCount(getStored().length);
    window.addEventListener("wishlist-change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("wishlist-change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return count;
}
