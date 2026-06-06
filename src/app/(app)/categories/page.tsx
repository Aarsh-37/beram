"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  _count: { products: number };
  createdAt: string;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  async function fetchCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { 
    setIsAdmin(localStorage.getItem("userRole") === "ADMIN");
    fetchCategories(); 
  }, []);

  function openAdd() {
    setEditing(null);
    setName("");
    setFormError("");
    setShowModal(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setName(c.name);
    setFormError("");
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error); return; }
      setShowModal(false);
      fetchCategories();
    } catch {
      setFormError("Something went wrong");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(c: Category) {
    setDeleteError("");
    const res = await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { setDeleteError(data.error); return; }
    setDeleteConfirm(null);
    fetchCategories();
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organise your products into categories</p>
        </div>
        {isAdmin && (
        <button id="add-category-btn" className="btn btn-primary" onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Add Category
        </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 110, borderRadius: "var(--radius)" }} />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p>No categories yet</p>
          <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>Create your first category to get started</p>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((c) => (
            <div key={c.id} className="category-card" onClick={() => router.push(`/products?categoryId=${c.id}`)} style={{ cursor: 'pointer' }}>
              <div className="category-card-top">
                <div className="category-icon">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="category-actions">
                  {isAdmin && (
                  <button className="action-btn action-btn-edit" onClick={(e) => { e.stopPropagation(); openEdit(c); }} title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </button>
                  )}
                  {isAdmin && (
                  <button
                    className="action-btn action-btn-delete"
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(c); setDeleteError(""); }}
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  )}
                </div>
              </div>
              <h3 className="category-name">{c.name}</h3>
              <p className="category-count">{c._count.products} product{c._count.products !== 1 ? "s" : ""}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? "Edit Category" : "Add Category"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="modal-form">
            {formError && <div className="form-error">{formError}</div>}
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input
                id="category-name-input"
                className="form-input"
                placeholder="e.g. Electronics, Clothing..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button id="category-submit" type="submit" className="btn btn-primary" disabled={formLoading}>
                {formLoading ? <span className="btn-spinner" /> : editing ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Delete Category" onClose={() => setDeleteConfirm(null)}>
          <div className="modal-form">
            {deleteError && <div className="form-error">{deleteError}</div>}
            <p style={{ color: "var(--text-secondary)" }}>
              Are you sure you want to delete <strong style={{ color: "var(--text-primary)" }}>{deleteConfirm.name}</strong>?
              This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button id="category-delete-confirm" className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        .page { padding: 2rem; max-width: 1200px; margin: 0 auto; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 768px) { .page { padding: 4rem 1rem 1rem; } }

        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.75rem; gap: 1rem; flex-wrap: wrap; }
        .page-title { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
        .page-subtitle { color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem; }

        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; font-family: inherit; font-weight: 600; font-size: 0.875rem; border: none; cursor: pointer; border-radius: var(--radius-sm); padding: 0.65rem 1.25rem; transition: all 0.2s; text-decoration: none; }
        .btn-primary { background: linear-gradient(135deg, var(--teal), var(--indigo)); color: white; }
        .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(6,182,212,0.3); }
        .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text-secondary); }
        .btn-ghost:hover { background: var(--bg-card-hover); color: var(--text-primary); }
        .btn-danger { background: var(--red); color: white; }
        .btn-danger:hover:not(:disabled) { opacity: 0.85; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
        .btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }

        .category-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.25rem;
          transition: all 0.2s;
        }
        .category-card:hover { border-color: rgba(6,182,212,0.3); transform: translateY(-2px); box-shadow: var(--shadow-glow); }
        .category-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem; }
        .category-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--teal), var(--indigo));
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.125rem;
          color: white;
        }
        .category-actions { display: flex; gap: 0.375rem; }
        .action-btn { width: 30px; height: 30px; border: 1px solid var(--border); background: var(--bg-secondary); border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; color: var(--text-muted); }
        .action-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .action-btn-edit:hover:not(:disabled) { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.4); color: var(--indigo); }
        .action-btn-delete:hover:not(:disabled) { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.4); color: var(--red); }
        .category-name { font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.375rem; }
        .category-count { font-size: 0.8rem; color: var(--text-muted); }

        .skeleton { background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-secondary); }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; animation: fadeIn 0.2s ease; }
        .modal-box { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); width: 100%; max-width: 480px; box-shadow: var(--shadow); animation: slideUp 0.25s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); }
        .modal-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
        .modal-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.25rem; border-radius: 4px; transition: all 0.2s; display: flex; }
        .modal-close:hover { background: var(--bg-card-hover); color: var(--text-primary); }
        .modal-form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.125rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-label { font-size: 0.8rem; font-weight: 500; color: var(--text-secondary); }
        .form-input { background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); padding: 0.65rem 0.875rem; font-size: 0.875rem; font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s; width: 100%; }
        .form-input::placeholder { color: var(--text-muted); }
        .form-input:focus { outline: none; border-color: var(--teal); box-shadow: 0 0 0 3px var(--teal-glow); }
        .form-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; border-radius: var(--radius-sm); padding: 0.75rem 1rem; font-size: 0.85rem; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--border); }
      `}</style>
    </div>
  );
}
