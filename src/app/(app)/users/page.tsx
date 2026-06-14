"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "STAFF";
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

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [roleError, setRoleError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  async function fetchUsers() {
    const res = await fetch("/api/users");
    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        router.push("/dashboard"); // Redirect if not authorized
      }
      return;
    }
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }

  useEffect(() => {
    setIsAdmin(localStorage.getItem("userRole") === "ADMIN");
    fetchUsers();
  }, [router]);

  function openRoleModal(user: User) {
    setRoleModalUser(user);
    setSelectedRole(user.role);
    setRoleError("");
  }

  async function handleRoleChange(e: React.FormEvent) {
    e.preventDefault();
    if (!roleModalUser) return;
    setRoleError("");
    setFormLoading(true);

    try {
      const res = await fetch(`/api/users/${roleModalUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) { setRoleError(data.error || "Failed to update role"); return; }
      setRoleModalUser(null);
      fetchUsers();
    } catch {
      setRoleError("Something went wrong");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(user: User) {
    setDeleteError("");
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { setDeleteError(data.error || "Failed to delete user"); return; }
    setDeleteConfirm(null);
    fetchUsers();
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">View and manage staff access and permissions</p>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="table-loading">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8, marginBottom: 8 }} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>No users found</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="table-row">
                    <td>
                      <span className="user-name">{u.name}</span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === "ADMIN" ? "badge-success" : "badge-warning"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn action-btn-edit" onClick={() => openRoleModal(u)} title="Change Role">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button className="action-btn action-btn-delete" onClick={() => { setDeleteConfirm(u); setDeleteError(""); }} title="Delete User">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {roleModalUser && (
        <Modal title="Change Role" onClose={() => setRoleModalUser(null)}>
          <form onSubmit={handleRoleChange} className="modal-form">
            {roleError && <div className="form-error">{roleError}</div>}
            <div className="form-group">
              <label className="form-label">User</label>
              <input className="form-input" value={roleModalUser.name} disabled style={{ opacity: 0.7 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input form-select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as any)}>
                <option value="ADMIN">Admin</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setRoleModalUser(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={formLoading}>
                {formLoading ? <span className="btn-spinner" /> : "Update Role"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Delete User" onClose={() => setDeleteConfirm(null)}>
          <div className="modal-form">
            {deleteError && <div className="form-error">{deleteError}</div>}
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Are you sure you want to delete <strong style={{ color: "var(--text-primary)" }}>{deleteConfirm.name}</strong>? They will no longer be able to log in.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete User</button>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        .page { padding: 2rem; max-width: 1000px; margin: 0 auto; animation: fadeIn 0.3s ease; }
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
        .btn-danger { background: var(--red); color: white; }
        .btn-danger:hover:not(:disabled) { opacity: 0.85; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
        .btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .table-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
        .table-scroll { overflow-x: auto; }
        .table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .table th { padding: 0.875rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); background: var(--bg-secondary); }
        .table td { padding: 0.875rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
        .table-row { transition: background 0.15s; }
        .table-row:hover { background: var(--bg-secondary); }
        .table-row:last-child td { border-bottom: none; }
        .table-loading { padding: 1.5rem; }

        .user-name { font-size: 0.9rem; font-weight: 500; color: var(--text-primary); }

        .badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 0.25rem 0.65rem; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
        .badge-success { background: rgba(16,185,129,0.12); color: var(--green); border: 1px solid rgba(16,185,129,0.25); }
        .badge-warning { background: rgba(99,102,241,0.12); color: var(--indigo); border: 1px solid rgba(99,102,241,0.25); }

        .action-buttons { display: flex; gap: 0.375rem; }
        .action-btn { width: 30px; height: 30px; border: 1px solid var(--border); background: var(--bg-secondary); border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; color: var(--text-muted); }
        .action-btn:hover { transform: scale(1.1); }
        .action-btn-edit:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.4); color: var(--indigo); }
        .action-btn-delete:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.4); color: var(--red); }

        .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-secondary); }

        .skeleton { background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }

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
        .form-input:focus:not(:disabled) { outline: none; border-color: var(--teal); box-shadow: 0 0 0 3px var(--teal-glow); }
        .form-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; border-radius: var(--radius-sm); padding: 0.75rem 1rem; font-size: 0.85rem; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--border); }
      `}</style>
    </div>
  );
}
