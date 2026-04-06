"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { fetchForYou } from "@/lib/smartFetch";
import ProductRow from "./ProductRow";

const CARD_COLUMNS = "id,name,brand,price_cny,price_usd,price_eur,image,views,likes,category";

interface RowProduct {
  id: number;
  name: string;
  brand: string;
  price_cny: number | null;
  price_usd: number | null;
  price_eur: number | null;
  image: string;
  views: number;
  likes: number;
  category: string;
}

interface BrandRow {
  brand: string;
  products: RowProduct[];
}

// Top brands to feature — avoids needing to fetch all products to compute them
const TOP_BRANDS = ["Nike", "Louis Vuitton", "Gucci", "Balenciaga", "Dior", "Prada"];

export default function HomeSections() {
  const [brandRows, setBrandRows] = useState<BrandRow[]>([]);
  const [recentProducts, setRecentProducts] = useState<RowProduct[]>([]);
  const [forYouProducts, setForYouProducts] = useState<RowProduct[]>([]);
  const [girlsProducts, setGirlsProducts] = useState<RowProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandsVisible, setBrandsVisible] = useState(false);
  const brandsRef = useRef<HTMLDivElement>(null);

  // Fetch above-fold data: "For You" and "Recently Added" only
  useEffect(() => {
    async function fetchInitial() {
      const [forYouData, recentRes, girlsRes] = await Promise.all([
        // "For You" — smart fetch with weighted randomness and category diversity
        fetchForYou(8, "main"),
        // "Recently Added" — 8 newest
        supabase
          .from("products")
          .select(CARD_COLUMNS)
          .not("image", "eq", "")
          .not("image", "is", null)
          .order("created_at", { ascending: false })
          .limit(8),
        // "For Her" — 8 from girls/both collection
        supabase
          .from("products")
          .select(CARD_COLUMNS)
          .in("collection", ["girls", "both"])
          .not("image", "eq", "")
          .not("image", "is", null)
          .order("score", { ascending: false })
          .limit(8),
      ]);

      setForYouProducts(forYouData as RowProduct[]);
      setRecentProducts((recentRes.data as RowProduct[]) || []);
      setGirlsProducts((girlsRes.data as RowProduct[]) || []);
      setLoading(false);
    }

    fetchInitial();
  }, []);

  // Lazy-load brand rows when they scroll into view
  useEffect(() => {
    if (!brandsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBrandsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(brandsRef.current);
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    if (!brandsVisible) return;

    async function fetchBrands() {
      const results = await Promise.all(
        TOP_BRANDS.map((brand) =>
          supabase
            .from("products")
            .select(CARD_COLUMNS)
            .eq("brand", brand)
            .not("image", "eq", "")
            .not("image", "is", null)
            .order("score", { ascending: false })
            .limit(8)
        )
      );

      const rows: BrandRow[] = [];
      results.forEach((res, i) => {
        if (res.data && res.data.length >= 4) {
          rows.push({ brand: TOP_BRANDS[i], products: res.data as RowProduct[] });
        }
      });
      setBrandRows(rows);
    }

    fetchBrands();
  }, [brandsVisible]);

  if (loading) return <div className="py-16 text-center text-gray-500">Loading...</div>;

  return (
    <div className="flex flex-col gap-12">
      {/* For You */}
      <ProductRow title="For You" products={forYouProducts} viewMoreHref="/products" />

      {/* Recently Added */}
      <ProductRow title="Recently Added" products={recentProducts} viewMoreHref="/products" />

      {/* For Her */}
      {girlsProducts.length > 0 && (
        <ProductRow title="For Her" products={girlsProducts} viewMoreHref="/girls" />
      )}

      {/* Brand rows — lazy loaded */}
      <div ref={brandsRef}>
        {brandRows.map(({ brand, products }) => (
          <ProductRow
            key={brand}
            title={brand}
            products={products}
            viewMoreHref={`/products?q=${encodeURIComponent(brand)}`}
          />
        ))}
      </div>
    </div>
  );
}
