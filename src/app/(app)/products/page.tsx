"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Category {
  id: string;
  name: string;
  _count: { products: number };
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  category: { id: string; name: string };
  createdAt: string;
}

function StockStatusBadge({ product }: { product: Product }) {
  if (product.quantity === 0)
    return <span className="badge badge-danger">Out of Stock</span>;
  if (product.quantity <= product.lowStockThreshold)
    return <span className="badge badge-warning">Low Stock</span>;
  return <span className="badge badge-success">In Stock</span>;
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(searchParams?.get("categoryId") || "");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit, setLimit] = useState(10);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem("userRole") === "ADMIN");
  }, []);

  const [showProductModal, setShowProductModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockTarget, setStockTarget] = useState<Product | null>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    categoryId: "",
    price: "",
    quantity: "",
    lowStockThreshold: "10",
  });
  const [stockForm, setStockForm] = useState({ type: "IN", quantity: "", reason: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const fetchProducts = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryFilter) params.set("categoryId", categoryFilter);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("limit", String(limit));
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.data || []);
    setTotalPages(data.totalPages || 1);
    setTotalProducts(data.total || 0);
  }, [search, categoryFilter, statusFilter, page, limit]);

  useEffect(() => { setPage(1); }, [search, categoryFilter, statusFilter, limit]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([cats]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function openAdd() {
    setEditingProduct(null);
    setProductForm({ name: "", sku: "", categoryId: "", price: "", quantity: "", lowStockThreshold: "10" });
    setFormError("");
    setShowProductModal(true);
  }

  function openEdit(p: Product) {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      sku: p.sku,
      categoryId: p.category.id,
      price: String(p.price),
      quantity: String(p.quantity),
      lowStockThreshold: String(p.lowStockThreshold),
    });
    setFormError("");
    setShowProductModal(true);
  }

  function openStock(p: Product) {
    setStockTarget(p);
    setStockForm({ type: "IN", quantity: "", reason: "" });
    setFormError("");
    setShowStockModal(true);
  }

  async function handleProductSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      const payload = {
        name: productForm.name,
        sku: productForm.sku,
        categoryId: productForm.categoryId,
        price: parseFloat(productForm.price) || 0,
        quantity: parseInt(productForm.quantity) || 0,
        lowStockThreshold: productForm.lowStockThreshold ? parseInt(productForm.lowStockThreshold) : 0,
      };
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error); return; }
      setShowProductModal(false);
      fetchProducts();
    } catch {
      setFormError("Something went wrong");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleStockSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      const res = await fetch(`/api/stock/${stockTarget!.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: stockForm.type, quantity: parseInt(stockForm.quantity), reason: stockForm.reason }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error); return; }
      setShowStockModal(false);
      fetchProducts();
    } catch {
      setFormError("Something went wrong");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleteError("");
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) { 
      setDeleteConfirm(null); 
      fetchProducts(); 
    } else {
      const data = await res.json();
      setDeleteError(data.error || "Failed to delete product");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{totalProducts} product{totalProducts !== 1 ? "s" : ""} found</p>
        </div>
        {isAdmin && (
        <button id="add-product-btn" className="btn btn-primary" onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Add Product
        </button>
        )}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            id="product-search"
            className="form-input search-input"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          id="category-filter"
          className="form-input form-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          id="status-filter"
          className="form-input form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div className="table-loading">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8, marginBottom: 8 }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              <path d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M16 3H8L6 7h12l-2-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <p>No products found</p>
            <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>Try adjusting your filters or add a new product</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td>
                      <span className="product-name">{p.name}</span>
                    </td>
                    <td><code className="sku-badge">{p.sku}</code></td>
                    <td><span className="category-chip">{p.category.name}</span></td>
                    <td className="price-cell">₹{Number(p.price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`qty-value ${p.quantity === 0 ? "qty-danger" : p.quantity <= p.lowStockThreshold ? "qty-warning" : ""}`}>
                        {p.quantity}
                      </span>
                      {p.quantity <= p.lowStockThreshold && p.quantity > 0 && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: "var(--yellow)", marginLeft: 6, verticalAlign: "middle" }}>
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      )}
                    </td>
                    <td><StockStatusBadge product={p} /></td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn action-btn-stock" onClick={() => openStock(p)} title="Adjust stock">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                        {isAdmin && (
                        <button className="action-btn action-btn-edit" onClick={() => openEdit(p)} title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                        </button>
                        )}
                        {isAdmin && (
                        <button className="action-btn action-btn-delete" onClick={() => { setDeleteConfirm(p.id); setDeleteError(""); }} title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {totalProducts > 10 && (
              <div className="pagination">
                <span className="pagination-info">
                  Showing {products.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalProducts)} of {totalProducts}
                </span>
                <div className="pagination-controls">
                  <select className="form-input form-select" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                  <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
                  <span className="pagination-page">{page} / {totalPages}</span>
                  <button className="btn btn-ghost" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <Modal title={editingProduct ? "Edit Product" : "Add Product"} onClose={() => setShowProductModal(false)}>
          <form onSubmit={handleProductSubmit} className="modal-form">
            {formError && <div className="form-error">{formError}</div>}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input id="product-name" className="form-input" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">SKU *</label>
                <input id="product-sku" className="form-input" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value.toUpperCase() })} placeholder="e.g. PRD-001" required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select id="product-category" className="form-input form-select" value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })} required>
                <option value="">Select a category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input id="product-price" type="number" step="0.01" min="0" className="form-input" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input id="product-quantity" type="number" min="0" className="form-input" value={productForm.quantity} onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Low Stock Alert</label>
                <input id="product-threshold" type="number" min="0" className="form-input" value={productForm.lowStockThreshold} onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowProductModal(false)}>Cancel</button>
              <button id="product-submit" type="submit" className="btn btn-primary" disabled={formLoading}>
                {formLoading ? <span className="btn-spinner" /> : editingProduct ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Stock Modal */}
      {showStockModal && stockTarget && (
        <Modal title={`Adjust Stock — ${stockTarget.name}`} onClose={() => setShowStockModal(false)}>
          <form onSubmit={handleStockSubmit} className="modal-form">
            {formError && <div className="form-error">{formError}</div>}
            <div className="stock-current">
              Current stock: <strong>{stockTarget.quantity} units</strong>
            </div>
            <div className="stock-type-toggle">
              <button
                type="button"
                className={`toggle-btn ${stockForm.type === "IN" ? "toggle-active-in" : ""}`}
                onClick={() => setStockForm({ ...stockForm, type: "IN" })}
              >
                Stock In
              </button>
              <button
                type="button"
                className={`toggle-btn ${stockForm.type === "OUT" ? "toggle-active-out" : ""}`}
                onClick={() => setStockForm({ ...stockForm, type: "OUT" })}
              >
                Stock Out
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input id="stock-quantity" type="number" min="1" className="form-input" value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Reason *</label>
              <input id="stock-reason" className="form-input" placeholder="e.g. New shipment received, Sale order #1234" value={stockForm.reason} onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })} required />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowStockModal(false)}>Cancel</button>
              <button id="stock-submit" type="submit" className={`btn ${stockForm.type === "IN" ? "btn-success" : "btn-danger"}`} disabled={formLoading}>
                {formLoading ? <span className="btn-spinner" /> : stockForm.type === "IN" ? "Add Stock" : "Remove Stock"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <Modal title="Delete Product" onClose={() => setDeleteConfirm(null)}>
          <div className="modal-form">
            {deleteError && <div className="form-error">{deleteError}</div>}
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Are you sure you want to delete this product? This action cannot be undone and will also delete all stock movement history.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button id="delete-confirm-btn" className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete Product</button>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        .page { padding: 2rem; max-width: 1200px; margin: 0 auto; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 768px) { .page { padding: 4rem 1rem 1rem; } }

        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
        .page-title { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
        .page-subtitle { color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem; }

        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; font-family: inherit; font-weight: 600; font-size: 0.875rem; border: none; cursor: pointer; border-radius: var(--radius-sm); padding: 0.65rem 1.25rem; transition: all 0.2s; text-decoration: none; }
        .btn-primary { background: linear-gradient(135deg, var(--teal), var(--indigo)); color: white; }
        .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(6,182,212,0.3); }
        .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text-secondary); }
        .btn-ghost:hover { background: var(--bg-card-hover); color: var(--text-primary); }
        .btn-success { background: var(--green); color: white; }
        .btn-success:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
        .btn-danger { background: var(--red); color: white; }
        .btn-danger:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
        .btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .filter-bar { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
        .search-wrapper { position: relative; flex: 1; min-width: 200px; }
        .search-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .search-input { padding-left: 2.5rem !important; }
        .form-input { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); padding: 0.65rem 0.875rem; font-size: 0.875rem; font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s; width: 100%; }
        .form-input::placeholder { color: var(--text-muted); }
        .form-input:focus { outline: none; border-color: var(--teal); box-shadow: 0 0 0 3px var(--teal-glow); }
        .form-select { min-width: 150px; width: auto; cursor: pointer; }

        .table-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
        .table-scroll { overflow-x: auto; }
        .table { width: 100%; border-collapse: collapse; min-width: 700px; }
        .table th { padding: 0.875rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); background: var(--bg-secondary); }
        .table td { padding: 0.875rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
        .table-row { transition: background 0.15s; }
        .table-row:hover { background: var(--bg-secondary); }
        .table-row:last-child td { border-bottom: none; }
        .table-loading { padding: 1.5rem; }

        .pagination { display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 1rem; }
        .pagination-info { font-size: 0.85rem; color: var(--text-secondary); }
        .pagination-controls { display: flex; align-items: center; gap: 0.5rem; }
        .pagination-page { font-size: 0.85rem; font-weight: 500; color: var(--text-primary); margin: 0 0.5rem; }

        .product-name { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); }
        .sku-badge { background: var(--bg-secondary); color: var(--text-secondary); font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-family: monospace; border: 1px solid var(--border); }
        .category-chip { background: rgba(99,102,241,0.1); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.2); border-radius: 999px; padding: 0.2rem 0.6rem; font-size: 0.75rem; font-weight: 500; }
        .price-cell { font-weight: 600; color: var(--text-primary); font-variant-numeric: tabular-nums; }
        .qty-value { font-weight: 700; font-size: 0.9rem; }
        .qty-warning { color: var(--yellow); }
        .qty-danger { color: var(--red); }

        .badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 0.25rem 0.65rem; font-size: 0.72rem; font-weight: 600; }
        .badge-success { background: rgba(16,185,129,0.12); color: var(--green); border: 1px solid rgba(16,185,129,0.25); }
        .badge-warning { background: rgba(245,158,11,0.12); color: var(--yellow); border: 1px solid rgba(245,158,11,0.25); animation: badgePulse 2s infinite; }
        .badge-danger { background: rgba(239,68,68,0.12); color: var(--red); border: 1px solid rgba(239,68,68,0.25); animation: badgePulse 1.5s infinite; }
        @keyframes badgePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

        .action-buttons { display: flex; gap: 0.375rem; }
        .action-btn { width: 30px; height: 30px; border: 1px solid var(--border); background: var(--bg-secondary); border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; color: var(--text-muted); }
        .action-btn:hover { transform: scale(1.1); }
        .action-btn-stock:hover { background: rgba(6,182,212,0.1); border-color: rgba(6,182,212,0.4); color: var(--teal); }
        .action-btn-edit:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.4); color: var(--indigo); }
        .action-btn-delete:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.4); color: var(--red); }

        .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-secondary); }

        .skeleton { background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; animation: fadeIn 0.2s ease; }
        .modal-box { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); width: 100%; max-width: 560px; box-shadow: var(--shadow); animation: slideUp 0.25s ease; max-height: 90vh; overflow-y: auto; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); }
        .modal-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
        .modal-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.25rem; border-radius: 4px; transition: all 0.2s; display: flex; }
        .modal-close:hover { background: var(--bg-card-hover); color: var(--text-primary); }
        .modal-form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.125rem; }
        .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-label { font-size: 0.8rem; font-weight: 500; color: var(--text-secondary); }
        .form-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; border-radius: var(--radius-sm); padding: 0.75rem 1rem; font-size: 0.85rem; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--border); }

        .stock-current { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.75rem 1rem; font-size: 0.875rem; color: var(--text-secondary); }
        .stock-current strong { color: var(--text-primary); }
        .stock-type-toggle { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; }
        .toggle-btn { padding: 0.65rem; font-family: inherit; font-size: 0.875rem; font-weight: 600; border: none; background: var(--bg-secondary); color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .toggle-active-in { background: rgba(16,185,129,0.15); color: var(--green); }
        .toggle-active-out { background: rgba(239,68,68,0.15); color: var(--red); }
      `}</style>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="page" style={{ padding: "4rem", textAlign: "center" }}><div className="btn-spinner" style={{ margin: "0 auto", width: 32, height: 32, borderTopColor: "var(--teal)" }} /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
