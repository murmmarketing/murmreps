"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProductRow from "./ProductRow";
import staticProducts from "@/data/products.json";

interface PopularProduct {
  id: number;
  name: string;
  brand: string;
  price_cny: number | null;
  price_usd: number | null;
  price_eur: number | null;
  image: string;
  views: number;
  likes: number;
}

export default function PopularFinds() {
  const [popular, setPopular] = useState<PopularProduct[]>([]);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, brand, price_cny, price_usd, price_eur, image, views, likes")
          .not("price_cny", "is", null)
          .not("image", "eq", "")
          .not("image", "is", null)
          .order("score", { ascending: false })
          .limit(8);

        if (error) throw error;

        if (data && data.length > 0) {
          setPopular(data as PopularProduct[]);
        } else {
          throw new Error("No data");
        }
      } catch {
        // Fallback to static JSON
        const withPrice = staticProducts.filter(
          (p) => p.price_cny != null && p.image != null && p.image !== ""
        );
        setPopular(
          withPrice.slice(0, 8).map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            price_cny: p.price_cny,
            price_usd: p.price_usd,
            price_eur: (p as unknown as { price_eur?: number | null }).price_eur ?? null,
            image: p.image,
            views: (p as unknown as { views?: number }).views ?? 0,
            likes: (p as unknown as { likes?: number }).likes ?? 0,
          }))
        );
      }
    }
    fetchTrending();
  }, []);

  if (popular.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <ProductRow
        title={"\uD83D\uDD25 Trending Now"}
        products={popular}
        viewMoreHref="/products"
      />
    </section>
  );
}
