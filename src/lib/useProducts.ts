"use client";

import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import staticProducts from "@/data/products.json";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price_cny: number | null;
  price_usd: number | null;
  price_eur: number | null;
  tier: string;
  quality: string;
  source_link: string;
  image: string;
  images?: string[];
  variants?: { name: string; image?: string }[];
  qc_photos?: { set: string; images: string[] }[];
  delivery_days?: number | null;
  weight_g?: number | null;
  dimensions?: string | null;
  verified: boolean;
  qc_rating: number | null;
}

// Fetch all products from Supabase, fallback to static JSON
export function useAllProducts() {
  const [products, setProducts] = useState<Product[]>(staticProducts as unknown as Product[]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"supabase" | "static">("static");

  useEffect(() => {
    async function fetchFromSupabase() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id,name,brand,category,price_cny,price_usd,price_eur,tier,quality,source_link,image,images,variants,qc_photos,delivery_days,weight_g,dimensions,verified,qc_rating")
          .not("image", "is", null)
          .neq("image", "")
          .order("score", { ascending: false });

        if (error || !data || data.length === 0) {
          throw new Error(error?.message || "No data");
        }

        setProducts(data as Product[]);
        setSource("supabase");
      } catch {
        // Fallback to static JSON — already set as default
        setSource("static");
      } finally {
        setLoading(false);
      }
    }

    fetchFromSupabase();
  }, []);

  return { products, loading, source };
}

// Fetch a single product by ID
export function useProduct(id: string | number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", Number(id))
          .single();

        if (error || !data) throw new Error(error?.message || "Not found");
        setProduct(data as Product);
      } catch {
        // Fallback to static JSON
        const found = staticProducts.find((p) => String(p.id) === String(id));
        setProduct((found as unknown as Product) || null);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  return { product, loading };
}

// Fetch popular products (with price)
export function usePopularProducts(limit = 8) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id,name,brand,category,price_cny,price_usd,price_eur,tier,quality,source_link,image,verified,qc_rating")
          .not("price_cny", "is", null)
          .not("image", "is", null)
          .neq("image", "")
          .order("score", { ascending: false })
          .limit(limit);

        if (error || !data || data.length === 0) throw new Error("fallback");
        setProducts(data as Product[]);
      } catch {
        const fallback = staticProducts
          .filter((p) => p.price_cny != null)
          .slice(0, limit) as unknown as Product[];
        setProducts(fallback);
      }
    }

    fetch();
  }, [limit]);

  return products;
}

// Search products
export function useProductSearch(query: string) {
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id,name,brand,price_cny,price_usd,image,category")
          .not("image", "is", null)
          .neq("image", "")
          .ilike("name", `%${query}%`)
          .limit(6);

        if (error || !data) throw new Error("fallback");
        setResults(data as unknown as Product[]);
      } catch {
        const q = query.toLowerCase();
        const fallback = staticProducts
          .filter((p) => p.name.toLowerCase().includes(q))
          .slice(0, 6) as unknown as Product[];
        setResults(fallback);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return results;
}
