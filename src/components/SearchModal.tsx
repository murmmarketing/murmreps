"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import products from "@/data/products.json";
import { trackEvent } from "@/lib/track";
import { usePreferences } from "@/lib/usePreferences";

const quickActions = [
  {
    label: "Browse shoes",
    href: "/products?category=Shoes",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    label: "Convert a link",
    href: "/converter",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.44a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L5.25 9.503" />
      </svg>
    ),
  },
  {
    label: "Compare agents",
    href: "/agents",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    label: "Track parcel",
    href: "/tracking",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
];

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { formatPrice } = usePreferences();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Track searches with debounce
  const searchTrackTimeout = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!query.trim()) return;
    clearTimeout(searchTrackTimeout.current);
    searchTrackTimeout.current = setTimeout(() => {
      trackEvent('search', { metadata: { query: query.trim() } });
    }, 800);
    return () => clearTimeout(searchTrackTimeout.current);
  }, [query]);

  const results = query.trim()
    ? products
        .filter((p) => {
          const q = query.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q)
          );
        })
        .slice(0, 6)
    : [];

  const navigateTo = (href: string) => {
    close();
    router.push(href);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] animate-search-fade-in"
      onClick={close}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative w-full max-w-[560px] mx-4 rounded-[16px] border border-[rgba(255,255,255,0.1)] bg-surface shadow-2xl animate-search-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-subtle px-4 py-3">
          <svg
            className="h-5 w-5 shrink-0 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, tools..."
            className="flex-1 bg-transparent text-sm text-white placeholder-text-muted outline-none"
          />
          <kbd className="hidden shrink-0 rounded-[6px] border border-subtle bg-void px-1.5 py-0.5 text-[10px] font-medium text-text-muted sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Results or quick actions */}
        <div className="max-h-[360px] overflow-y-auto p-2">
          {query.trim() ? (
            results.length > 0 ? (
              results.map((product) => (
                <button
                  key={product.id}
                  onClick={() =>
                    navigateTo(`/products/${product.id}`)
                  }
                  className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-left transition-colors duration-150 hover:bg-accent/10"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-btn bg-void text-[10px] font-medium text-text-muted">
                    {product.brand.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {product.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {product.brand}{product.price_cny != null && <> &middot; {formatPrice(product)}</>}
                    </p>
                  </div>
                  <svg
                    className="h-4 w-4 shrink-0 text-text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              ))
            ) : (
              <div className="px-3 py-8 text-center text-sm text-text-muted">
                No results for &ldquo;{query}&rdquo;
              </div>
            )
          ) : (
            <>
              <p className="px-3 pb-1.5 pt-1 text-[11px] font-medium uppercase tracking-wider text-text-muted">
                Quick actions
              </p>
              {quickActions.map((action) => (
                <button
                  key={action.href}
                  onClick={() => navigateTo(action.href)}
                  className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-left transition-colors duration-150 hover:bg-accent/10"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-btn bg-void text-accent">
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-text-secondary">
                    {action.label}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
