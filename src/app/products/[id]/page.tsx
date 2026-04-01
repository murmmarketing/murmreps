"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import products from "@/data/products.json";
import { agents } from "@/lib/agents";
import { useWishlist } from "@/lib/useWishlist";
import { useProductStats } from "@/lib/useProductStats";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/track";
import { usePreferences } from "@/lib/usePreferences";

interface ProductVariant {
  name: string;
  image?: string;
  price?: number;
}

interface QCPhotoSet {
  set: string;
  images: string[];
}

interface Product {
  id: number | string;
  name: string;
  brand: string;
  category: string;
  price_cny: number | null;
  price_usd: number | null;
  price_eur: number | null;
  tier: string;
  source_link: string;
  image: string;
  qc_rating: number | null;
  quality: string | null;
  verified: boolean;
  images?: string[];
  variants?: ProductVariant[];
  qc_photos?: QCPhotoSet[];
  weight_g?: number | null;
  dimensions?: string | null;
  delivery_days?: number | null;
  views?: number;
  likes?: number;
  dislikes?: number;
  score?: number | null;
  collection?: string;
}

const tierColors: Record<string, string> = {
  budget: "bg-[#6B7280]/15 text-[#9CA3AF]",
  value: "bg-[#22C55E]/15 text-[#4ADE80]",
  quality: "bg-[#F97316]/15 text-[#FB923C]",
  premium: "bg-[#EAB308]/15 text-[#FACC15] shadow-[0_0_8px_rgba(234,179,8,0.3)]",
};

const qualityBadgeStyles: Record<string, string> = {
  best: "bg-[#1DB954]/15 text-[#1DB954]",
  good: "bg-[#F59E0B]/15 text-[#F59E0B]",
  budget: "bg-[#6C757D]/20 text-white",
};

