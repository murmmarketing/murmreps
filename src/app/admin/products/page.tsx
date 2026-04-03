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
  views: number;
  likes: number;
  dislikes: number;
  collection: string;
  created_at: string;
  score: number | null;
  score_breakdown: Record<string, number> | null;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

interface ImportLogEntry {
  date: string;
  count: number;
  source: string;
  notes: string;
}

interface BrokenImage {
  id: number;
  name: string;
  image: string;
}

const CATEGORIES = [
  "Sneakers", "Shoes", "Boots", "Slides & Sandals",
  "T-Shirts", "Shirts", "Hoodies", "Sweaters", "Crewnecks", "Jerseys",
  "Jackets", "Coats & Puffers", "Vests",
  "Pants", "Jeans", "Shorts", "Tracksuits",
  "Bags", "Wallets", "Belts", "Hats & Caps", "Scarves & Gloves", "Sunglasses", "Phone Cases", "Socks & Underwear",
  "Necklaces", "Bracelets", "Earrings", "Rings", "Watches",
  "Electronics", "Perfumes", "Home & Decor", "Keychains & Accessories", "Trading Cards",
];
const TIERS = ["budget", "value", "quality", "premium"];
const QUALITIES = ["best", "good", "budget"];
const COLLECTIONS = ["main", "girls"];

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
  const [sortCol, setSortCol] = useState("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
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

  // Toast system
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Tab state: "products" | "analytics"
  const [activeTab, setActiveTab] = useState<"products" | "analytics">("products");

  // Analytics state
  const [analyticsProducts, setAnalyticsProducts] = useState<Product[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsSortBy, setAnalyticsSortBy] = useState<"views" | "likes" | "likerate" | "newest">("views");

  // Broken image scanner
  const [showImageScanner, setShowImageScanner] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanTotal, setScanTotal] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [brokenImages, setBrokenImages] = useState<BrokenImage[]>([]);

  // Duplicate detector
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<Product[][]>([]);
  const [duplicatesLoading, setDuplicatesLoading] = useState(false);

  // Bulk delete confirmation
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Recalculate tiers
  const [showRecalcTiers, setShowRecalcTiers] = useState(false);
  const [recalcLoading, setRecalcLoading] = useState(false);

  // Import history log
  const [showImportLog, setShowImportLog] = useState(false);
  const [importLog, setImportLog] = useState<ImportLogEntry[]>([]);
  const [importLogForm, setImportLogForm] = useState({ count: "", source: "", notes: "" });

  // Quick image swap
  const [imageSwapProduct, setImageSwapProduct] = useState<Product | null>(null);
  const [imageSwapUrl, setImageSwapUrl] = useState("");
  const imageSwapRef = useRef<HTMLDivElement>(null);

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

  // === Toast helpers ===
  const addToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Check session
  useEffect(() => {
    const saved = sessionStorage.getItem("admin-auth");
    if (saved) {
      setStoredPassword(saved);
      setAuthed(true);
    }
  }, []);

  // Load import log from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("murmreps-import-log");
      if (stored) setImportLog(JSON.parse(stored));
    } catch { /* ignore */ }
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
        limit: "100",
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

  // Fetch all products helper (for exports, analytics, scanning etc)
  const fetchAllFiltered = useCallback(async (): Promise<Product[]> => {
    const params = new URLSearchParams({ limit: "50000" });
    if (search) params.set("search", search);
    if (categoryFilter) params.set("category", categoryFilter);
    if (tierFilter) params.set("tier", tierFilter);
    const res = await fetch(`/api/admin/products?${params}`, {
      headers: { "x-admin-password": storedPassword },
    });
    const data = await res.json();
    return data.products || [];
  }, [storedPassword, search, categoryFilter, tierFilter]);

  const fetchAllProducts = useCallback(async (): Promise<Product[]> => {
    const params = new URLSearchParams({ limit: "50000" });
    const res = await fetch(`/api/admin/products?${params}`, {
      headers: { "x-admin-password": storedPassword },
    });
    const data = await res.json();
    return data.products || [];
  }, [storedPassword]);

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

  // === Feature 4: Enhanced Bulk Delete ===
  const bulkDelete = async () => {
    const ids = Array.from(selected);
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": storedPassword,
        },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        addToast(`Deleted ${ids.length} products`, "success");
      } else {
        addToast("Failed to delete products", "error");
      }
    } catch {
      addToast("Failed to delete products", "error");
    }
    setSelected(new Set());
    setShowBulkDeleteConfirm(false);
    fetchProducts();
  };

  // === Feature 1: Bulk Category Reassign ===
  const bulkChangeCategory = async (newCategory: string) => {
    if (!newCategory) return;
    const ids = Array.from(selected);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": storedPassword,
        },
        body: JSON.stringify({ ids, updates: { category: newCategory } }),
      });
      if (res.ok) {
        addToast(`Updated ${ids.length} products to ${newCategory}`, "success");
      } else {
        addToast("Failed to update category", "error");
      }
    } catch {
      addToast("Failed to update category", "error");
    }
    setSelected(new Set());
    fetchProducts();
  };

  // === Feature 2: Bulk Collection Swap ===
  const bulkChangeCollection = async (newCollection: string) => {
    if (!newCollection) return;
    const ids = Array.from(selected);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": storedPassword,
        },
        body: JSON.stringify({ ids, updates: { collection: newCollection } }),
      });
      if (res.ok) {
        addToast(`Moved ${ids.length} products to ${newCollection}`, "success");
      } else {
        addToast("Failed to move products", "error");
      }
    } catch {
      addToast("Failed to move products", "error");
    }
    setSelected(new Set());
    fetchProducts();
  };

  // === Feature 3: Export CSV ===
  const exportCSV = async () => {
    try {
      const allProducts = await fetchAllFiltered();
      const headers = ["id", "name", "brand", "category", "price_cny", "tier", "quality", "source_link", "image", "collection", "views", "likes", "created_at"];
      const escapeCSV = (val: string | number | null | undefined) => {
        const str = String(val ?? "");
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      const csvRows = [
        headers.join(","),
        ...allProducts.map((p) =>
          headers.map((h) => escapeCSV((p as unknown as Record<string, unknown>)[h] as string | number | null)).join(",")
        ),
      ];
      const csv = csvRows.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().split("T")[0];
      a.href = url;
      a.download = `murmreps_products_${today}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      addToast(`Exported ${allProducts.length} products to CSV`, "success");
    } catch {
      addToast("Failed to export CSV", "error");
    }
  };

  // === Feature 5: Broken Image Scanner ===
  const scanImages = async () => {
    setScanning(true);
    setBrokenImages([]);
    setScanProgress(0);
    try {
      const allProducts = await fetchAllFiltered();
      const withImages = allProducts.filter((p) => p.image);
      setScanTotal(withImages.length);

      const broken: BrokenImage[] = [];
      const batchSize = 50;
      for (let i = 0; i < withImages.length; i += batchSize) {
        const batch = withImages.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map(
            (p) =>
              new Promise<void>((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => reject();
                img.src = p.image;
                setTimeout(() => reject(), 8000);
              })
          )
        );
        results.forEach((result, idx) => {
          if (result.status === "rejected") {
            broken.push({ id: batch[idx].id, name: batch[idx].name, image: batch[idx].image });
          }
        });
        setScanProgress(Math.min(i + batchSize, withImages.length));
        setBrokenImages([...broken]);
      }
      setScanProgress(withImages.length);
    } catch {
      addToast("Image scan failed", "error");
    }
    setScanning(false);
  };

  // === Feature 6: Duplicate Detector ===
  const findDuplicates = async () => {
    setDuplicatesLoading(true);
    setDuplicateGroups([]);
    try {
      const allProducts = await fetchAllProducts();
      const byLink: Record<string, Product[]> = {};
      for (const p of allProducts) {
        if (p.source_link) {
          const key = p.source_link.trim();
          if (!byLink[key]) byLink[key] = [];
          byLink[key].push(p);
        }
      }
      const groups = Object.values(byLink).filter((g) => g.length > 1);
      setDuplicateGroups(groups);
    } catch {
      addToast("Failed to find duplicates", "error");
    }
    setDuplicatesLoading(false);
  };

  const keepFirstDeleteRest = async (group: Product[]) => {
    const idsToDelete = group.slice(1).map((p) => p.id);
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": storedPassword,
        },
        body: JSON.stringify({ ids: idsToDelete }),
      });
      if (res.ok) {
        addToast(`Deleted ${idsToDelete.length} duplicates, kept #${group[0].id}`, "success");
        setDuplicateGroups((prev) => prev.filter((g) => g[0].id !== group[0].id));
        fetchProducts();
      } else {
        addToast("Failed to delete duplicates", "error");
      }
    } catch {
      addToast("Failed to delete duplicates", "error");
    }
  };

  // === Feature 7: Analytics ===
  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const all = await fetchAllProducts();
      setAnalyticsProducts(all);
    } catch {
      addToast("Failed to load analytics", "error");
    }
    setAnalyticsLoading(false);
  };

  useEffect(() => {
    if (activeTab === "analytics" && authed && analyticsProducts.length === 0) {
      loadAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, authed]);

  // === Feature 8: Recalculate Tiers ===
  const recalculateTiers = async () => {
    setRecalcLoading(true);
    try {
      const allProducts = await fetchAllProducts();
      const wrongTier: { id: number; correctTier: string }[] = [];
      for (const p of allProducts) {
        if (p.price_cny == null) continue;
        const correctTier = p.price_cny < 150 ? "budget" : p.price_cny < 400 ? "value" : p.price_cny < 800 ? "quality" : "premium";
        if (p.tier !== correctTier) {
          wrongTier.push({ id: p.id, correctTier });
        }
      }
      if (wrongTier.length === 0) {
        addToast("All tiers are already correct", "success");
        setShowRecalcTiers(false);
        setRecalcLoading(false);
        return;
      }

      // Group by correct tier and batch update
      const byTier: Record<string, number[]> = {};
      for (const item of wrongTier) {
        if (!byTier[item.correctTier]) byTier[item.correctTier] = [];
        byTier[item.correctTier].push(item.id);
      }

      for (const [tier, ids] of Object.entries(byTier)) {
        await fetch("/api/admin/products", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": storedPassword,
          },
          body: JSON.stringify({ ids, updates: { tier } }),
        });
      }

      addToast(`Recalculated tiers for ${wrongTier.length} products`, "success");
      fetchProducts();
    } catch {
      addToast("Failed to recalculate tiers", "error");
    }
    setRecalcLoading(false);
    setShowRecalcTiers(false);
  };

  // === Feature 9: Import History Log ===
  const saveImportLogEntry = () => {
    const entry: ImportLogEntry = {
      date: new Date().toISOString(),
      count: parseInt(importLogForm.count) || 0,
      source: importLogForm.source,
      notes: importLogForm.notes,
    };
    const updated = [entry, ...importLog];
    setImportLog(updated);
    localStorage.setItem("murmreps-import-log", JSON.stringify(updated));
    setImportLogForm({ count: "", source: "", notes: "" });
    addToast("Import log entry saved", "success");
  };

  // === Feature 10: Quick Image Swap ===
  const quickImageSwap = async (productId: number, newUrl: string) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": storedPassword,
        },
        body: JSON.stringify({ ids: [productId], updates: { image: newUrl } }),
      });
      if (res.ok) {
        addToast("Image updated", "success");
        setImageSwapProduct(null);
        setImageSwapUrl("");
        fetchProducts();
      } else {
        addToast("Failed to update image", "error");
      }
    } catch {
      addToast("Failed to update image", "error");
    }
  };

  // Close image swap popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (imageSwapRef.current && !imageSwapRef.current.contains(e.target as Node)) {
        setImageSwapProduct(null);
        setImageSwapUrl("");
      }
    };
    if (imageSwapProduct) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [imageSwapProduct]);

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
          ? parseFloat(form.price_cny) < 150
            ? "budget"
            : parseFloat(form.price_cny) < 400
              ? "value"
              : parseFloat(form.price_cny) < 800
                ? "quality"
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
      addToast(isEdit ? "Product updated" : "Product added", "success");
      fetchProducts();
    } else {
      const err = await res.json();
      addToast(`Error: ${err.error}`, "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    const res = await fetch(`/api/admin/products/${deleteProduct.id}`, {
      method: "DELETE",
      headers: { "x-admin-password": storedPassword },
    });
    if (res.ok) {
      addToast(`Deleted "${deleteProduct.name}"`, "success");
    } else {
      addToast("Failed to delete product", "error");
    }
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

    try {
      const parsed = JSON.parse(bulkText);
      if (Array.isArray(parsed)) {
        setBulkPreview(parsed);
        return;
      }
    } catch {
      // Not JSON, try CSV
    }

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
    addToast(`Imported ${data.imported} of ${data.total} products`, "success");
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

  // =================== ANALYTICS HELPERS ===================
  const sortedAnalytics = (() => {
    const arr = [...analyticsProducts];
    switch (analyticsSortBy) {
      case "views":
        return arr.sort((a, b) => (b.views || 0) - (a.views || 0));
      case "likes":
        return arr.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case "likerate":
        return arr.sort((a, b) => {
          const rateA = a.views ? (a.likes || 0) / a.views : 0;
          const rateB = b.views ? (b.likes || 0) / b.views : 0;
          return rateB - rateA;
        });
      case "newest":
        return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      default:
        return arr;
    }
  })();

  const totalViews = analyticsProducts.reduce((s, p) => s + (p.views || 0), 0);
  const totalLikes = analyticsProducts.reduce((s, p) => s + (p.likes || 0), 0);
  const avgViews = analyticsProducts.length ? Math.round(totalViews / analyticsProducts.length) : 0;
  const zeroViewProducts = analyticsProducts.filter((p) => !p.views || p.views === 0).length;

  // =================== DASHBOARD ===================
  const girlsCount = products.filter(
    (p) => p.collection === "girls" || p.category.toLowerCase().includes("girl")
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
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                resetForm();
                setShowAdd(true);
              }}
              className="rounded-lg bg-[#FE4205] px-4 py-2 text-sm font-semibold text-white transition-all duration-150 ease-in-out hover:opacity-90"
            >
              + Add Product
            </button>
            <button
              onClick={() => setShowBulk(true)}
              className="rounded-lg border border-[rgba(255,255,255,0.1)] px-4 py-2 text-sm text-[#9CA3AF] transition-all duration-150 ease-in-out hover:border-[rgba(255,255,255,0.2)] hover:text-white"
            >
              Bulk Import
            </button>
            <button
              onClick={exportCSV}
              className="rounded-lg border border-[rgba(255,255,255,0.1)] px-4 py-2 text-sm text-[#9CA3AF] transition-all duration-150 ease-in-out hover:border-[rgba(255,255,255,0.2)] hover:text-white"
            >
              Export CSV
            </button>
            <button
              onClick={() => {
                setShowImageScanner(true);
                scanImages();
              }}
              className="rounded-lg border border-[rgba(255,255,255,0.1)] px-4 py-2 text-sm text-[#9CA3AF] transition-all duration-150 ease-in-out hover:border-[rgba(255,255,255,0.2)] hover:text-white"
            >
              Scan Images
            </button>
            <button
              onClick={() => {
                setShowDuplicates(true);
                findDuplicates();
              }}
              className="rounded-lg border border-[rgba(255,255,255,0.1)] px-4 py-2 text-sm text-[#9CA3AF] transition-all duration-150 ease-in-out hover:border-[rgba(255,255,255,0.2)] hover:text-white"
            >
              Find Duplicates
            </button>
            <button
              onClick={() => setShowRecalcTiers(true)}
              className="rounded-lg border border-[rgba(255,255,255,0.1)] px-4 py-2 text-sm text-[#9CA3AF] transition-all duration-150 ease-in-out hover:border-[rgba(255,255,255,0.2)] hover:text-white"
            >
              Recalculate Tiers
            </button>
            <button
              onClick={() => setShowImportLog(true)}
              className="rounded-lg border border-[rgba(255,255,255,0.1)] px-4 py-2 text-sm text-[#9CA3AF] transition-all duration-150 ease-in-out hover:border-[rgba(255,255,255,0.2)] hover:text-white"
            >
              Import Log
            </button>
            <div className="mx-1 h-5 w-px bg-[rgba(255,255,255,0.08)]" />
            <Link
              href="/admin/marketing"
              className="rounded-lg border border-[rgba(255,255,255,0.1)] px-4 py-2 text-sm text-[#9CA3AF] transition-all duration-150 ease-in-out hover:border-[rgba(255,255,255,0.2)] hover:text-white"
            >
              Marketing
            </Link>
            <Link
              href="/admin/analytics"
              className="rounded-lg border border-[rgba(255,255,255,0.1)] px-4 py-2 text-sm text-[#9CA3AF] transition-all duration-150 ease-in-out hover:border-[rgba(255,255,255,0.2)] hover:text-white"
            >
              Analytics
            </Link>
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

      {/* Tab Toggle (Feature 7) */}
      <div className="border-b border-[rgba(255,255,255,0.06)] px-6">
        <div className="flex gap-0">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-5 py-3 text-sm font-medium transition-colors duration-150 border-b-2 ${
              activeTab === "products"
                ? "border-[#FE4205] text-white"
                : "border-transparent text-[#6B7280] hover:text-[#9CA3AF]"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-5 py-3 text-sm font-medium transition-colors duration-150 border-b-2 ${
              activeTab === "analytics"
                ? "border-[#FE4205] text-white"
                : "border-transparent text-[#6B7280] hover:text-[#9CA3AF]"
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* =================== ANALYTICS VIEW =================== */}
      {activeTab === "analytics" && (
        <div className="px-6 py-5">
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="h-8 w-8 animate-spin text-[#FE4205]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
                <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5" style={{ borderLeft: "4px solid #FE4205" }}>
                  <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                  <div className="mt-1 text-xs text-[#9CA3AF]">Total Views</div>
                </div>
                <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5" style={{ borderLeft: "4px solid #E8518D" }}>
                  <div className="text-2xl font-bold">{totalLikes.toLocaleString()}</div>
                  <div className="mt-1 text-xs text-[#9CA3AF]">Total Likes</div>
                </div>
                <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5" style={{ borderLeft: "4px solid #F59E0B" }}>
                  <div className="text-2xl font-bold">{avgViews.toLocaleString()}</div>
                  <div className="mt-1 text-xs text-[#9CA3AF]">Avg Views/Product</div>
                </div>
                <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5" style={{ borderLeft: "4px solid #60A5FA" }}>
                  <div className="text-2xl font-bold">{zeroViewProducts.toLocaleString()}</div>
                  <div className="mt-1 text-xs text-[#9CA3AF]">Products with 0 Views</div>
                </div>
              </div>

              {/* Sort selector */}
              <div className="mb-4 flex items-center gap-3">
                <span className="text-sm text-[#6B7280]">Sort by:</span>
                {(
                  [
                    { key: "views", label: "Most Viewed" },
                    { key: "likes", label: "Most Liked" },
                    { key: "likerate", label: "Best Like Rate" },
                    { key: "newest", label: "Newest" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setAnalyticsSortBy(opt.key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                      analyticsSortBy === opt.key
                        ? "bg-[#FE4205] text-white"
                        : "border border-[rgba(255,255,255,0.08)] bg-[#1A1A1A] text-[#9CA3AF] hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  onClick={loadAnalytics}
                  className="ml-auto rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs text-[#6B7280] hover:text-white"
                >
                  Refresh
                </button>
              </div>

              {/* Analytics Table */}
              <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#1A1A1A] text-left" style={{ fontSize: "11px", letterSpacing: "0.05em" }}>
                      <th className="px-3 py-3 font-medium uppercase text-[#6C757D]">Rank</th>
                      <th className="px-3 py-3 font-medium uppercase text-[#6C757D]">Name</th>
                      <th className="px-3 py-3 font-medium uppercase text-[#6C757D]">Brand</th>
                      <th className="px-3 py-3 font-medium uppercase text-[#6C757D]">Category</th>
                      <th className="px-3 py-3 font-medium uppercase text-[#6C757D]">Collection</th>
                      <th className="px-3 py-3 font-medium uppercase text-[#6C757D]">Views</th>
                      <th className="px-3 py-3 font-medium uppercase text-[#6C757D]">Likes</th>
                      <th className="px-3 py-3 font-medium uppercase text-[#6C757D]">Like Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAnalytics.slice(0, 100).map((p, i) => {
                      const likeRate = p.views ? ((p.likes || 0) / p.views * 100).toFixed(1) : "0.0";
                      return (
                        <tr
                          key={p.id}
                          className={`border-b border-[rgba(255,255,255,0.04)] transition-colors duration-150 hover:bg-[#1A1A1A] ${
                            i < 10 ? "bg-[rgba(245,158,11,0.04)]" : i % 2 === 1 ? "bg-[#161616]" : "bg-[#141414]"
                          }`}
                        >
                          <td className="px-3 py-2.5 text-xs text-[#6C757D]">
                            {i < 10 ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(245,158,11,0.15)] text-[#F59E0B] font-semibold">
                                {i + 1}
                              </span>
                            ) : (
                              i + 1
                            )}
                          </td>
                          <td className="max-w-[250px] truncate px-3 py-2.5 text-[14px] font-medium">{p.name}</td>
                          <td className="px-3 py-2.5 text-[13px] text-[#9CA3AF]">{p.brand}</td>
                          <td className="px-3 py-2.5">
                            <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[#1A1A1A] px-2.5 py-0.5 text-[12px]">
                              {p.category}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-[12px] text-[#9CA3AF]">{p.collection || "main"}</td>
                          <td className="px-3 py-2.5 font-semibold">{(p.views || 0).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-[#E8518D]">{(p.likes || 0).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-[#9CA3AF]">{likeRate}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* =================== PRODUCTS VIEW =================== */}
      {activeTab === "products" && (
        <>
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
                <option value="score-desc">Score (High)</option>
                <option value="score-asc">Score (Low)</option>
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Quick filters + shortcuts legend */}
          <div className="px-6 pb-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#6B7280]">Quick:</span>
            <button onClick={() => { setSearch(""); setCategoryFilter(""); setTierFilter(""); setSortCol("id"); setSortOrder("asc"); setPage(1); }}
              className="rounded border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-2 py-1 text-[#9CA3AF] hover:text-white transition-colors">All</button>
            <button onClick={() => { setSortCol("score"); setSortOrder("desc"); setPage(1); }}
              className="rounded border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-2 py-1 text-[#9CA3AF] hover:text-white transition-colors">Highest Score</button>
            <button onClick={() => { setSortCol("score"); setSortOrder("asc"); setPage(1); }}
              className="rounded border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-2 py-1 text-[#9CA3AF] hover:text-white transition-colors">Lowest Score</button>
            <button onClick={() => { setSortCol("created_at"); setSortOrder("desc"); setPage(1); }}
              className="rounded border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-2 py-1 text-[#9CA3AF] hover:text-white transition-colors">Newest</button>
            <button onClick={() => { setSortCol("created_at"); setSortOrder("asc"); setPage(1); }}
              className="rounded border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-2 py-1 text-[#9CA3AF] hover:text-white transition-colors">Oldest</button>
            <span className="ml-auto text-[10px] text-[#52525b]">Page {page}/{totalPages} · {total} products · 100/page</span>
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
                    { key: "score", label: "Score" },
                    { key: "tier", label: "Tier" },
                    { key: "collection", label: "Collection" },
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
                          {sortOrder === "asc" ? "\u2191" : "\u2193"}
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
                    <td colSpan={12} className="px-3 py-20 text-center">
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
                    <td colSpan={12} className="px-3 py-20 text-center">
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
                      {/* Feature 10: Clickable thumbnail for Quick Image Swap */}
                      <td className="px-3 py-2.5 relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageSwapProduct(imageSwapProduct?.id === p.id ? null : p);
                            setImageSwapUrl(p.image || "");
                          }}
                          className="block rounded-lg transition-opacity hover:opacity-80"
                        >
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
                        </button>
                        {/* Quick Image Swap Popover */}
                        {imageSwapProduct?.id === p.id && (
                          <div
                            ref={imageSwapRef}
                            className="absolute left-0 top-14 z-[90] w-72 rounded-xl border border-white/10 bg-[#1A1A1A] p-3 shadow-xl"
                          >
                            {imageSwapUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={imageSwapUrl}
                                alt=""
                                className="mb-2 h-32 w-full rounded-lg object-contain bg-[#0a0a0a]"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            )}
                            <input
                              type="text"
                              value={imageSwapUrl}
                              onChange={(e) => setImageSwapUrl(e.target.value)}
                              placeholder="New image URL..."
                              className="mb-2 w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-xs text-white focus:border-[#FE4205] focus:outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  quickImageSwap(p.id, imageSwapUrl);
                                }}
                                className="flex-1 rounded-lg bg-[#FE4205] py-1.5 text-xs font-semibold text-white hover:opacity-90"
                              >
                                Save
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  quickImageSwap(p.id, "");
                                }}
                                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[#9CA3AF] hover:text-white"
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="max-w-[250px] truncate px-3 py-2.5 text-[14px] font-medium">
                        {p.name}
                      </td>
                      <td className="px-3 py-2.5 text-[13px] text-[#9CA3AF]">{p.brand}</td>
                      <td className="px-3 py-2.5">
                        <select
                          value={p.category}
                          onChange={async (e) => {
                            const newCat = e.target.value;
                            try {
                              const res = await fetch(`/api/admin/products/${p.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json", "x-admin-password": storedPassword },
                                body: JSON.stringify({ category: newCat }),
                              });
                              if (res.ok) {
                                setProducts((prev) => prev.map((pr) => pr.id === p.id ? { ...pr, category: newCat } : pr));
                                addToast(`Category → ${newCat}`);
                              }
                            } catch { /* */ }
                          }}
                          className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1A1A1A] px-2 py-1 text-[12px] text-white outline-none focus:border-[#FE4205] cursor-pointer"
                        >
                          {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2.5">
                        {p.price_cny != null ? (
                          <span className="font-semibold text-[#FE4205]">&yen;{p.price_cny}</span>
                        ) : (
                          <span className="text-[#6B7280]">--</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {p.score != null ? (
                          <span className={`font-semibold ${
                            p.score >= 70 ? "text-[#4ADE80]" :
                            p.score >= 50 ? "text-[#FACC15]" :
                            p.score >= 30 ? "text-[#FB923C]" :
                            "text-[#9CA3AF]"
                          }`}>{p.score}</span>
                        ) : (
                          <span className="text-[#6B7280]">--</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {p.tier && (
                          <span
                            className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                              p.tier === "premium"
                                ? "bg-[rgba(234,179,8,0.15)] text-[#FACC15]"
                                : p.tier === "quality"
                                  ? "bg-[rgba(249,115,22,0.15)] text-[#FB923C]"
                                  : p.tier === "value"
                                    ? "bg-[rgba(34,197,94,0.15)] text-[#4ADE80]"
                                    : "bg-[rgba(55,65,81,0.2)] text-[#9CA3AF]"
                            }`}
                          >
                            {p.tier}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-[12px] text-[#6C757D]">
                        {p.collection || "main"}
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
        </>
      )}

      {/* =================== BULK ACTIONS FLOATING BAR =================== */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[rgba(255,255,255,0.1)] bg-[#1A1A1A] px-6 py-3 shadow-lg animate-[slideUp_150ms_ease-out]">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-white mr-2">{selected.size} selected</span>

            {/* Feature 1: Bulk Category Reassign */}
            <select
              defaultValue=""
              onChange={(e) => {
                bulkChangeCategory(e.target.value);
                e.target.value = "";
              }}
              className="h-9 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#141414] px-3 text-xs text-[#9CA3AF] focus:border-[#FE4205] focus:outline-none"
            >
              <option value="" disabled>Change Category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Feature 2: Bulk Collection Swap */}
            <select
              defaultValue=""
              onChange={(e) => {
                bulkChangeCollection(e.target.value);
                e.target.value = "";
              }}
              className="h-9 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#141414] px-3 text-xs text-[#9CA3AF] focus:border-[#FE4205] focus:outline-none"
            >
              <option value="" disabled>Move to Collection...</option>
              {COLLECTIONS.map((col) => (
                <option key={col} value={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</option>
              ))}
            </select>

            <div className="ml-auto">
              {/* Feature 4: Enhanced Bulk Delete */}
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-red-700"
              >
                Delete Selected
              </button>
            </div>
          </div>
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
                &#10005;
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

              {form.image && (
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.image}
                    alt="Product preview"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    onLoad={(e) => { (e.target as HTMLImageElement).style.display = "block"; }}
                    className="rounded-lg"
                    style={{ maxWidth: 180, maxHeight: 180, objectFit: "contain", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 12 }}
                  />
                </div>
              )}

              {/* Score breakdown (read-only, shown when editing) */}
              {editProduct && editProduct.score != null && (
                <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#FE4205]">Score</span>
                    <span className={`text-lg font-bold ${
                      editProduct.score >= 70 ? "text-[#4ADE80]" :
                      editProduct.score >= 50 ? "text-[#FACC15]" :
                      editProduct.score >= 30 ? "text-[#FB923C]" :
                      "text-[#9CA3AF]"
                    }`}>{editProduct.score}/100</span>
                  </div>
                  {editProduct.score_breakdown && (
                    <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
                      {Object.entries(editProduct.score_breakdown).map(([key, val]) => (
                        <div key={key} className="rounded-md bg-[#141414] px-1 py-1.5">
                          <div className="font-semibold text-white">{val}/20</div>
                          <div className="mt-0.5 text-[#6B7280]">{key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()).replace("Price Appeal", "Price").replace("Brand Power", "Brand").replace("Category Demand", "Cat.").replace("Image Quality", "Image")}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#FE4205]">
                    Brand
                  </label>
                  <input
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-[#FE4205] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#FE4205]">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
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
                    Price &yen;
                  </label>
                  <input
                    type="number"
                    value={form.price_cny}
                    onChange={(e) => setForm({ ...form, price_cny: e.target.value })}
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
                    onChange={(e) => setForm({ ...form, tier: e.target.value })}
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
                    onChange={(e) => setForm({ ...form, quality: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, source_link: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
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

      {/* =================== DELETE SINGLE PRODUCT MODAL =================== */}
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

      {/* =================== BULK DELETE CONFIRMATION MODAL (Feature 4) =================== */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#141414] p-6">
            <h2 className="mb-2 font-heading text-lg font-bold text-white">
              Bulk Delete
            </h2>
            <p className="mb-1 text-sm text-[#9CA3AF]">
              Are you sure you want to delete:
            </p>
            <p className="mb-4 font-medium text-white">
              {selected.size} products
            </p>
            <p className="mb-6 text-xs text-red-400">
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={bulkDelete}
                className="flex-1 rounded-lg bg-red-600 py-3 font-semibold text-white hover:bg-red-700"
              >
                Delete {selected.size} Products
              </button>
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
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
                &#10005;
              </button>
            </div>
            <p className="mb-3 text-xs text-[#9CA3AF]">
              Paste CSV (name, brand, category, price_cny, source_link) or JSON array
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
                <div className="mb-3 max-h-48 overflow-auto rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#0a0a0a]">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.06)] text-left text-[#6B7280]">
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Brand</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkPreview.slice(0, 10).map((p, i) => (
                        <tr key={i} className="border-b border-[rgba(255,255,255,0.04)]">
                          <td className="px-3 py-2 text-white">{p.name}</td>
                          <td className="px-3 py-2 text-[#9CA3AF]">{p.brand}</td>
                          <td className="px-3 py-2">{p.category}</td>
                          <td className="px-3 py-2 text-[#FE4205]">
                            {p.price_cny ? `\u00A5${p.price_cny}` : "\u2014"}
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

      {/* =================== BROKEN IMAGE SCANNER MODAL (Feature 5) =================== */}
      {showImageScanner && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl max-h-[80vh] rounded-2xl border border-white/10 bg-[#141414] p-6 overflow-hidden flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">Broken Image Scanner</h2>
              <button
                onClick={() => {
                  setShowImageScanner(false);
                  setScanning(false);
                  setBrokenImages([]);
                  setScanProgress(0);
                  setScanTotal(0);
                }}
                className="text-[#6B7280] hover:text-white"
              >
                &#10005;
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#9CA3AF]">
                  {scanning ? "Scanning..." : scanTotal > 0 ? "Scan complete" : "Starting..."}
                </span>
                <span className="text-xs text-[#6B7280]">
                  {scanProgress} / {scanTotal}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#0a0a0a] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#FE4205] transition-all duration-300"
                  style={{ width: scanTotal > 0 ? `${(scanProgress / scanTotal) * 100}%` : "0%" }}
                />
              </div>
            </div>

            <div className="mb-3 text-sm">
              <span className="text-red-400 font-semibold">{brokenImages.length}</span>
              <span className="text-[#9CA3AF]"> broken images found</span>
            </div>

            {/* Broken images list */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {brokenImages.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#1A1A1A] p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-900/20 text-red-400 text-xs font-semibold shrink-0">
                    !
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.name}</div>
                    <div className="text-xs text-[#6B7280] truncate">ID: {item.id} | {item.image}</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowImageScanner(false);
                      const product = products.find((p) => p.id === item.id);
                      if (product) {
                        openEdit(product);
                      } else {
                        // Create a minimal product object to open edit
                        openEdit({
                          id: item.id,
                          name: item.name,
                          brand: "",
                          category: "Shoes",
                          price_cny: null,
                          price_usd: null,
                          price_eur: null,
                          tier: null,
                          quality: null,
                          source_link: "",
                          image: item.image,
                          images: [],
                          variants: [],
                          qc_photos: [],
                          verified: false,
                          views: 0,
                          likes: 0,
                          dislikes: 0,
                          collection: "main",
                          created_at: "",
                          score: null,
                          score_breakdown: null,
                        });
                      }
                    }}
                    className="shrink-0 rounded-lg bg-[#FE4205] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                  >
                    Fix
                  </button>
                </div>
              ))}
              {!scanning && brokenImages.length === 0 && scanTotal > 0 && (
                <div className="text-center py-8 text-sm text-[#6B7280]">
                  All images are valid!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================== DUPLICATE DETECTOR MODAL (Feature 6) =================== */}
      {showDuplicates && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl max-h-[80vh] rounded-2xl border border-white/10 bg-[#141414] p-6 overflow-hidden flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">Duplicate Detector</h2>
              <button
                onClick={() => {
                  setShowDuplicates(false);
                  setDuplicateGroups([]);
                }}
                className="text-[#6B7280] hover:text-white"
              >
                &#10005;
              </button>
            </div>

            {duplicatesLoading ? (
              <div className="flex items-center justify-center py-12">
                <svg className="h-8 w-8 animate-spin text-[#FE4205]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : duplicateGroups.length === 0 ? (
              <div className="text-center py-12 text-sm text-[#6B7280]">
                No duplicate source links found.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4">
                <div className="text-sm text-[#9CA3AF] mb-2">
                  Found {duplicateGroups.length} groups of duplicate source links
                </div>
                {duplicateGroups.map((group, gi) => (
                  <div
                    key={gi}
                    className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#1A1A1A] p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-[#6B7280] truncate flex-1 mr-3">
                        {group[0].source_link}
                      </div>
                      <button
                        onClick={() => keepFirstDeleteRest(group)}
                        className="shrink-0 rounded-lg border border-red-600/50 bg-red-600/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-600/20"
                      >
                        Keep First, Delete Rest
                      </button>
                    </div>
                    <div className="space-y-1">
                      {group.map((p, pi) => (
                        <div
                          key={p.id}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                            pi === 0 ? "bg-[rgba(254,66,5,0.08)] border border-[#FE4205]/20" : "bg-[#141414]"
                          }`}
                        >
                          <span className="text-xs text-[#6B7280] w-10">#{p.id}</span>
                          <span className="flex-1 truncate">{p.name}</span>
                          <span className="text-xs text-[#6B7280]">{p.category}</span>
                          {pi === 0 && (
                            <span className="rounded-md bg-[#FE4205]/20 px-2 py-0.5 text-[10px] font-semibold text-[#FE4205]">KEEP</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================== RECALCULATE TIERS MODAL (Feature 8) =================== */}
      {showRecalcTiers && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#141414] p-6">
            <h2 className="mb-2 font-heading text-lg font-bold text-white">
              Recalculate Tiers
            </h2>
            <p className="mb-2 text-sm text-[#9CA3AF]">
              This will recalculate tier for all products based on price:
            </p>
            <div className="mb-4 space-y-1 text-xs text-[#6B7280]">
              <div>&lt; &yen;150 = budget</div>
              <div>&yen;150 - &yen;399 = value</div>
              <div>&yen;400 - &yen;799 = quality</div>
              <div>&ge; &yen;800 = premium</div>
            </div>
            <p className="mb-6 text-xs text-[#F59E0B]">
              Products without a price will be skipped.
            </p>
            <div className="flex gap-3">
              <button
                onClick={recalculateTiers}
                disabled={recalcLoading}
                className="flex-1 rounded-lg bg-[#FE4205] py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {recalcLoading ? "Recalculating..." : "Recalculate"}
              </button>
              <button
                onClick={() => setShowRecalcTiers(false)}
                className="rounded-lg border border-white/10 px-6 py-3 text-sm text-[#9CA3AF] hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== IMPORT LOG MODAL (Feature 9) =================== */}
      {showImportLog && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl max-h-[80vh] rounded-2xl border border-white/10 bg-[#141414] p-6 overflow-hidden flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">Import History Log</h2>
              <button
                onClick={() => setShowImportLog(false)}
                className="text-[#6B7280] hover:text-white"
              >
                &#10005;
              </button>
            </div>

            {/* Add entry form */}
            <div className="mb-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#1A1A1A] p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#FE4205]">Log New Import</div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <input
                  type="number"
                  value={importLogForm.count}
                  onChange={(e) => setImportLogForm({ ...importLogForm, count: e.target.value })}
                  placeholder="Count"
                  className="rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-xs text-white focus:border-[#FE4205] focus:outline-none"
                />
                <input
                  value={importLogForm.source}
                  onChange={(e) => setImportLogForm({ ...importLogForm, source: e.target.value })}
                  placeholder="Source (e.g. KakoBuy)"
                  className="rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-xs text-white focus:border-[#FE4205] focus:outline-none"
                />
                <input
                  value={importLogForm.notes}
                  onChange={(e) => setImportLogForm({ ...importLogForm, notes: e.target.value })}
                  placeholder="Notes"
                  className="rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-xs text-white focus:border-[#FE4205] focus:outline-none"
                />
              </div>
              <button
                onClick={saveImportLogEntry}
                disabled={!importLogForm.count || !importLogForm.source}
                className="rounded-lg bg-[#FE4205] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40"
              >
                Log Import
              </button>
            </div>

            {/* Log entries */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {importLog.length === 0 ? (
                <div className="text-center py-8 text-sm text-[#6B7280]">
                  No import history logged yet.
                </div>
              ) : (
                importLog.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#1A1A1A] px-4 py-3"
                  >
                    <div className="text-xs text-[#6B7280] w-28 shrink-0">
                      {new Date(entry.date).toLocaleDateString()} {new Date(entry.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="font-semibold text-sm text-[#FE4205] w-16 shrink-0">
                      +{entry.count}
                    </div>
                    <div className="text-sm text-white">{entry.source}</div>
                    {entry.notes && (
                      <div className="text-xs text-[#6B7280] truncate flex-1">{entry.notes}</div>
                    )}
                    <button
                      onClick={() => {
                        const updated = importLog.filter((_, idx) => idx !== i);
                        setImportLog(updated);
                        localStorage.setItem("murmreps-import-log", JSON.stringify(updated));
                      }}
                      className="text-[#6B7280] hover:text-red-400 text-xs shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================== TOAST NOTIFICATIONS =================== */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 animate-[slideUp_200ms_ease-out] ${
              toast.type === "success"
                ? "bg-green-600"
                : "bg-red-600"
            }`}
            style={{ minWidth: 250 }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
