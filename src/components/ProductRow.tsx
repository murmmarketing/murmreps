"use client";

import Link from "next/link";

interface Product {
  id: number;
  name: string;
  brand: string;
  price_cny: number | null;
  price_usd?: number | null;
  price_eur?: number | null;
  image: string;
  views: number;
  likes: number;
  category?: string;
}

interface ProductRowProps {
  title: string;
  products: Product[];
  viewMoreHref?: string;
}

export default function ProductRow({ title, products, viewMoreHref }: ProductRowProps) {
  if (products.length === 0) return null;

  return (
    <section>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-[22px] font-bold text-white">{title}</h2>
        {viewMoreHref && (
          <Link
            href={viewMoreHref}
            className="text-sm font-medium text-[#FE4205] transition-colors hover:text-[#FE4205]/80"
          >
            View More &rarr;
          </Link>
        )}
      </div>

      {/* Scrollable row */}
      <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {products.map((product) => (
          <Link
            key={String(product.id)}
            href={`/products/${product.id}`}
            className="group w-[220px] min-w-[220px] flex-shrink-0 snap-start overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(254,66,5,0.2)]"
          >
            {/* Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0a0a]">
              {product.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-xs font-medium text-white/20">{product.brand}</span>
                </div>
              )}

              {/* Pills: views + likes, stacked top-right */}
              <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
                {product.views > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-[rgba(0,0,0,0.6)] px-2 py-0.5 text-[10px] text-white">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {product.views}
                  </span>
                )}
                {product.likes > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-[rgba(0,0,0,0.6)] px-2 py-0.5 text-[10px] text-white">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    {product.likes}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="line-clamp-1 text-[14px] font-semibold text-white">
                {product.name}
              </h3>
              <p className="mt-1 text-[16px] font-bold text-white">
                {product.price_cny != null ? (
                  <>&yen;{product.price_cny}</>
                ) : (
                  <span className="text-gray-500">Multi</span>
                )}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
