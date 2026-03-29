"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ProductRow from "./ProductRow";
import { girlsItemIds } from "@/data/girls-ids";

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
  source_link?: string;
}

interface BrandRow {
  brand: string;
  products: RowProduct[];
}

export default function HomeSections() {
  const [brandRows, setBrandRows] = useState<BrandRow[]>([]);
  const [recentProducts, setRecentProducts] = useState<RowProduct[]>([]);
  const [forYouProducts, setForYouProducts] = useState<RowProduct[]>([]);
  const [girlsProducts, setGirlsProducts] = useState<RowProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch all products (paginate past Supabase 1000-row limit)
      const all: RowProduct[] = [];
      let offset = 0;
      while (true) {
        const { data } = await supabase
          .from("products")
          .select("id,name,brand,price_cny,price_usd,price_eur,image,views,likes,category,source_link")
          .not("image", "eq", "")
          .not("image", "is", null)
          .order("views", { ascending: false })
          .range(offset, offset + 999);
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < 1000) break;
        offset += 1000;
      }

      if (all.length === 0) {
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

      // "For You" — featured products first, then random popular
      const withPrice = all.filter(p => p.price_cny != null);
      const { data: featuredData } = await supabase
        .from("products")
        .select("id,name,brand,price_cny,price_usd,price_eur,image,views,likes,category,source_link")
        .eq("featured", true)
        .eq("collection", "main")
        .not("image", "eq", "")
        .not("image", "is", null)
        .order("featured_rank", { ascending: true })
        .limit(16);
      const featured = (featuredData || []).sort(() => Math.random() - 0.5).slice(0, 5);
      const featuredIds = new Set(featured.map(p => p.id));
      const rest = withPrice.filter(p => !featuredIds.has(p.id)).sort(() => Math.random() - 0.5).slice(0, 3);
      setForYouProducts([...featured, ...rest]);

      // "For Her" — girls products
      const girls = all.filter((p) => {
        if (!p.image) return false;
        const src = p.source_link || "";
        const m = src.match(/itemID=(\d+)/i) || src.match(/[?&]id=(\d+)/);
        return m && girlsItemIds.has(m[1]);
      });
      setGirlsProducts(girls.slice(0, 8));

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

      {/* For Her */}
      {girlsProducts.length > 0 && (
        <ProductRow title="For Her ✨" products={girlsProducts} viewMoreHref="/girls" />
      )}

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
