"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface DashboardData {
  totalProducts: number;
  totalCategories: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockValue: number;
  stockByCategory: { name: string; quantity: number; value: number; productCount: number }[];
  recentMovements: {
    id: string;
    type: string;
    quantity: number;
    reason: string;
    createdAt: string;
    product: { name: string };
  }[];
}

const PIE_COLORS = ["#06b6d4", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function SummaryCard({
  title,
  value,
  sub,
  color,
  icon,
}: {
  title: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="summary-card">
      <div className="summary-card-icon" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <div className="summary-card-body">
        <p className="summary-card-title">{title}</p>
        <p className="summary-card-value">{value}</p>
        {sub && <p className="summary-card-sub">{sub}</p>}
      </div>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time overview of your inventory</p>
        </div>
        <span className="page-badge">Live</span>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="summary-card-skeleton" />
          ))
        ) : (
          <>
            <SummaryCard
              title="Total Products"
              value={data?.totalProducts ?? 0}
              sub="across all categories"
              color="#06b6d4"
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M16 3H8L6 7h12l-2-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              }
            />
            <SummaryCard
              title="Total Stock Value"
              value={`$${(data?.totalStockValue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              sub="combined inventory value"
              color="#6366f1"
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 6v2M12 16v2M8.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5M9 15h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              }
            />
            <SummaryCard
              title="Low Stock"
              value={data?.lowStockCount ?? 0}
              sub={`${data?.outOfStockCount ?? 0} out of stock`}
              color="#f59e0b"
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              }
            />
            <SummaryCard
              title="Categories"
              value={data?.totalCategories ?? 0}
              sub="product categories"
              color="#10b981"
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              }
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h2 className="chart-title">Stock by Category</h2>
          {loading ? (
            <Skeleton className="chart-skeleton" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data?.stockByCategory ?? []} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 8, color: "#f1f5f9" }}
                  cursor={{ fill: "rgba(6,182,212,0.06)" }}
                />
                <Bar dataKey="quantity" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Quantity" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Category Distribution</h2>
          {loading ? (
            <Skeleton className="chart-skeleton" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data?.stockByCategory ?? []}
                  dataKey="quantity"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                >
                  {(data?.stockByCategory ?? []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 8, color: "#f1f5f9" }}
                />
                <Legend
                  formatter={(val) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Movements */}
      <div className="section-card">
        <h2 className="chart-title">Recent Stock Movements</h2>
        {loading ? (
          <Skeleton className="chart-skeleton" />
        ) : (data?.recentMovements?.length ?? 0) === 0 ? (
          <p className="empty-state">No stock movements yet.</p>
        ) : (
          <div className="movements-list">
            {data?.recentMovements.map((m) => (
              <div key={m.id} className="movement-row">
                <span className={`movement-badge ${m.type === "IN" ? "badge-in" : "badge-out"}`}>
                  {m.type === "IN" ? "+" : "-"}{m.quantity}
                </span>
                <div className="movement-info">
                  <span className="movement-product">{m.product.name}</span>
                  <span className="movement-reason">{m.reason}</span>
                </div>
                <span className="movement-date">
                  {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 768px) { .page { padding: 4rem 1rem 1rem; } }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        .page-title { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
        .page-subtitle { color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem; }
        .page-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.3);
          color: var(--green);
          border-radius: 999px;
          padding: 0.35rem 0.875rem;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .page-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--green);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 1024px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .summary-grid { grid-template-columns: 1fr; } }

        .summary-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.25rem;
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          transition: all 0.2s;
        }
        .summary-card:hover { border-color: var(--border-focus); transform: translateY(-2px); box-shadow: var(--shadow-glow); }
        .summary-card-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .summary-card-body { flex: 1; min-width: 0; }
        .summary-card-title { font-size: 0.8rem; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
        .summary-card-value { font-size: 1.625rem; font-weight: 700; color: var(--text-primary); margin: 0.25rem 0 0.125rem; line-height: 1; }
        .summary-card-sub { font-size: 0.75rem; color: var(--text-muted); }

        .summary-card-skeleton { height: 100px; border-radius: var(--radius); }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 768px) { .charts-grid { grid-template-columns: 1fr; } }

        .chart-card, .section-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
        }
        .chart-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1.25rem;
        }
        .chart-skeleton { height: 260px; border-radius: var(--radius-sm); }

        .skeleton {
          background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }

        .empty-state { color: var(--text-muted); font-size: 0.875rem; text-align: center; padding: 2rem; }

        .movements-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .movement-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          background: var(--bg-secondary);
          transition: background 0.2s;
        }
        .movement-row:hover { background: var(--bg-card-hover); }
        .movement-badge {
          font-size: 0.8rem;
          font-weight: 700;
          border-radius: 6px;
          padding: 0.3rem 0.6rem;
          min-width: 52px;
          text-align: center;
          flex-shrink: 0;
        }
        .badge-in { background: rgba(16,185,129,0.15); color: var(--green); }
        .badge-out { background: rgba(239,68,68,0.15); color: var(--red); }
        .movement-info { flex: 1; min-width: 0; }
        .movement-product { display: block; font-size: 0.875rem; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .movement-reason { display: block; font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .movement-date { font-size: 0.75rem; color: var(--text-muted); flex-shrink: 0; }
      `}</style>
    </div>
  );
}
