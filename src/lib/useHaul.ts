"use client";
import { useState, useEffect, useCallback } from "react";

export interface HaulItem {
  id: number;
  name: string;
  brand: string;
  price_cny: number;
  image: string;
  category: string;
  quantity: number;
}

const STORAGE_KEY = "murmreps_haul";

const WEIGHT_MAP: Record<string, number> = {
  Shoes: 1.0, Boots: 1.2, "Slides & Sandals": 0.6,
  Jackets: 0.8, Hoodies: 0.6, Sweaters: 0.5,
  Pants: 0.5, Shorts: 0.25, Shirts: 0.3, Polos: 0.3,
  "Long Sleeves": 0.35, Jerseys: 0.3, "Tank Tops": 0.2, Tops: 0.3,
  Bags: 0.5, Wallets: 0.1, Belts: 0.15,
  "Hats & Caps": 0.1, "Scarves & Gloves": 0.15,
  Sunglasses: 0.1, Glasses: 0.1,
  Necklaces: 0.05, Bracelets: 0.05, Earrings: 0.03, Rings: 0.03, Watches: 0.15, Jewelry: 0.05,
  "Socks & Underwear": 0.1, "Phone Cases": 0.05,
};

export function estimateWeight(category: string): number {
  return WEIGHT_MAP[category] || 0.3;
}

export function useHaul() {
  const [items, setItems] = useState<HaulItem[]>([]);

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) setItems(JSON.parse(s)); } catch { /* */ }
  }, []);

  const save = useCallback((next: HaulItem[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const add = useCallback((product: Omit<HaulItem, "quantity">) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === product.id)) return prev;
      const next = [...prev, { ...product, quantity: 1 }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((id: number) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setQuantity = useCallback((id: number, qty: number) => {
    setItems((prev) => {
      const next = prev.map((i) => i.id === id ? { ...i, quantity: Math.max(1, Math.min(10, qty)) } : i);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const has = useCallback((id: number) => items.some((i) => i.id === id), [items]);
  const clear = useCallback(() => save([]), [save]);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return { items, add, remove, setQuantity, has, clear, count };
}
