"use client";

import { useState, useEffect, useCallback } from "react";
import { trackEvent } from "@/lib/track";

const STORAGE_KEY = "murmreps-wishlist";

function getStored(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
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
      window.dispatchEvent(new Event("wishlist-change"));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setIds([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
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