function CostEstimate({ price, region, weight, onRegionChange, onWeightChange }: {
  price: number; region: string; weight: string;
  onRegionChange: (v: string) => void; onWeightChange: (v: string) => void;
}) {
  const fee = Math.round(price * 0.05);
  const rates: Record<string, [number, number]> = { europe: [80, 150], usa: [90, 160], uk: [70, 130], australia: [100, 180] };
  const weights: Record<string, number> = { light: 0.3, medium: 0.7, heavy: 1.2 };
  const r = rates[region] || rates.europe;
  const w = weights[weight] || 0.7;
  const shipLow = Math.round(r[0] * w);
  const shipHigh = Math.round(r[1] * w);
  const totalLow = Math.round((price + fee + shipLow) * 0.127);
  const totalHigh = Math.round((price + fee + shipHigh) * 0.127);
  return (
    <div className="mt-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4 space-y-3 text-sm">
      <div className="flex justify-between"><span className="text-text-muted">Product</span><span className="text-white">¥{price} (~€{Math.round(price * 0.127)})</span></div>
      <div className="flex justify-between"><span className="text-text-muted">Agent fee (~5%)</span><span className="text-white">¥{fee} (~€{Math.round(fee * 0.127)})</span></div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-text-muted shrink-0">Shipping</span>
        <div className="flex gap-2">
          <select value={region} onChange={(e) => onRegionChange(e.target.value)} className="rounded bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] px-2 py-1 text-xs text-white outline-none">
            <option value="europe">Europe</option><option value="usa">USA/Canada</option><option value="uk">UK</option><option value="australia">Australia</option>
          </select>
          <select value={weight} onChange={(e) => onWeightChange(e.target.value)} className="rounded bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] px-2 py-1 text-xs text-white outline-none">
            <option value="light">Light (&lt;300g)</option><option value="medium">Medium (300-800g)</option><option value="heavy">Heavy (800g+)</option>
          </select>
        </div>
      </div>
      <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 flex justify-between">
        <span className="text-white font-medium">Estimated total</span><span className="text-accent font-bold">€{totalLow}–{totalHigh}</span>
      </div>
      <p className="text-[11px] text-text-muted">Rough estimate. Actual cost depends on agent, shipping line, and weight.</p>
      <p className="text-[11px] text-accent">💡 Ship multiple items together to save on shipping!</p>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const staticProduct = (products as unknown as Product[]).find(
    (p) => String(p.id) === String(params.id)
  );
  const [product, setProduct] = useState<Product | undefined>(staticProduct);
  const wishlist = useWishlist();
  const productStats = useProductStats();
  const { formatPrice } = usePreferences();
  const [imgError, setImgError] = useState(false);

  // Fetch fresh product data from Supabase (for up-to-date likes/dislikes/views)
  useEffect(() => {
    if (!params.id) return;
    supabase
      .from("products")
      .select("*")
      .eq("id", Number(params.id))
      .single()
      .then(({ data }) => {
        if (data) setProduct(data as unknown as Product);
      });
  }, [params.id]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSetIndex, setLightboxSetIndex] = useState(0);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const viewIncrementedRef = useRef(false);
  const [costOpen, setCostOpen] = useState(false);
  const [costRegion, setCostRegion] = useState("europe");
  const [costWeight, setCostWeight] = useState("medium");
  const [howToBuyOpen, setHowToBuyOpen] = useState(false);
  const [miniFaqOpen, setMiniFaqOpen] = useState<number | null>(null);
  const [similarFinds, setSimilarFinds] = useState<Product[]>([]);
  const [moreBrand, setMoreBrand] = useState<Product[]>([]);

  // Fetch smart recommendations from Supabase
  useEffect(() => {
    if (!product) return;
    const priceCny = product.price_cny;
    const brand = product.brand;
    const category = product.category;
    const currentId = Number(product.id);
    const isGirls = product.collection === "girls";

    const minPrice = priceCny ? Math.round(priceCny * 0.5) : 0;
    const maxPrice = priceCny ? Math.round(priceCny * 1.5) : 999999;

    const orClauses = [
      `and(brand.eq.${brand},category.eq.${category})`,
      priceCny ? `and(category.eq.${category},price_cny.gte.${minPrice},price_cny.lte.${maxPrice})` : `category.eq.${category}`,
      brand !== "Various" ? `brand.eq.${brand}` : null,
    ].filter(Boolean).join(",");

    let similarQuery = supabase
      .from("products")
      .select("id, name, brand, price_cny, price_usd, price_eur, image, views, likes, score, category, collection, tier")
      .neq("id", currentId)
      .not("image", "is", null)
      .neq("image", "")
      .or(orClauses)
      .order("score", { ascending: false })
      .limit(20);

    if (isGirls) {
      similarQuery = similarQuery.in("collection", ["girls", "both"]);
    }

    const brandQuery = brand !== "Various"
      ? supabase
          .from("products")
          .select("id, name, brand, price_cny, price_usd, price_eur, image, views, likes, score, category, collection, tier")
          .eq("brand", brand)
          .neq("id", currentId)
          .not("image", "is", null)
          .neq("image", "")
          .order("score", { ascending: false })
          .limit(8)
      : null;

    Promise.all([similarQuery, brandQuery]).then(([similarRes, brandRes]) => {
      if (similarRes.data) {
        const scored = (similarRes.data as unknown as Product[]).map((p) => {
          let relevance = 0;
          if (p.brand === brand && p.category === category) relevance += 100;
          else if (p.category === category) relevance += 60;
          else if (p.brand === brand) relevance += 40;

          if (priceCny && p.price_cny) {
            const priceDiff = Math.abs(p.price_cny - priceCny) / priceCny;
            if (priceDiff < 0.2) relevance += 30;
            else if (priceDiff < 0.5) relevance += 15;
          }

          if (p.collection === product.collection) relevance += 10;
          if ((p.views ?? 0) > 100) relevance += 10;
          if ((p.score ?? 0) > 50) relevance += 5;

          return { ...p, _relevance: relevance };
        });
        scored.sort((a, b) => b._relevance - a._relevance);
        setSimilarFinds(scored.slice(0, 8));
      }

      if (brandRes?.data) {
        setMoreBrand(brandRes.data as unknown as Product[]);
      }
    });
  }, [product]);

  // Apply pink theme for girls collection products; defer until collection is known
  const collection = product?.collection;
  useEffect(() => {
    if (collection === "girls") {
      document.documentElement.setAttribute("data-theme", "pink");
    } else if (collection !== undefined) {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [collection]);

  // Increment view count on page load (once per mount, safe in StrictMode)
  useEffect(() => {
    if (viewIncrementedRef.current) return;
    if (!params.id) return;
    viewIncrementedRef.current = true;
    supabase.rpc('increment_views', { product_id: Number(params.id) }).then(() => {});
    trackEvent('product_view', { product_id: Number(params.id) });
  }, [params.id]);

  const qcPhotos: QCPhotoSet[] = product ? ((product as Product).qc_photos || []) : [];
  const currentLightboxSet = qcPhotos[lightboxSetIndex];
  const currentLightboxImages = currentLightboxSet?.images || [];

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setLightboxZoom(1);
  }, []);

  const lightboxPrev = useCallback(() => {
    if (!currentLightboxImages.length) return;
    setLightboxImageIndex((i) =>
      i === 0 ? currentLightboxImages.length - 1 : i - 1
    );
    setLightboxZoom(1);
  }, [currentLightboxImages.length]);

  const lightboxNext = useCallback(() => {
    if (!currentLightboxImages.length) return;
    setLightboxImageIndex((i) =>
      i >= currentLightboxImages.length - 1 ? 0 : i + 1
    );
    setLightboxZoom(1);
  }, [currentLightboxImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lightboxPrev();
      if (e.key === "ArrowRight") lightboxNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, lightboxPrev, lightboxNext, closeLightbox]);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-heading text-2xl font-bold text-white">
          Product not found
        </h1>
        <Link
          href="/products"
          className="mt-4 inline-block text-sm text-accent hover:text-accent/80"
        >
          &larr; Back to products
        </Link>
      </div>
    );
  }

  const pid = String(product.id);
  const saved = wishlist.has(pid);
  const stats = productStats.get(pid, product as { views?: number; likes?: number; dislikes?: number });
  const hasLink = !!product.source_link;

  // Build the list of all images for the gallery
  const allImages: string[] =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const showThumbnails = allImages.length > 1;
  const variants = product.variants || [];

  // Determine the currently displayed image
  const displayImage =
    selectedVariant !== null && variants[selectedVariant]?.image
      ? variants[selectedVariant].image!
      : allImages[selectedImageIndex] || "";

  const openLightbox = (setIdx: number, imgIdx = 0) => {
    setLightboxSetIndex(setIdx);
    setLightboxImageIndex(imgIdx);
    setLightboxZoom(1);
    setLightboxOpen(true);
  };

  const copyLink = () => {
    if (product.source_link) {
      navigator.clipboard.writeText(product.source_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-text-secondary">
        <Link href="/products" className="transition-colors hover:text-white">
          Products
        </Link>
        <span className="text-[#6C757D]">/</span>
        <Link href={`/products?category=${encodeURIComponent(product?.category ?? "")}`} className="transition-colors hover:text-white">
          {product?.category ?? ""}
        </Link>
        <span className="text-[#6C757D]">/</span>
        <span className="text-white">{product?.name ?? "Not found"}</span>
      </nav>

      {/* Two column layout */}
      <div className="mt-2 grid gap-8 lg:grid-cols-[55%_1fr]">
        {/* LEFT — Image */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-[#0a0a0a]">
            {displayImage && !imgError ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={displayImage}
                alt={product.name}
                width={600}
                height={600}
                decoding="async"
                className="h-full w-full object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-heading text-3xl font-bold text-text-muted/30">
                  {product.brand}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {showThumbnails && !imgError && (
            <div className="mt-3 flex flex-wrap gap-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedImageIndex(i);
                    setSelectedVariant(null);
                  }}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 bg-[#141414] ${
                    selectedVariant === null && selectedImageIndex === i
                      ? "border-[#FE4205]"
                      : "border-transparent hover:border-white/20"
                  } cursor-pointer transition-colors`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    width={64}
                    height={64}
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Single image thumbnail (backwards compatible) */}
          {!showThumbnails && displayImage && !imgError && (
            <div className="mt-3 flex gap-2">
              <div className="h-16 w-16 overflow-hidden rounded-lg border-2 border-accent bg-[#0a0a0a]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayImage}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Details */}
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">
            {product.name}
          </h1>

          {/* Price */}
          <div className="mt-4">
            {product.price_cny != null ? (
              <span className="font-heading text-3xl font-bold text-accent">
                {formatPrice(product)}
              </span>
            ) : (
              <div>
                <span className="font-heading text-2xl font-bold text-text-muted">
                  Multi
                </span>
                <p className="mt-1 text-xs text-text-muted">
                  This store has multiple items at different prices
                </p>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-pill bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              {product.brand}
            </span>
            <span
              className={`rounded-pill px-3 py-1 text-xs font-medium ${tierColors[product.tier]}`}
            >
              {product.tier}
            </span>
            {product.quality && qualityBadgeStyles[product.quality] && (
              <span
                className={`rounded-pill px-3 py-1 text-xs font-medium ${qualityBadgeStyles[product.quality]}`}
              >
                {product.quality}
              </span>
            )}
          </div>

          {/* Variant selector */}
          {variants.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">
                Style
              </h3>
              <div className="flex flex-wrap gap-2">
                {variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedVariant(
                        selectedVariant === i ? null : i
                      );
                    }}
                    className={`overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedVariant === i
                        ? "border-[#FE4205]"
                        : "border-transparent hover:border-white/20"
                    } ${v.image ? "h-12 w-12 bg-[#141414]" : "bg-[#141414] px-3 py-1.5"} cursor-pointer`}
                    title={v.name}
                  >
                    {v.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={v.image}
                        alt={v.name}
                        loading="lazy"
                        decoding="async"
                        width={48}
                        height={48}
                        className="h-full w-full rounded-md object-contain"
                      />
                    ) : (
                      <span className="text-xs text-white">{v.name}</span>
                    )}
                  </button>
                ))}
              </div>
              {selectedVariant !== null && variants[selectedVariant] && (
                <p className="mt-2 text-xs text-text-secondary">
                  {variants[selectedVariant].name}
                  {variants[selectedVariant].price != null && (
                    <span className="ml-2 text-accent">
                      {formatPrice({ price_cny: variants[selectedVariant].price! })}
                    </span>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Product info badges */}
          {((product as Product).delivery_days || (product as Product).weight_g || (product as Product).dimensions) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {(product as Product).delivery_days && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2 text-[13px] text-text-secondary">
                  <span>🚚</span> Delivery: ~{(product as Product).delivery_days} days
                </span>
              )}
              {(product as Product).weight_g && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2 text-[13px] text-text-secondary">
                  <span>📦</span> Weight: {(product as Product).weight_g}g
                </span>
              )}
              {(product as Product).dimensions && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-4 py-2 text-[13px] text-text-secondary">
                  <span>📐</span> {(product as Product).dimensions}
                </span>
              )}
            </div>
          )}

          {/* Cost Calculator */}
          {product.price_cny != null && product.price_cny > 0 && (
            <div className="mt-4">
              <button onClick={() => setCostOpen(!costOpen)} className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors">
                <span>💰</span>
                <span className="border-b border-dotted border-[#6B7280]">Estimate your total cost</span>
                <svg className={`h-3 w-3 transition-transform ${costOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </button>
              {costOpen && <CostEstimate price={product.price_cny!} region={costRegion} weight={costWeight} onRegionChange={setCostRegion} onWeightChange={setCostWeight} />}
            </div>
          )}

          {/* Divider */}
          <div className="my-6 border-t border-subtle" />

          {/* How to buy explainer */}
          <button onClick={() => setHowToBuyOpen(!howToBuyOpen)} className="mb-4 flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors">
            <span>{howToBuyOpen ? "▼" : "▶"}</span>
            <span>How do I buy this?</span>
          </button>
          {howToBuyOpen && (
            <div className="mb-5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4 text-sm space-y-2">
              <div className="flex gap-2"><span className="text-accent font-bold">1.</span><span className="text-[#d4d4d8]">Click any agent button below (we recommend <strong className="text-white">KakoBuy</strong>)</span></div>
              <div className="flex gap-2"><span className="text-accent font-bold">2.</span><span className="text-[#d4d4d8]">Create a free account on the agent&apos;s site</span></div>
              <div className="flex gap-2"><span className="text-accent font-bold">3.</span><span className="text-[#d4d4d8]">Add the item to your cart and pay</span></div>
              <div className="flex gap-2"><span className="text-accent font-bold">4.</span><span className="text-[#d4d4d8]">Your agent buys it from the Chinese seller (1-5 days)</span></div>
              <div className="flex gap-2"><span className="text-accent font-bold">5.</span><span className="text-[#d4d4d8]">You get QC photos to check quality</span></div>
              <div className="flex gap-2"><span className="text-accent font-bold">6.</span><span className="text-[#d4d4d8]">Once happy, ship it to your address (7-20 days)</span></div>
              <p className="pt-2 text-xs text-text-muted">💡 First time? <Link href="/guides/how-to-buy-reps-kakobuy" className="text-accent hover:underline">Read our step-by-step guide →</Link></p>
            </div>
          )}

          {/* Buy section */}
          <div data-buy-section>
            <p className="mb-3 text-sm font-medium text-text-secondary">
              {hasLink
                ? "Buy this item through an agent:"
                : "Sign up with an agent:"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agents.map((agent) => {
                const url = hasLink
                  ? agent.buildUrl(product.source_link)
                  : agent.referralUrl;
                const isKako = agent.name === "KakoBuy";
                return (
                  <a
                    key={agent.name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('agent_click', { product_id: Number(product.id), agent_name: agent.name })}
                    className={`relative flex items-center justify-center gap-2 rounded-btn border px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:border-accent hover:shadow-[0_0_20px_rgba(254,66,5,0.1)] ${isKako ? "border-accent/40 bg-accent/5" : "border-subtle bg-[#141414]"}`}
                  >
                    {agent.name}
                    {isKako && <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[9px] font-semibold text-accent">Recommended</span>}
                    <svg
                      className="h-3.5 w-3.5 text-text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </a>
                );
              })}
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <p className="text-sm text-text-muted">
                New to buying reps?{" "}
                <Link href="/guides/how-to-buy-reps-kakobuy" className="text-accent hover:underline">Read our beginner guide →</Link>
              </p>
              <p className="text-sm text-text-muted">
                Not sure which agent?{" "}
                <Link href="/guides/agent-comparison" className="text-accent hover:underline">Compare all 8 agents →</Link>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            {hasLink && (
              <Link
                href={`/qc?link=${encodeURIComponent(product.source_link)}`}
                className="inline-flex items-center gap-2 rounded-btn border border-subtle bg-surface px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:border-accent/30 hover:text-accent"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                  />
                </svg>
                QC Photos
              </Link>
            )}
            <button
              onClick={() => wishlist.toggle(pid)}
              className={`inline-flex items-center gap-2 rounded-btn border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                saved
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-subtle bg-surface text-white hover:border-accent/30 hover:text-accent"
              }`}
            >
              <svg
                className={`h-4 w-4 ${saved ? "fill-accent" : "fill-none"}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              {saved ? "Saved" : "Add to wishlist"}
            </button>
          </div>

          {/* Like / Dislike */}
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => productStats.vote(pid, "like")}
              className={`flex items-center gap-1.5 rounded-btn border px-4 py-2 text-sm transition-all duration-200 ${
                stats.userVote === "like"
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-subtle bg-surface text-text-secondary hover:border-accent/30 hover:text-accent"
              }`}
            >
              <span>👍</span>
              <span>{stats.likes}</span>
            </button>
            <button
              onClick={() => productStats.vote(pid, "dislike")}
              className={`flex items-center gap-1.5 rounded-btn border px-4 py-2 text-sm transition-all duration-200 ${
                stats.userVote === "dislike"
                  ? "border-danger/30 bg-danger/10 text-danger"
                  : "border-subtle bg-surface text-text-secondary hover:border-danger/30 hover:text-danger"
              }`}
            >
              <span>👎</span>
              <span>{stats.dislikes}</span>
            </button>
            <span className="flex items-center gap-1.5 text-sm text-text-muted">
              <span>👁</span>
              <span>{stats.views} views</span>
            </span>
          </div>

          {/* Mini FAQ */}
          <div className="mt-8 space-y-2">
            <h3 className="text-sm font-semibold text-text-secondary mb-2">Common Questions</h3>
            {[
              { q: "What is an agent?", a: "An agent buys products from Chinese sellers on your behalf and ships them to you. You need one because most Chinese sellers don't ship internationally." },
              { q: "How do I buy this?", a: "Click an agent button above (we recommend KakoBuy), create a free account, add to cart, and pay. The agent handles the rest — buying, QC photos, and shipping." },
              { q: "What if it's bad quality?", a: "Your agent takes QC (Quality Check) photos before shipping. If you're not happy, you can return the item for free and get a refund." },
            ].map((faq, i) => (
              <div key={i} className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#141414] overflow-hidden">
                <button onClick={() => setMiniFaqOpen(miniFaqOpen === i ? null : i)} className="flex w-full items-center justify-between p-3 text-left">
                  <span className="text-xs font-medium text-white">{faq.q}</span>
                  <svg className={`h-3 w-3 shrink-0 text-accent transition-transform ${miniFaqOpen === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </button>
                {miniFaqOpen === i && <p className="px-3 pb-3 text-xs text-text-muted leading-relaxed">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Similar Finds */}
      {similarFinds.length >= 3 && (
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-white">
              Similar Finds
            </h2>
            <Link
              href={`/products?category=${encodeURIComponent(product.category)}`}
              className="text-sm text-accent hover:text-accent/80 transition-colors"
            >
              View More →
            </Link>
          </div>
          <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
            {similarFinds.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="group w-60 shrink-0 snap-start rounded-card border border-[rgba(255,255,255,0.06)] bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 sm:w-auto"
              >
                <div className="relative h-[140px] overflow-hidden rounded-t-card bg-[#0a0a0a]">
                  {p.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      width={240}
                      height={140}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs font-medium text-text-muted">
                        {p.brand}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 font-heading text-sm font-semibold leading-tight text-white">
                    {p.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-heading text-base font-bold text-white">
                      {p.price_cny != null ? (
                        formatPrice(p)
                      ) : (
                        <span className="text-sm text-text-muted">Multi</span>
                      )}
                    </span>
                    <span
                      className={`ml-auto rounded-pill px-2 py-0.5 text-[10px] font-medium ${tierColors[p.tier]}`}
                    >
                      {p.tier}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* More from {brand} */}
      {moreBrand.length >= 3 && product.brand !== "Various" && (
        <section className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-white">
              More from {product.brand}
            </h2>
            <Link
              href={`/products?search=${encodeURIComponent(product.brand)}`}
              className="text-sm text-accent hover:text-accent/80 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
            {moreBrand.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="group w-60 shrink-0 snap-start rounded-card border border-[rgba(255,255,255,0.06)] bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 sm:w-auto"
              >
                <div className="relative h-[140px] overflow-hidden rounded-t-card bg-[#0a0a0a]">
                  {p.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      width={240}
                      height={140}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs font-medium text-text-muted">
                        {p.brand}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 font-heading text-sm font-semibold leading-tight text-white">
                    {p.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-heading text-base font-bold text-white">
                      {p.price_cny != null ? (
                        formatPrice(p)
                      ) : (
                        <span className="text-sm text-text-muted">Multi</span>
                      )}
                    </span>
                    <span
                      className={`ml-auto rounded-pill px-2 py-0.5 text-[10px] font-medium ${tierColors[p.tier]}`}
                    >
                      {p.tier}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* QC Photos Section */}
      <section className="mt-16">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-xl font-bold text-white">
            Quality Check
          </h2>
          {product.source_link && (
            <div className="flex items-center gap-2">
              <div className="flex-1 overflow-hidden rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0a0a0a] px-3 py-2">
                <span className="block truncate text-xs text-text-muted">
                  {product.source_link}
                </span>
              </div>
              <button
                onClick={copyLink}
                className="shrink-0 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#141414] px-3 py-2 text-xs text-text-secondary transition-colors hover:border-accent/30 hover:text-white"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <Link
                href={`/qc?link=${encodeURIComponent(product.source_link)}`}
                className="shrink-0 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                Check QC
              </Link>
            </div>
          )}
        </div>

        {qcPhotos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {qcPhotos.map((set, setIdx) => (
              <button
                key={setIdx}
                onClick={() => openLightbox(setIdx)}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-[#141414] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                {set.images[0] && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={set.images[0]}
                    alt={set.set}
                    loading="lazy"
                    decoding="async"
                    width={300}
                    height={300}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-sm font-semibold text-white">{set.set}</p>
                  <p className="text-xs text-text-muted">
                    {set.images.length} QC Photo{set.images.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] px-8 py-16 text-center">
            <svg
              className="mx-auto mb-4 h-12 w-12 text-text-muted/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
            <p className="text-sm font-medium text-text-secondary">
              No QC photos available yet.
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Be the first to GP this item!{" "}
              {hasLink && (
                <button
                  onClick={() => {
                    const el = document.querySelector('[data-buy-section]');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-accent hover:underline"
                >
                  Buy through an agent &rarr;
                </button>
              )}
            </p>
          </div>
        )}
      </section>

      {/* QC Lightbox Modal */}
      {lightboxOpen && currentLightboxImages.length > 0 && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            {lightboxImageIndex + 1} / {currentLightboxImages.length}
          </div>

          {/* Prev arrow */}
          {currentLightboxImages.length > 1 && (
            <button
              onClick={lightboxPrev}
              className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {/* Main image */}
          <div
            className="flex max-h-[80vh] max-w-[90vw] items-center justify-center overflow-auto"
            onWheel={(e) => {
              e.preventDefault();
              setLightboxZoom((z) => Math.max(0.5, Math.min(4, z + (e.deltaY > 0 ? -0.2 : 0.2))));
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentLightboxImages[lightboxImageIndex]}
              alt={`QC Photo ${lightboxImageIndex + 1}`}
              className="max-h-[80vh] max-w-[90vw] cursor-zoom-in rounded-lg object-contain transition-transform duration-200"
              style={{ transform: `scale(${lightboxZoom})` }}
              onClick={() => setLightboxZoom((z) => z === 1 ? 2 : 1)}
            />
          </div>

          {/* Next arrow */}
          {currentLightboxImages.length > 1 && (
            <button
              onClick={lightboxNext}
              className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}

          {/* Thumbnail strip */}
          {currentLightboxImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-xl bg-black/60 p-2 backdrop-blur-sm">
              {currentLightboxImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setLightboxImageIndex(i);
                    setLightboxZoom(1);
                  }}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    lightboxImageIndex === i
                      ? "border-[#FE4205]"
                      : "border-transparent hover:border-white/30"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={() => setLightboxZoom((z) => Math.max(0.5, z - 0.5))}
              className="rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
              </svg>
            </button>
            <button
              onClick={() => setLightboxZoom((z) => Math.min(4, z + 0.5))}
              className="rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
