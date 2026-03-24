"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price_cny: number | null;
  price_usd: number | null;
  price_eur: number | null;
  tier: string | null;
  quality: string | null;
  source_link: string;
  image: string;
  images: string[];
  variants: { name: string; image?: string }[];
  qc_photos: { set: string; images: string[] }[];
  verified: boolean;
  created_at: string;
}

const CATEGORIES = [
  "Sneakers", "Shoes", "Boots", "Slides & Sandals",
  "T-Shirts", "Shirts", "Hoodies", "Sweaters", "Crewnecks", "Jerseys",
  "Jackets", "Coats & Puffers", "Vests",
  "Pants", "Jeans", "Shorts", "Tracksuits",
  "Bags", "Wallets", "Belts", "Hats & Caps", "Scarves & Gloves", "Sunglasses", "Phone Cases", "Socks & Underwear",
  "Necklaces", "Bracelets", "Earrings", "Rings", "Watches",
  "Electronics", "Perfumes", "Home & Decor", "Keychains & Accessories",
];
const TIERS = ["budget", "mid", "premium"];
const QUALITIES = ["best", "good", "budget"];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [storedPassword, setStoredPassword] = useState("");

  // Dashboard state
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [sortCol, setSortCol] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkPreview, setBulkPreview] = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    brand: "Various",
    category: "Shoes",
    price_cny: "",
    tier: "",
    quality: "",
    source_link: "",
    image: "",
  });

  const searchTimeout = useRef<NodeJS.Timeout>();

  // Check session
  useEffect(() => {
    const saved = sessionStorage.getItem("admin-auth");
    if (saved) {
      setStoredPassword(saved);
      setAuthed(true);
    }
  }, []);

  const handleLogin = () => {
    if (!password) return;
    setStoredPassword(password);
    sessionStorage.setItem("admin-auth", password);
    setAuthed(true);
    setAuthError("");
  };

  const fetchProducts = useCallback(async () => {
    if (!storedPassword) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "50",
        sort: sortCol,
        order: sortOrder,
      });
      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);
      if (tierFilter) params.set("tier", tierFilter);

      const res = await fetch(`/api/admin/products?${params}`, {
        headers: { "x-admin-password": storedPassword },
      });
      if (res.status === 401) {
        setAuthed(false);
        sessionStorage.removeItem("admin-auth");
        setAuthError("Invalid password");
        return;
      }
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [storedPassword, page, sortCol, sortOrder, search, categoryFilter, tierFilter]);

  useEffect(() => {
    if (authed) fetchProducts();
  }, [authed, fetchProducts]);

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
    }, 300);
  };

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p.id)));
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} products?`)) return;
    for (const id of Array.from(selected)) {
      await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": storedPassword },
      });
    }
    setSelected(new Set());
    fetchProducts();
  };

  const saveProduct = async (isEdit: boolean) => {
    const body: Record<string, unknown> = {
      name: form.name,
      brand: form.brand || "Various",
      category: form.category,
      price_cny: form.price_cny ? parseFloat(form.price_cny) : null,
      price_usd: form.price_cny
        ? Math.round(parseFloat(form.price_cny) * 0.14 * 100) / 100
        : null,
      price_eur: form.price_cny
        ? Math.round(parseFloat(form.price_cny) * 0.13 * 100) / 100
        : null,
      tier:
        form.tier ||
        (form.price_cny
          ? parseFloat(form.price_cny) < 100
            ? "budget"
            : parseFloat(form.price_cny) < 300
              ? "mid"
              : "premium"
          : null),
      quality: form.quality || null,
      source_link: form.source_link,
      image: form.image,
    };

    const url = isEdit
      ? `/api/admin/products/${editProduct!.id}`
      : "/api/admin/products";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": storedPassword,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowAdd(false);
      setEditProduct(null);
      resetForm();
      fetchProducts();
    } else {
      const err = await res.json();
      alert(`Error: ${err.error}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    await fetch(`/api/admin/products/${deleteProduct.id}`, {
      method: "DELETE",
      headers: { "x-admin-password": storedPassword },
    });
    setDeleteProduct(null);
    fetchProducts();
  };

  const resetForm = () => {
    setForm({
      name: "",
      brand: "Various",
      category: "Shoes",
      price_cny: "",
      tier: "",
      quality: "",
      source_link: "",
      image: "",
    });
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      brand: p.brand,
      category: p.category,
      price_cny: p.price_cny?.toString() || "",
      tier: p.tier || "",
      quality: p.quality || "",
      source_link: p.source_link,
      image: p.image,
    });
    setEditProduct(p);
  };

  const parseBulk = () => {
    const lines = bulkText.trim().split("\n").filter(Boolean);
    if (!lines.length) return;

    // Try JSON first
    try {
      const parsed = JSON.parse(bulkText);
      if (Array.isArray(parsed)) {
        setBulkPreview(parsed);
        return;
      }
    } catch {
      // Not JSON, try CSV
    }

    // CSV: name, brand, category, price_cny, source_link
    const rows = lines.map((line) => {
      const cols = line.split(",").map((c) => c.trim());
      return {
        name: cols[0] || "",
        brand: cols[1] || "Various",
        category: cols[2] || "Shoes",
        price_cny: cols[3] || "",
        source_link: cols[4] || "",
      };
    });
    setBulkPreview(rows);
  };

  const importBulk = async () => {
    if (!bulkPreview.length) return;
    setImporting(true);
    const prods = bulkPreview.map((p) => ({
      name: p.name,
      brand: p.brand || "Various",
      category: p.category || "Shoes",
      price_cny: p.price_cny ? parseFloat(p.price_cny) : null,
      source_link: p.source_link || "",
    }));

    const res = await fetch("/api/admin/products/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": storedPassword,
      },
      body: JSON.stringify({ products: prods }),
    });

    const data = await res.json();
    setImporting(false);
    setShowBulk(false);
    setBulkText("");
    setBulkPreview([]);
    alert(`Imported ${data.imported} of ${data.total} products`);
    fetchProducts();
  };

  // =================== LOGIN SCREEN ===================
  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#141414] p-8">
          <h1 className="mb-2 font-heading text-2xl font-bold text-white">
            Admin Panel
          </h1>
          <p className="mb-6 text-sm text-[#9CA3AF]">
            Enter admin password to continue
          </p>
          {authError && (
            <p className="mb-4 text-sm text-red-400">{authError}</p>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Password"
            className="mb-4 w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-4 py-3 text-white placeholder:text-[#6B7280] focus:border-[#FE4205] focus:outline-none"
          />
          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-[#FE4205] py-3 font-semibold text-white transition-opacity hover:opacity-90"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // =================== DASHBOARD ===================
  const girlsCount = products.filter((p) =>
    ["Girls Collection"].includes(p.category) || p.category.toLowerCase().includes("girl")
  ).length;
  const premiumCount = products.filter((p) => p.tier === "premium").length;
  const startItem = (page - 1) * 50 + 1;
  const endItem = Math.min(page * 50, total);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.06)] bg-[#141414] px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold tracking-tight">MurmReps Admin</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetForm();
                setShowAdd(true);
              }}
              className="rounded-lg bg-[#FE4205] px-4 py-2 text-sm font-semibold text-white transition-all duration-150 ease-in-out hover:opacity-90"
            >
              + Add Product
            </button>
            <Link
              href="/admin/analytics"
              className="rounded-lg border border-[rgba(255,255,255,0.1)] px-4 py-2 text-sm text-[#9CA3AF] transition-all duration-150 ease-in-out hover:border-[rgba(255,255,255,0.2)] hover:text-white"
            >
              Analytics
            </Link>
            <button
              onClick={() => setShowBulk(true)}
              className="rounded-lg border border-[rgba(255,255,255,0.1)] px-4 py-2 text-sm text-[#9CA3AF] transition-all duration-150 ease-in-out hover:border-[rgba(255,255,255,0.2)] hover:text-white"
            >
              Bulk Import
            </button>
            <div className="mx-2 h-5 w-px bg-[rgba(255,255,255,0.08)]" />
            <button
              onClick={() => {
                sessionStorage.removeItem("admin-auth");
                setAuthed(false);
              }}
              className="text-sm text-[#6B7280] transition-colors duration-150 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5" style={{ borderLeft: "4px solid #FE4205" }}>
            <div className="text-2xl font-bold">{total}</div>
            <div className="mt-1 text-xs text-[#9CA3AF]">Total Products</div>
          </div>
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5" style={{ borderLeft: "4px solid #E8518D" }}>
            <div className="text-2xl font-bold">{girlsCount}</div>
            <div className="mt-1 text-xs text-[#9CA3AF]">Girls Collection</div>
          </div>
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5" style={{ borderLeft: "4px solid #F59E0B" }}>
            <div className="text-2xl font-bold">{premiumCount}</div>
            <div className="mt-1 text-xs text-[#9CA3AF]">Premium Tier</div>
          </div>
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5" style={{ borderLeft: "4px solid #60A5FA" }}>
            <div className="text-2xl font-bold">{CATEGORIES.length}</div>
            <div className="mt-1 text-xs text-[#9CA3AF]">Categories</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-[rgba(255,255,255,0.06)] px-6 pb-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={`Search ${total} products...`}
              className="h-10 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1A1A1A] pl-10 pr-4 text-sm text-white placeholder:text-[#6B7280] transition-colors duration-150 focus:border-[#FE4205] focus:outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1A1A1A] px-3 text-sm text-[#9CA3AF] transition-colors duration-150 focus:border-[#FE4205] focus:outline-none"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={tierFilter}
            onChange={(e) => {
              setTierFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1A1A1A] px-3 text-sm text-[#9CA3AF] transition-colors duration-150 focus:border-[#FE4205] focus:outline-none"
          >
            <option value="">All Tiers</option>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={`${sortCol}-${sortOrder}`}
            onChange={(e) => {
              const [col, order] = e.target.value.split("-");
              setSortCol(col);
              setSortOrder(order as "asc" | "desc");
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1A1A1A] px-3 text-sm text-[#9CA3AF] transition-colors duration-150 focus:border-[#FE4205] focus:outline-none"
          >
            <option value="id-asc">ID (Asc)</option>
            <option value="id-desc">ID (Desc)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price_cny-asc">Price (Low)</option>
            <option value="price_cny-desc">Price (High)</option>
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto px-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1A1A1A] text-left" style={{ fontSize: "11px", letterSpacing: "0.05em" }}>
              <th className="px-3 py-3 font-medium uppercase text-[#6C757D]">
                <input
                  type="checkbox"
                  checked={
                    products.length > 0 && selected.size === products.length
                  }
                  onChange={toggleSelectAll}
                  className="accent-[#FE4205]"
                />
              </th>
              {[
                { key: "id", label: "ID" },
                { key: "image", label: "" },
                { key: "name", label: "Name" },
                { key: "brand", label: "Brand" },
                { key: "category", label: "Category" },
                { key: "price_cny", label: "Price" },
                { key: "tier", label: "Tier" },
                { key: "created_at", label: "Created" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.key !== "image" && handleSort(col.key)}
                  className={`px-3 py-3 font-medium uppercase text-[#6C757D] ${col.key !== "image" ? "cursor-pointer transition-colors duration-150 hover:text-white" : ""}`}
                >
                  {col.label}
                  {sortCol === col.key && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
              ))}
              <th className="px-3 py-3 font-medium uppercase text-[#6C757D]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="px-3 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="h-8 w-8 animate-spin text-[#FE4205]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm text-[#6B7280]">Loading products...</span>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="h-12 w-12 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-sm text-[#6B7280]">No products found</span>
                    <span className="text-xs text-[#4B5563]">Try adjusting your search or filters</span>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-[rgba(255,255,255,0.04)] transition-colors duration-150 hover:bg-[#1A1A1A] ${i % 2 === 1 ? "bg-[#161616]" : "bg-[#141414]"}`}
                >
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="accent-[#FE4205]"
                    />
                  </td>
                  <td className="px-3 py-2.5 text-xs text-[#6C757D]">{p.id}</td>
                  <td className="px-3 py-2.5">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image}
                        alt=""
                        className="h-11 w-11 rounded-lg bg-[#0a0a0a] object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1a1a1a] text-[10px] text-[#6B7280]">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="max-w-[250px] truncate px-3 py-2.5 text-[14px] font-medium">
                    {p.name}
                  </td>
                  <td className="px-3 py-2.5 text-[13px] text-[#9CA3AF]">{p.brand}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[#1A1A1A] px-2.5 py-0.5 text-[12px]">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {p.price_cny != null ? (
                      <span className="font-semibold text-[#FE4205]">¥{p.price_cny}</span>
                    ) : (
                      <span className="text-[#6B7280]">--</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {p.tier && (
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                          p.tier === "premium"
                            ? "bg-[rgba(146,64,14,0.2)] text-[#F59E0B]"
                            : p.tier === "mid"
                              ? "bg-[rgba(30,58,95,0.2)] text-[#60A5FA]"
                              : "bg-[rgba(55,65,81,0.2)] text-[#9CA3AF]"
                        }`}
                      >
                        {p.tier}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-[#6C757D]">
                    {p.created_at
                      ? new Date(p.created_at).toLocaleDateString()
                      : "--"}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-md p-1.5 text-[#6B7280] transition-colors duration-150 hover:bg-[rgba(255,255,255,0.06)] hover:text-[#FE4205]"
                        title="Edit"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteProduct(p)}
                        className="rounded-md p-1.5 text-[#6B7280] transition-colors duration-150 hover:bg-[rgba(255,255,255,0.06)] hover:text-red-400"
                        title="Delete"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <a
                        href={`/products/${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-1.5 text-[#6B7280] transition-colors duration-150 hover:bg-[rgba(255,255,255,0.06)] hover:text-white"
                        title="View"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] px-6 py-4">
        <span className="text-sm text-[#6B7280]">
          Showing {total > 0 ? startItem : 0}-{endItem} of {total}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#141414] px-4 py-2 text-sm text-[#9CA3AF] transition-all duration-150 hover:border-[rgba(255,255,255,0.2)] hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#141414] px-4 py-2 text-sm text-[#9CA3AF] transition-all duration-150 hover:border-[rgba(255,255,255,0.2)] hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>

      {/* Bulk Actions Floating Bar */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between bg-[#1A1A1A] border-t border-[rgba(255,255,255,0.1)] px-6 py-3 shadow-lg animate-[slideUp_150ms_ease-out]">
          <span className="text-sm font-medium text-white">{selected.size} selected</span>
          <button
            onClick={bulkDelete}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-red-700"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* =================== ADD / EDIT MODAL =================== */}
      {(showAdd || editProduct) && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#141414] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">
                {editProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setEditProduct(null);
                  resetForm();
                }}
                className="text-[#6B7280] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#FE4205]">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-[#FE4205] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#FE4205]">
                    Brand
                  </label>
                  <input
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-[#FE4205] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#FE4205]">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-[#FE4205] focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#FE4205]">
                    Price ¥
                  </label>
                  <input
                    type="number"
                    value={form.price_cny}
                    onChange={(e) =>
                      setForm({ ...form, price_cny: e.target.value })
                    }
                    placeholder="e.g. 299"
                    className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-[#FE4205] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#FE4205]">
                    Tier
                  </label>
                  <select
                    value={form.tier}
                    onChange={(e) =>
                      setForm({ ...form, tier: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-[#FE4205] focus:outline-none"
                  >
                    <option value="">Auto</option>
                    {TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#FE4205]">
                    Quality
                  </label>
                  <select
                    value={form.quality}
                    onChange={(e) =>
                      setForm({ ...form, quality: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-[#FE4205] focus:outline-none"
                  >
                    <option value="">None</option>
                    {QUALITIES.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#FE4205]">
                  Source Link
                </label>
                <input
                  value={form.source_link}
                  onChange={(e) =>
                    setForm({ ...form, source_link: e.target.value })
                  }
                  placeholder="https://weidian.com/item.html?itemID=..."
                  className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-[#FE4205] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#FE4205]">
                  Image URL
                </label>
                <input
                  value={form.image}
                  onChange={(e) =>
                    setForm({ ...form, image: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-[#FE4205] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => saveProduct(!!editProduct)}
                className="flex-1 rounded-lg bg-[#FE4205] py-3 font-semibold text-white transition-opacity hover:opacity-90"
              >
                {editProduct ? "Save Changes" : "Add Product"}
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setEditProduct(null);
                  resetForm();
                }}
                className="rounded-lg border border-white/10 px-6 py-3 text-sm text-[#9CA3AF] hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== DELETE MODAL =================== */}
      {deleteProduct && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#141414] p-6">
            <h2 className="mb-2 font-heading text-lg font-bold text-white">
              Delete Product
            </h2>
            <p className="mb-1 text-sm text-[#9CA3AF]">
              Are you sure you want to delete:
            </p>
            <p className="mb-4 font-medium text-white">
              &ldquo;{deleteProduct.name}&rdquo;
            </p>
            <p className="mb-6 text-xs text-red-400">
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-red-600 py-3 font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteProduct(null)}
                className="rounded-lg border border-white/10 px-6 py-3 text-sm text-[#9CA3AF] hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== BULK IMPORT MODAL =================== */}
      {showBulk && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#141414] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">Bulk Import</h2>
              <button
                onClick={() => {
                  setShowBulk(false);
                  setBulkText("");
                  setBulkPreview([]);
                }}
                className="text-[#6B7280] hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="mb-3 text-xs text-[#9CA3AF]">
              Paste CSV (name, brand, category, price_cny, source_link) or
              JSON array
            </p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={8}
              className="mb-3 w-full rounded-lg border border-white/10 bg-[#0a0a0a] p-3 font-mono text-xs text-white focus:border-[#FE4205] focus:outline-none"
              placeholder={`Nike Dunk Low, Nike, Shoes, 299, https://weidian.com/...\nSupreme Hoodie, Supreme, Streetwear, 189, https://...`}
            />
            <button
              onClick={parseBulk}
              className="mb-4 rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2 text-sm text-[#9CA3AF] hover:text-white"
            >
              Parse & Preview
            </button>

            {bulkPreview.length > 0 && (
              <>
                <div className="mb-3 max-h-48 overflow-auto rounded-lg border border-white/6 bg-[#0a0a0a]">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/6 text-left text-[#6B7280]">
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Brand</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkPreview.slice(0, 10).map((p, i) => (
                        <tr key={i} className="border-b border-white/4">
                          <td className="px-3 py-2 text-white">{p.name}</td>
                          <td className="px-3 py-2 text-[#9CA3AF]">
                            {p.brand}
                          </td>
                          <td className="px-3 py-2">{p.category}</td>
                          <td className="px-3 py-2 text-[#FE4205]">
                            {p.price_cny ? `¥${p.price_cny}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bulkPreview.length > 10 && (
                    <p className="px-3 py-2 text-xs text-[#6B7280]">
                      ...and {bulkPreview.length - 10} more
                    </p>
                  )}
                </div>
                <button
                  onClick={importBulk}
                  disabled={importing}
                  className="w-full rounded-lg bg-[#FE4205] py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {importing
                    ? "Importing..."
                    : `Import ${bulkPreview.length} Products`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
