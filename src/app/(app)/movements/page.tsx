"use client";

import { useEffect, useState } from "react";

interface Movement {
  id: string;
  type: string;
  quantity: number;
  reason: string;
  createdAt: string;
  product: { id: string; name: string; sku: string };
  createdBy: { name: string };
}

interface Pagination {
  total: number;
  page: number;
  totalPages: number;
}

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/movements?page=${page}&limit=25`)
      .then((r) => r.json())
      .then((data) => {
        setMovements(data.movements || []);
        setPagination({ total: data.total, page: data.page, totalPages: data.totalPages });
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Movement History</h1>
          <p className="page-subtitle">{pagination.total} total movement{pagination.total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: "1.5rem" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8, marginBottom: 8 }} />
            ))}
          </div>
        ) : movements.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <p>No stock movements yet</p>
            <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>Movements appear here when you adjust stock levels</p>
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Quantity</th>
                    <th>Reason</th>
                    <th>By</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id} className="table-row">
                      <td>
                        <span className={`movement-type ${m.type === "IN" ? "type-in" : "type-out"}`}>
                          {m.type === "IN" ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          )}
                          Stock {m.type === "IN" ? "In" : "Out"}
                        </span>
                      </td>
                      <td><span className="product-name">{m.product.name}</span></td>
                      <td><code className="sku-badge">{m.product.sku}</code></td>
                      <td>
                        <span className={`qty-badge ${m.type === "IN" ? "qty-in" : "qty-out"}`}>
                          {m.type === "IN" ? "+" : "-"}{m.quantity}
                        </span>
                      </td>
                      <td><span className="reason-text">{m.reason}</span></td>
                      <td><span className="by-text">{m.createdBy.name}</span></td>
                      <td>
                        <div className="date-cell">
                          <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                          <span className="time-text">{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .page { padding: 2rem; max-width: 1200px; margin: 0 auto; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 768px) { .page { padding: 4rem 1rem 1rem; } }

        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
        .page-title { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
        .page-subtitle { color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem; }

        .table-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
        .table-scroll { overflow-x: auto; }
        .table { width: 100%; border-collapse: collapse; min-width: 700px; }
        .table th { padding: 0.875rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); background: var(--bg-secondary); }
        .table td { padding: 0.875rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
        .table-row { transition: background 0.15s; }
        .table-row:hover { background: var(--bg-secondary); }
        .table-row:last-child td { border-bottom: none; }

        .movement-type { display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.8rem; font-weight: 600; padding: 0.3rem 0.65rem; border-radius: 999px; }
        .type-in { background: rgba(16,185,129,0.12); color: var(--green); border: 1px solid rgba(16,185,129,0.25); }
        .type-out { background: rgba(239,68,68,0.12); color: var(--red); border: 1px solid rgba(239,68,68,0.25); }

        .product-name { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); }
        .sku-badge { background: var(--bg-secondary); color: var(--text-secondary); font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-family: monospace; border: 1px solid var(--border); }

        .qty-badge { font-weight: 700; font-size: 0.9rem; }
        .qty-in { color: var(--green); }
        .qty-out { color: var(--red); }

        .reason-text { font-size: 0.85rem; color: var(--text-secondary); max-width: 200px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .by-text { font-size: 0.85rem; color: var(--text-secondary); }

        .date-cell { display: flex; flex-direction: column; }
        .date-cell span:first-child { font-size: 0.85rem; color: var(--text-primary); }
        .time-text { font-size: 0.75rem; color: var(--text-muted); }

        .skeleton { background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-secondary); }

        .pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1rem; border-top: 1px solid var(--border); }
        .pagination-info { font-size: 0.875rem; color: var(--text-muted); }
        .btn { display: inline-flex; align-items: center; gap: 0.5rem; font-family: inherit; font-weight: 600; font-size: 0.875rem; border: none; cursor: pointer; border-radius: var(--radius-sm); padding: 0.65rem 1.25rem; transition: all 0.2s; }
        .btn-sm { padding: 0.45rem 0.875rem; font-size: 0.8rem; }
        .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text-secondary); }
        .btn-ghost:hover:not(:disabled) { background: var(--bg-card-hover); color: var(--text-primary); }
        .btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
