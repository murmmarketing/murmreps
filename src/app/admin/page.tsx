"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

const CATEGORIES = ["Shoes", "Streetwear", "Bags & Acc", "Jewelry"];
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
  }, [storedPassword, page, sortCol, sortOrder, search, categoryFilter]);

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

  // Category stats
  const catCounts = products.reduce(
    (acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

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
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top bar */}
      <div className="border-b border-white/6 bg-[#141414] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-heading text-xl font-bold">MurmReps Admin</h1>
            <span className="rounded-full bg-[#FE4205]/10 px-3 py-1 text-xs text-[#FE4205]">
              {total} products
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetForm();
                setShowAdd(true);
              }}
              className="rounded-lg bg-[#FE4205] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              + Add Product
            </button>
            <button
              onClick={() => setShowBulk(true)}
              className="rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-2 text-sm text-[#9CA3AF] transition-colors hover:text-white"
            >
              Bulk Import
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem("admin-auth");
                setAuthed(false);
              }}
              className="text-sm text-[#6B7280] hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-white/6 px-6 py-4">
        <div className="flex gap-6">
          <div className="rounded-lg border border-white/6 bg-[#141414] px-5 py-3">
            <div className="text-xs text-[#6B7280]">Total</div>
            <div className="text-lg font-bold">{total}</div>
          </div>
          {CATEGORIES.map((cat) => (
            <div
              key={cat}
              className="rounded-lg border border-white/6 bg-[#141414] px-5 py-3"
            >
              <div className="text-xs text-[#6B7280]">{cat}</div>
              <div className="text-lg font-bold">{catCounts[cat] || 0}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-4 border-b border-white/6 px-6 py-4">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 rounded-lg border border-white/10 bg-[#141414] px-4 py-2 text-sm text-white placeholder:text-[#6B7280] focus:border-[#FE4205] focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCategoryFilter("");
              setPage(1);
            }}
            className={`rounded-lg px-3 py-2 text-sm ${!categoryFilter ? "bg-[#FE4205] text-white" : "bg-[#1a1a1a] text-[#9CA3AF] hover:text-white"}`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategoryFilter(cat);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-2 text-sm ${categoryFilter === cat ? "bg-[#FE4205] text-white" : "bg-[#1a1a1a] text-[#9CA3AF] hover:text-white"}`}
            >
              {cat}
            </button>
          ))}
        </div>
        {selected.size > 0 && (
          <button
            onClick={bulkDelete}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete {selected.size}
          </button>
        )}
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto px-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6 text-left text-xs uppercase text-[#6B7280]">
              <th className="px-3 py-3">
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
                { key: "price_cny", label: "Price ¥" },
                { key: "tier", label: "Tier" },
                { key: "created_at", label: "Created" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.key !== "image" && handleSort(col.key)}
                  className={`px-3 py-3 ${col.key !== "image" ? "cursor-pointer hover:text-white" : ""}`}
                >
                  {col.label}
                  {sortCol === col.key && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
              ))}
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="px-3 py-12 text-center text-[#6B7280]">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-12 text-center text-[#6B7280]">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-white/4 transition-colors hover:bg-white/[0.02] ${i % 2 === 1 ? "bg-white/[0.01]" : ""}`}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="accent-[#FE4205]"
                    />
                  </td>
                  <td className="px-3 py-2 text-[#6B7280]">{p.id}</td>
                  <td className="px-3 py-2">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image}
                        alt=""
                        className="h-10 w-10 rounded-lg bg-[#0a0a0a] object-contain"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a1a1a] text-[10px] text-[#6B7280]">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="max-w-[200px] truncate px-3 py-2 font-medium">
                    {p.name}
                  </td>
                  <td className="px-3 py-2 text-[#9CA3AF]">{p.brand}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-md bg-[#1a1a1a] px-2 py-1 text-xs">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {p.price_cny != null ? (
                      <span className="text-[#FE4205]">¥{p.price_cny}</span>
                    ) : (
                      <span className="text-[#6B7280]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {p.tier && (
                      <span
                        className={`rounded-md px-2 py-1 text-xs ${
                          p.tier === "premium"
                            ? "bg-green-900/30 text-green-400"
                            : p.tier === "mid"
                              ? "bg-amber-900/30 text-amber-400"
                              : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {p.tier}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-[#6B7280]">
                    {p.created_at
                      ? new Date(p.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-md bg-[#1a1a1a] px-2 py-1 text-xs text-[#9CA3AF] hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteProduct(p)}
                        className="rounded-md bg-[#1a1a1a] px-2 py-1 text-xs text-red-400 hover:text-red-300"
                      >
                        Del
                      </button>
                      <a
                        href={`/products/${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md bg-[#1a1a1a] px-2 py-1 text-xs text-[#6B7280] hover:text-white"
                      >
                        ↗
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
      <div className="flex items-center justify-between border-t border-white/6 px-6 py-4">
        <span className="text-sm text-[#6B7280]">
          Page {page} of {totalPages} ({total} products)
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-white/10 bg-[#141414] px-4 py-2 text-sm text-[#9CA3AF] disabled:opacity-30"
          >
            ← Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-white/10 bg-[#141414] px-4 py-2 text-sm text-[#9CA3AF] disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      </div>

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
