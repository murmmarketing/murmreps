"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ProductRow from "./ProductRow";

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

export default function HomeSections() {
  const [brandRows, setBrandRows] = useState<BrandRow[]>([]);
  const [recentProducts, setRecentProducts] = useState<RowProduct[]>([]);
  const [forYouProducts, setForYouProducts] = useState<RowProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch all products for brand grouping
      const { data: all } = await supabase
        .from("products")
        .select("id,name,brand,price_cny,price_usd,price_eur,image,views,likes,category")
        .not("image", "eq", "")
        .not("image", "is", null)
        .order("views", { ascending: false });

      if (!all) {
        setLoading(false);
        return;
      }

      // Group by brand, count products per brand
      const brandMap = new Map<string, RowProduct[]>();
      for (const p of all) {
        const brand = p.brand || "Various";
        if (brand === "Various" || brand === "Unbranded") continue;
        if (!brandMap.has(brand)) brandMap.set(brand, []);
        brandMap.get(brand)!.push(p);
      }

      // Top 6 brands with 10+ products, sorted by product count
      const topBrands = Array.from(brandMap.entries())
        .filter(([, prods]) => prods.length >= 10)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 6)
        .map(([brand, prods]) => ({
          brand,
          products: prods.slice(0, 8), // top 8 by views (already sorted)
        }));

      setBrandRows(topBrands);

      // "For You" — random popular products
      const shuffled = [...all].sort(() => Math.random() - 0.5);
      setForYouProducts(shuffled.filter(p => p.price_cny != null).slice(0, 8));

      // "Recently Added"
      const { data: recent } = await supabase
        .from("products")
        .select("id,name,brand,price_cny,price_usd,price_eur,image,views,likes,category")
        .not("image", "eq", "")
        .not("image", "is", null)
        .order("created_at", { ascending: false })
        .limit(8);

      setRecentProducts(recent || []);
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) return <div className="py-16 text-center text-gray-500">Loading...</div>;

  return (
    <div className="flex flex-col gap-12">
      {/* For You */}
      <ProductRow title="For You" products={forYouProducts} viewMoreHref="/products" />

      {/* Recently Added */}
      <ProductRow title="Recently Added" products={recentProducts} viewMoreHref="/products" />

      {/* Brand rows */}
      {brandRows.map(({ brand, products }) => (
        <ProductRow
          key={brand}
          title={brand}
          products={products}
          viewMoreHref={`/products?q=${encodeURIComponent(brand)}`}
        />
      ))}
    </div>
  );
}
